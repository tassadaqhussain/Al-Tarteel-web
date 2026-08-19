"""
Minimal Piper TTS HTTP service.

Speech for word-by-word meanings used to rely on the browser's SpeechSynthesis,
which silently produces nothing for languages the OS has no voice for (Urdu and
Persian on most desktops). This synthesizes those locally instead — no cloud
provider, no API key, no per-request cost.

  GET  /health              -> {"ok": true, "voices": [...]}

Runs on 5062, not 5060: ports 5060/5061 (SIP) are on the WHATWG fetch
blocked-port list, so Node's fetch() rejects them with "bad port".
  POST /synthesize          -> audio/wav
       {"lang": "ur", "text": "..."}

Voices are loaded lazily and kept in memory. The caller (our API) is responsible
for caching results to disk, so this only ever synthesizes on a cache miss.
"""
import json
import os
import io
import wave
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from piper import PiperVoice

VOICE_DIR = os.environ.get("VOICE_DIR", "/voices")
MAX_CHARS = int(os.environ.get("MAX_CHARS", "400"))
PORT = int(os.environ.get("PORT", "5062"))

_voices = {}
_lock = threading.Lock()


def available_langs():
    if not os.path.isdir(VOICE_DIR):
        return []
    return sorted(f[:-5] for f in os.listdir(VOICE_DIR) if f.endswith(".onnx"))


def get_voice(lang):
    with _lock:
        if lang in _voices:
            return _voices[lang]
        path = os.path.join(VOICE_DIR, f"{lang}.onnx")
        if not os.path.isfile(path):
            return None
        _voices[lang] = PiperVoice.load(path)
        return _voices[lang]


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):  # keep container logs quiet
        pass

    def _send(self, code, body: bytes, ctype="application/json"):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith("/health"):
            self._send(200, json.dumps({"ok": True, "voices": available_langs()}).encode())
        else:
            self._send(404, b'{"error":"not found"}')

    def do_POST(self):
        if not self.path.startswith("/synthesize"):
            self._send(404, b'{"error":"not found"}')
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            payload = json.loads(self.rfile.read(length) or b"{}")
        except Exception:
            self._send(400, b'{"error":"invalid json"}')
            return

        text = (payload.get("text") or "").strip()
        lang = (payload.get("lang") or "").strip().lower()
        if not text or not lang:
            self._send(400, b'{"error":"lang and text are required"}')
            return
        if len(text) > MAX_CHARS:
            self._send(413, b'{"error":"text too long"}')
            return

        voice = get_voice(lang)
        if voice is None:
            self._send(404, json.dumps(
                {"error": f"no voice for {lang}", "voices": available_langs()}).encode())
            return

        buf = io.BytesIO()
        with wave.open(buf, "wb") as wav:
            voice.synthesize_wav(text, wav)
        self._send(200, buf.getvalue(), "audio/wav")


if __name__ == "__main__":
    print(f"piper-tts listening on :{PORT} voices={available_langs()}", flush=True)
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
