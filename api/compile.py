"""Vercel serverless endpoint for syntax-only Python compilation."""
from __future__ import annotations

import dis
import json
import platform
from http.server import BaseHTTPRequestHandler

MAX_CODE_BYTES = 32_000


class handler(BaseHTTPRequestHandler):
    def _json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:
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
