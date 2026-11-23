#!/usr/bin/env python3
"""
ChYHab — Local Full-Stack Server (Static + Neural TTS Proxy/Cache + Gemini AI Proxy)
Runs on port 8080 behind ngrok.
"""
import hashlib
import http.server
import json
import os
import re
import socketserver
import urllib.parse
import urllib.request

PORT = 8080
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(ROOT_DIR, ".tts_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

def load_dotenv_key(name: str) -> str:
    val = os.environ.get(name, "").strip()
    if val:
        return val
    env_path = os.path.join(ROOT_DIR, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith(name + "="):
                    return line.split("=", 1)[1].strip()
    return ""


GEMINI_KEY = load_dotenv_key("GEMINI_API_KEY")


def fetch_human_dictionary_mp3(word: str):
    """Try fetching real human studio recording from Dictionary API for single words."""
    clean = word.strip().lower()
    if not re.match(r"^[a-z]+$", clean):
        return None
    try:
        url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{clean}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        audio_urls = []
        for entry in data:
            for ph in entry.get("phonetics", []):
                au = ph.get("audio")
                if au:
                    audio_urls.append(au)
        if not audio_urls:
            return None
        # Prefer US pronunciation audio if available
        chosen = next((u for u in audio_urls if "-us" in u or "_us" in u), audio_urls[0])
        if chosen.startswith("//"):
            chosen = "https:" + chosen
        r2 = urllib.request.Request(chosen, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(r2, timeout=5) as aresp:
            mp3 = aresp.read()
            if len(mp3) > 500:
                return mp3
    except Exception:
        return None
    return None


def fetch_google_neural_tts_mp3(text: str):
    """Fetch natural American English (en-US) Neural TTS MP3 from Google."""
    q = urllib.parse.quote(text.strip()[:200])
    url = f"https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-US&q={q}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        return resp.read()


def get_tts_mp3(text: str) -> bytes:
    norm = re.sub(r"\s+", " ", text.strip())
    key = hashlib.sha256(norm.lower().encode("utf-8")).hexdigest()[:24]
    cache_path = os.path.join(CACHE_DIR, f"{key}.mp3")
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 300:
        with open(cache_path, "rb") as f:
            return f.read()

    # 1. For single words, try studio human dictionary audio first
    mp3 = fetch_human_dictionary_mp3(norm)
    # 2. Fallback to Google Neural en-US TTS
    if not mp3:
        mp3 = fetch_google_neural_tts_mp3(norm)

    if mp3 and len(mp3) > 300:
        with open(cache_path, "wb") as f:
            f.write(mp3)
    return mp3


class ChYHabHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def log_message(self, fmt, *args):
        pass  # Keep logs clean

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/tts":
            params = urllib.parse.parse_qs(parsed.query)
            text = (params.get("text") or [""])[0].strip()
            if not text:
                self.send_error(400, "Missing text")
                return
            try:
                mp3 = get_tts_mp3(text)
                self.send_response(200)
                self.send_header("Content-Type", "audio/mpeg")
                self.send_header("Content-Length", str(len(mp3)))
                self.send_header("Cache-Control", "public, max-age=86400")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(mp3)
            except Exception as e:
                self.send_error(502, f"TTS Error: {e}")
            return

        if parsed.path == "/api/health":
            payload = json.dumps({"ok": True, "tts": "google-neural+dictionary", "cached_files": len(os.listdir(CACHE_DIR))}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/ai-grade":
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                req_data = json.loads(raw)
            except Exception:
                req_data = {}

            sentence = (req_data.get("sentence") or "").strip()
            level = (req_data.get("level") or "A2").strip()
            word = (req_data.get("word") or "experience").strip()

            prompt = (
                f"Bạn là giám khảo chấm viết tiếng Anh CEFR ({level}). "
                f"Sinh viên đặt câu với từ '{word}': \"{sentence}\". "
                f"Hãy chấm điểm và trả về đúng JSON (không markdown) với các trường: "
                f"score (số nguyên 25-98), levelMatch (chuỗi ngắn tiếng Việt), "
                f"grammarStat (nhận xét ngữ pháp ngắn), comment (nhận xét tiếng Việt 1-2 câu), "
                f"suggestion (1 câu tiếng Anh nâng cấp tự nhiên hơn)."
            )

            endpoints = [
                f"https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}",
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}",
            ]
            for ep in endpoints:
                try:
                    body = json.dumps({
                        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                        "generationConfig": {"responseMimeType": "application/json"}
                    }).encode("utf-8")
                    r = urllib.request.Request(ep, data=body, headers={"Content-Type": "application/json"})
                    with urllib.request.urlopen(r, timeout=8) as resp:
                        out = json.loads(resp.read().decode("utf-8"))
                        txt = out["candidates"][0]["content"]["parts"][0]["text"]
                        parsed_json = json.loads(txt)
                        parsed_json["source"] = "google-ai-studio"
                        res_bytes = json.dumps(parsed_json).encode("utf-8")
                        self.send_response(200)
                        self.send_header("Content-Type", "application/json")
                        self.send_header("Content-Length", str(len(res_bytes)))
                        self.end_headers()
                        self.wfile.write(res_bytes)
                        return
                except Exception:
                    continue

            # Fallback response tells frontend to use built-in CEFR NLP analyzer
            fb = json.dumps({"fallback": True}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(fb)))
            self.end_headers()
            self.wfile.write(fb)
            return

        self.send_error(404, "Not found")


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with ThreadedHTTPServer(("", PORT), ChYHabHandler) as httpd:
        print(f"ChYHab Full-Stack Server listening on http://localhost:{PORT}", flush=True)
        httpd.serve_forever()
