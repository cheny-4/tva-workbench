"""Real loopback collision tests. Never stop another process or open a browser."""
import contextlib
import errno
import http.client
import io
import json
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from unittest import mock
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server


class LauncherTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / "Workbench with spaces"
        self.root.mkdir()
        (self.root / "public").mkdir()
        (self.root / "public/index.html").write_text("<h1>Current copy</h1>")
        (self.root / "server.py").write_text("current test build")
        self.listeners = []
        self.bound = []

    def tearDown(self):
        for listener in self.listeners:
            listener.shutdown()
            listener.server_close()
        for listener in self.bound:
            listener.server_close()
        self.temp.cleanup()

    def serve(self, listener):
        self.listeners.append(listener)
        threading.Thread(target=listener.serve_forever, daemon=True).start()
        return listener

    def peer(self, payload):
        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args):
                pass

            def do_GET(self):
                body = json.dumps(payload).encode()
                self.send_response(200)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
        return self.serve(ThreadingHTTPServer(("127.0.0.1", 0), Handler))

    def prepare(self, port, root=None):
        with contextlib.redirect_stdout(io.StringIO()):
            listener, actual = server.prepare_server(port, root=root or self.root)
        if listener is not None:
            self.bound.append(listener)
        return listener, actual

    def health(self, port):
        connection = http.client.HTTPConnection("127.0.0.1", port, timeout=2)
        connection.request("GET", "/api/health")
        response = connection.getresponse()
        body = json.loads(response.read())
        connection.close()
        return body

    def test_old_version_keeps_running_while_new_copy_gets_available_port(self):
        old = self.peer({"app": "tva-workbench", "version": "0.4.0"})
        listener, port = self.prepare(old.server_port)
        self.assertIsNotNone(listener)
        self.assertNotEqual(port, old.server_port)
        self.assertEqual(self.health(old.server_port)["version"], "0.4.0")

    def test_same_version_different_folder_is_never_reused(self):
        other_root = Path(self.temp.name) / "Other copy"
        other_root.mkdir()
        other = self.serve(server.create_server(0, root=other_root, persist=False))
        listener, port = self.prepare(other.server_port)
        self.assertIsNotNone(listener)
        self.assertNotEqual(port, other.server_port)
        self.assertNotEqual(listener.app.instance_id, other.app.instance_id)

    def test_exact_folder_build_and_connection_are_reused(self):
        current = self.serve(server.create_server(0, root=self.root, persist=False))
        listener, port = self.prepare(current.server_port)
        self.assertIsNone(listener)
        self.assertEqual(port, current.server_port)
        self.assertNotIn(str(self.root), json.dumps(self.health(port)))

    def test_different_explicit_project_does_not_reuse_existing_connection(self):
        current = self.serve(server.create_server(0, root=self.root, project="Other_Project", persist=False))
        listener, port = self.prepare(current.server_port)
        self.assertIsNotNone(listener)
        self.assertNotEqual(port, current.server_port)

    def test_unrelated_app_is_untouched_and_fallback_is_remembered(self):
        unrelated = self.peer({"app": "other-tool"})
        listener, port = self.prepare(unrelated.server_port)
        self.bound.remove(listener)
        self.serve(listener)
        again, reused_port = self.prepare(unrelated.server_port)
        self.assertIsNone(again)
        self.assertEqual(reused_port, port)
        self.assertEqual(self.health(unrelated.server_port)["app"], "other-tool")
        self.assertEqual((self.root / ".local/instance.json").stat().st_mode & 0o777, 0o600)

    def test_only_address_in_use_errors_trigger_fallback(self):
        with mock.patch.object(server, "create_server", side_effect=PermissionError(errno.EACCES, "Denied")) as create:
            with self.assertRaises(PermissionError):
                self.prepare(8765)
        self.assertEqual(create.call_count, 1)

    def test_runtime_port_record_requires_matching_build_and_preferred_port(self):
        record = self.root / ".local/instance.json"
        record.parent.mkdir()
        identity = server.workbench_identity(self.root)
        for data in [
            {"version": server.VERSION, "instance_id": identity, "preferred_port": 8765, "port": True},
            {"version": server.VERSION, "instance_id": "other", "preferred_port": 8765, "port": 12345},
            {"version": server.VERSION, "instance_id": identity, "preferred_port": 8766, "port": 12345},
            {"version": "0.4.0", "instance_id": identity, "preferred_port": 8765, "port": 12345},
        ]:
            record.write_text(json.dumps(data))
            self.assertIsNone(server.remembered_port(self.root, 8765, identity))

    def test_browser_failure_prints_usable_url(self):
        for behavior in [False, RuntimeError("Browser unavailable")]:
            stream = io.StringIO()
            options = {"side_effect": behavior} if isinstance(behavior, Exception) else {"return_value": behavior}
            with mock.patch.object(server.webbrowser, "open_new_tab", **options), contextlib.redirect_stderr(stream):
                self.assertFalse(server.open_browser("http://127.0.0.1:12345"))
            self.assertIn("http://127.0.0.1:12345", stream.getvalue())

    def test_no_browser_reopen_uses_actual_url_and_does_not_call_browser(self):
        output = io.StringIO()
        with mock.patch.object(server, "prepare_server", return_value=(None, 12345)), \
                mock.patch.object(server, "open_browser") as browser, contextlib.redirect_stdout(output):
            self.assertEqual(server.main(["--no-browser"], root=self.root), 0)
        browser.assert_not_called()
        self.assertIn("http://127.0.0.1:12345", output.getvalue())
        self.assertIn(server.VERSION, output.getvalue())

    def test_no_browser_new_server_stays_in_foreground_and_closes_cleanly(self):
        listener = mock.Mock()
        listener.app.instance_id = "test-instance"
        listener.serve_forever.side_effect = KeyboardInterrupt
        output = io.StringIO()
        with mock.patch.object(server, "prepare_server", return_value=(listener, 12345)), \
                mock.patch.object(server, "open_browser") as browser, \
                mock.patch.object(server.threading, "Timer") as timer, contextlib.redirect_stdout(output):
            self.assertEqual(server.main(["--no-browser"], root=self.root), 0)
        browser.assert_not_called()
        timer.assert_not_called()
        listener.serve_forever.assert_called_once_with()
        listener.server_close.assert_called_once_with()
        self.assertIn("http://127.0.0.1:12345", output.getvalue())

    def test_reopen_requests_new_browser_tab_at_actual_fallback_url(self):
        with mock.patch.object(server, "prepare_server", return_value=(None, 12345)), \
                mock.patch.object(server, "open_browser") as browser, contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(server.main([], root=self.root), 0)
        browser.assert_called_once_with("http://127.0.0.1:12345")


if __name__ == "__main__":
    unittest.main()
