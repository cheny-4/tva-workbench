#!/bin/sh
# Double-click on macOS. No npm, pip or package installation is needed.
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)" || exit 1
TVA_PYTHON=""
for candidate in /Applications/VISTA/python/*/bin/python3 /Applications/VISTA/python/*/bin/python3.[0-9]* /opt/homebrew/bin/python3 /usr/local/bin/python3 /usr/bin/python3; do
  if [ -x "$candidate" ] && "$candidate" -c 'import sys; sys.exit(0 if sys.version_info >= (3,9) else 1)' 2>/dev/null; then
    TVA_PYTHON="$candidate"
    break
  fi
done
if [ -z "$TVA_PYTHON" ] && command -v python3 >/dev/null 2>&1; then
  TVA_PYTHON="$(command -v python3)"
fi
if [ -z "$TVA_PYTHON" ]; then
  printf '%s\n' 'Python 3.9 or later is required. Install VISTA or Python from python.org, then open this launcher again.'
  printf '%s' 'Press Return to close… '
  read TVA_UNUSED
  exit 1
fi
"$TVA_PYTHON" server.py "$@"
TVA_EXIT=$?
if [ "$TVA_EXIT" -ne 0 ]; then
  printf '%s' 'Press Return to close… '
  read TVA_UNUSED
fi
exit "$TVA_EXIT"
