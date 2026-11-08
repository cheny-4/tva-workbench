"""Contract and isolation checks using a fake VISTA backend; no live jobs."""
import http.client
import json
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from server import create_server, valid_backend


class FakeVista(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    calls = []
    release_stream = threading.Event()

    def log_message(self, *args):
        pass

    def reply(self, status, payload):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        self.calls.append(("GET", self.path, None))
        if self.path == "/projects/Genesis_Water4Energy":
            self.reply(200, {"name": "Genesis_Water4Energy", "skills": ["tva-weekly-inflow-path2"], "system_prompt": "not sent by status"})
        elif self.path == "/projects/Missing_Project":
            self.reply(404, {"detail": "Project not found"})
        elif self.path == "/projects/TVA_MissingDetail":
            self.reply(200, {"name": "TVA_MissingDetail", "skills": ["tva-unavailable", "../outside"]})
        elif self.path == "/skills/tva-weekly-inflow-path2":
            self.reply(200, {"name": "tva-weekly-inflow-path2", "description": "Saved TVA inference on Frontier.", "body": "# TVA inference\nInspect inputs, then run the saved model.", "hpc_jobs": ["infer"], "bundled": False, "path": "/private/not-exposed", "unrelated_metadata": "not-exposed"})
        elif self.path == "/skills/tva-unavailable":
            self.reply(404, {"detail": "Skill is unavailable"})
        elif self.path == "/skills":
            self.reply(200, [{"name": "unrelated-alloy-skill"}, {"name": "tva-weekly-inflow-path2"}])
        elif self.path == "/settings/hpc-status":
            self.reply(200, {"clusters": [{"cluster": "frontier", "state": "ready", "checked_at": "2026-11-06", "checks": {"settings": {"ok": True}}}]})
        elif self.path.endswith("/outputs/redirect.txt"):
            self.send_response(302)
            self.send_header("Location", "http://example.com/never-follow")
            self.send_header("Content-Length", "0")
            self.end_headers()
        else:
            self.reply(200, [{"name": "results.json", "size": 34}])

    def do_POST(self):
        body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
        self.calls.append(("POST", self.path, body))
        if self.path.endswith("/agent/run"):
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(b'event: run_started\nid: 1\ndata: {"run_id":"test"}\n\n')
            self.wfile.flush()
            self.release_stream.wait(timeout=5)
            self.wfile.write(b'event: run_finished\nid: 2\ndata: {"state":"done"}\n\n')
            self.close_connection = True
        else:
            self.reply(201, {"id": "10000000-0000-0000-0000-000000000001", "title": "TVA demo"})


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        root = Path(cls.temp.name)
        (root / "public").mkdir()
        (root / "public" / "index.html").write_text("<h1>TVA demo</h1>")
        (root / "secret.txt").write_text("do not serve")
        cls.upstream = ThreadingHTTPServer(("127.0.0.1", 0), FakeVista)
        cls.upstream.daemon_threads = True
        threading.Thread(target=cls.upstream.serve_forever, daemon=True).start()
        cls.backend_url = "http://127.0.0.1:{}".format(cls.upstream.server_port)
        cls.wrapper = create_server(0, root=root, backend_url=cls.backend_url, persist=False)
        threading.Thread(target=cls.wrapper.serve_forever, daemon=True).start()
        cls.port = cls.wrapper.server_port

    @classmethod
    def tearDownClass(cls):
        FakeVista.release_stream.set()
        cls.wrapper.shutdown()
        cls.wrapper.server_close()
        cls.upstream.shutdown()
        cls.upstream.server_close()
        cls.temp.cleanup()

    def request(self, method, path, body=None, headers=None):
        connection = http.client.HTTPConnection("127.0.0.1", self.port, timeout=4)
        if isinstance(body, dict):
            body = json.dumps(body)
            headers = dict(headers or {}, **{"Content-Type": "application/json"})
        connection.request(method, path, body=body, headers=headers or {})
        response = connection.getresponse()
        result = response.status, response.read(), dict(response.getheaders())
        connection.close()
        return result

    def test_static_and_health(self):
        status, body, headers = self.request("GET", "/")
        self.assertEqual(status, 200)
        self.assertIn(b"TVA demo", body)
        self.assertIn("script-src 'self'", headers["Content-Security-Policy"])
        status, body, _ = self.request("GET", "/api/health")
        self.assertEqual(json.loads(body)["app"], "tva-workbench")

    def test_status_normalizes_resources_and_does_not_return_prompt(self):
        status, body, _ = self.request("GET", "/api/status")
        payload = json.loads(body)
        self.assertTrue(payload["connected"])
        self.assertTrue(payload["project_found"])
        self.assertEqual(payload["skills"], ["tva-weekly-inflow-path2"])
        self.assertNotIn("system_prompt", payload)
        resources = {x["id"]: x for x in payload["resources"]}
        self.assertEqual(resources["frontier"]["state"], "ready")
        self.assertEqual(resources["ccsi"]["state"], "planned")

    def test_explicit_status_refresh_bypasses_wrapper_cache(self):
        self.request("GET", "/api/status")
        calls_before = len(FakeVista.calls)
        self.request("GET", "/api/status")
        self.assertEqual(len(FakeVista.calls), calls_before)
        self.request("GET", "/api/status?fresh=1")
        self.assertGreater(len(FakeVista.calls), calls_before)

    def test_skills_only_return_selected_project_loaded_details(self):
        calls_before = len(FakeVista.calls)
        code, body, _ = self.request("GET", "/api/skills?fresh=1")
        result = json.loads(body)
        self.assertEqual(code, 200)
        self.assertTrue(result["connected"])
        self.assertTrue(result["project_found"])
        self.assertEqual(result["count"], 1)
        self.assertEqual([s["name"] for s in result["skills"]], ["tva-weekly-inflow-path2"])
        skill = result["skills"][0]
        self.assertTrue(skill["loaded"])
        self.assertTrue(skill["detail_available"])
        self.assertEqual(skill["hpc_jobs"], ["infer"])
        self.assertIn("Inspect inputs", skill["body"])
        self.assertNotIn("private", body.decode())
        self.assertNotIn("unrelated", body.decode())
        self.assertFalse(any(path == "/skills" for method, path, _ in FakeVista.calls[calls_before:]))

    def test_skills_refresh_and_project_change_invalidate_cache(self):
        self.request("GET", "/api/skills?fresh=1")
        before = len(FakeVista.calls)
        self.request("GET", "/api/skills")
        self.assertEqual(len(FakeVista.calls), before)
        self.request("GET", "/api/skills?fresh=1")
        self.assertGreater(len(FakeVista.calls), before)
        try:
            self.request("POST", "/api/config", {"project": "Missing_Project"})
            _, body, _ = self.request("GET", "/api/skills")
            payload = json.loads(body)
            self.assertTrue(payload["connected"])
            self.assertFalse(payload["project_found"])
            self.assertIsNone(payload["count"])
            self.assertEqual(payload["skills"], [])
        finally:
            self.request("POST", "/api/config", {"project": "Genesis_Water4Energy"})

    def test_skills_offline_is_unknown_not_zero(self):
        try:
            self.request("POST", "/api/config", {"backend_url": "http://127.0.0.1:1"})
            _, body, _ = self.request("GET", "/api/skills?fresh=1")
            payload = json.loads(body)
            self.assertFalse(payload["connected"])
            self.assertFalse(payload["project_found"])
            self.assertIsNone(payload["count"])
            self.assertEqual(payload["skills"], [])
        finally:
            self.request("POST", "/api/config", {"backend_url": self.backend_url})

    def test_missing_skill_detail_keeps_loaded_count_without_fetching_unsafe_path(self):
        try:
            self.request("POST", "/api/config", {"project": "TVA_MissingDetail"})
            before = len(FakeVista.calls)
            _, body, _ = self.request("GET", "/api/skills?fresh=1")
            payload = json.loads(body)
            self.assertEqual(payload["count"], 2)
            self.assertEqual(len(payload["skills"]), 2)
            self.assertTrue(all(not x["detail_available"] for x in payload["skills"]))
            self.assertFalse(any("outside" in path for method, path, _ in FakeVista.calls[before:]))
        finally:
            self.request("POST", "/api/config", {"project": "Genesis_Water4Energy"})

    def test_scoped_proxy_forwards_files(self):
        status, body, _ = self.request("GET", "/api/vista/projects/Genesis_Water4Energy/outputs")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)[0]["name"], "results.json")

    def test_project_and_global_routes_are_blocked(self):
        for path in ("/api/vista/settings", "/api/vista/projects", "/api/vista/projects/other/outputs", "/api/vista/projects/Genesis_Water4EnergyExtra/outputs"):
            with self.subTest(path=path):
                status, _, _ = self.request("GET", path)
                self.assertEqual(status, 403)

    def test_traversal_and_double_encoding_blocked(self):
        for path in ("/../secret.txt", "/%2e%2e/secret.txt", "/%252e%252e/secret.txt", "/api/vista/projects/Genesis_Water4Energy/outputs/../../settings"):
            status, body, _ = self.request("GET", path)
            self.assertIn(status, (400, 404))
            self.assertNotIn(b"do not serve", body)

    def test_external_origins_and_hosts_blocked(self):
        status, _, _ = self.request("POST", "/api/config", {"project": "another"}, {"Origin": "https://foreign.example"})
        self.assertEqual(status, 403)
        status, _, _ = self.request("GET", "/api/config", headers={"Host": "foreign.example"})
        self.assertEqual(status, 403)

    def test_remote_and_secret_config_rejected(self):
        for value in ({"backend_url": "http://example.com:8001"}, {"backend_url": "http://127.0.0.1:8001@evil.test"}, {"backend_url": "http://127.0.0.1:8001/elsewhere"}, {"token": "never-save"}, {"project": "bad/name"}):
            status, _, _ = self.request("POST", "/api/config", value)
            self.assertEqual(status, 400)

    def test_multipart_is_forwarded_verbatim(self):
        body = b'--fixture\r\nContent-Disposition: form-data; name="files"; filename="input.csv"\r\nContent-Type: text/csv\r\n\r\na,b\n1,2\r\n--fixture--\r\n'
        status, _, _ = self.request("POST", "/api/vista/projects/Genesis_Water4Energy/uploads", body, {"Content-Type": "multipart/form-data; boundary=fixture"})
        self.assertEqual(status, 201)
        self.assertEqual(FakeVista.calls[-1][2], body)

    def test_direct_tool_submission_is_blocked(self):
        status, _, _ = self.request("POST", "/api/vista/projects/Genesis_Water4Energy/mcp/call", {"name": "submit_hpc_job", "arguments": {}})
        self.assertEqual(status, 400)

    def test_backend_redirect_not_followed(self):
        status, _, _ = self.request("GET", "/api/vista/projects/Genesis_Water4Energy/outputs/redirect.txt")
        self.assertEqual(status, 502)

    def test_sse_is_flushed_before_completion(self):
        FakeVista.release_stream.clear()
        connection = http.client.HTTPConnection("127.0.0.1", self.port, timeout=2)
        connection.request("POST", "/api/vista/projects/Genesis_Water4Energy/agent/run", body=b'{"stream":true}', headers={"Content-Type": "application/json"})
        response = connection.getresponse()
        self.assertEqual(response.status, 200)
        self.assertEqual(response.readline(), b"event: run_started\n")
        self.assertFalse(FakeVista.release_stream.is_set())
        FakeVista.release_stream.set()
        self.assertIn(b"run_finished", response.read())
        connection.close()

    def test_url_validation(self):
        self.assertEqual(valid_backend("http://localhost:8001/"), "http://localhost:8001")
        self.assertEqual(valid_backend("http://[::1]:8001"), "http://[::1]:8001")
        for value in ("file:///etc/passwd", "https://localhost:8001", "http://192.168.1.1:8001", "http://[::ffff:192.168.1.1]:8001"):
            with self.assertRaises(ValueError):
                valid_backend(value)


if __name__ == "__main__":
    unittest.main()
