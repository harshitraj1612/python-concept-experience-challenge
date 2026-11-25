#!/usr/bin/env python3
"""Local web host and syntax-only Python compiler for the topic demos."""
from __future__ import annotations

import dis
import json
import os
import platform
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
HOST = "0.0.0.0" if "PORT" in os.environ else "127.0.0.1"
PORT = int(os.environ.get("PORT", "8765"))
MAX_CODE_BYTES = 32_000


class TopicHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        super().end_headers()

    def _json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if urlparse(self.path).path != "/api/compile":
            self._json(404, {"ok": False, "message": "Unknown endpoint."})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_CODE_BYTES:
            self._json(413, {"ok": False, "message": "Code must be between 1 and 32,000 bytes."})
            return
        try:
            payload = json.loads(self.rfile.read(length))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._json(400, {"ok": False, "message": "Send valid JSON containing a code string."})
            return
        source = payload.get("code") if isinstance(payload, dict) else None
        if not isinstance(source, str) or not source.strip():
            self._json(400, {"ok": False, "message": "Enter Python code before compiling."})
            return
        if len(source.encode("utf-8")) > MAX_CODE_BYTES:
            self._json(413, {"ok": False, "message": "Code is too large (32,000 byte limit)."})
            return
        try:
            code_object = compile(source, "<topic-editor>", "exec", dont_inherit=True)
            instruction_count = sum(1 for _ in dis.get_instructions(code_object))
        except SyntaxError as error:
            self._json(200, {
                "ok": False,
                "message": error.msg,
                "line": error.lineno,
                "column": error.offset,
            })
            return
        except (ValueError, TypeError, MemoryError, RecursionError) as error:
            self._json(200, {"ok": False, "message": f"Could not compile this input: {error.__class__.__name__}."})
            return
        self._json(200, {
            "ok": True,
            "python": platform.python_version(),
            "instructions": instruction_count,
            "message": "Compilation succeeded. Code was syntax-checked and compiled to Python bytecode; it was not executed.",
        })


def main():
    print(f"Topic pages: http://{HOST}:{PORT}/")
    print("Compile endpoint: /api/compile (syntax and bytecode compilation only)")
    print("Stop with Ctrl+C.")
    ThreadingHTTPServer((HOST, PORT), TopicHandler).serve_forever()


if __name__ == "__main__":
    main()
