#!/usr/bin/env python3
"""
Persistent Argos Translate subprocess.

Protocol (line-delimited over stdin/stdout):
  stdin:  one base64-encoded UTF-8 string per line (lets text contain newlines)
  stdout: one base64-encoded translation per line, in the same order

Usage: python argos_server.py <from_lang> <to_lang>

First run downloads the ~100MB language package; subsequent runs reuse it.
"""
import sys, base64, argostranslate.package, argostranslate.translate

if len(sys.argv) != 3:
    sys.stderr.write("usage: argos_server.py <from> <to>\n")
    sys.exit(1)

FROM, TO = sys.argv[1], sys.argv[2]

# Ensure the language pack is installed.
installed = argostranslate.package.get_installed_packages()
if not any(p.from_code == FROM and p.to_code == TO for p in installed):
    sys.stderr.write(f"[argos] downloading {FROM}->{TO} language package...\n")
    sys.stderr.flush()
    argostranslate.package.update_package_index()
    available = argostranslate.package.get_available_packages()
    pkg = next((p for p in available if p.from_code == FROM and p.to_code == TO), None)
    if pkg is None:
        sys.stderr.write(f"[argos] no package for {FROM}->{TO}\n")
        sys.exit(2)
    argostranslate.package.install_from_path(pkg.download())
    sys.stderr.write("[argos] language package installed\n")
    sys.stderr.flush()

sys.stderr.write("[argos] ready\n")
sys.stderr.flush()

# Unbuffered line-oriented loop.
for line in sys.stdin:
    line = line.rstrip("\n")
    if not line:
        print("", flush=True)
        continue
    try:
        text = base64.b64decode(line).decode("utf-8")
        out = argostranslate.translate.translate(text, FROM, TO)
        print(base64.b64encode(out.encode("utf-8")).decode("ascii"), flush=True)
    except Exception as e:
        sys.stderr.write(f"[argos] error: {e}\n")
        sys.stderr.flush()
        # Return original text base64'd so the Node side gets something back
        print(line, flush=True)
