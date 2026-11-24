#!/usr/bin/env python3
"""
ChYHab — Ultra-Low-Latency Full-Stack Server
- Static Web App
- Studio Dictionary + Google Neural TTS Proxy & Disk Cache
- Real-Time Gemini 3.5 Flash-Lite Voice Conversation (/api/live-chat) with inline Base64 MP3
"""
import base64
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


def fetch_human_dictionary_mp3(word: str):
    clean = word.strip().lower()
    if not re.match(r"^[a-z]+$", clean):
        return None
    try:
        url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{clean}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        audio_urls = []
        for entry in data:
            for ph in entry.get("phonetics", []):
                au = ph.get("audio")
                if au:
                    audio_urls.append(au)
        if not audio_urls:
            return None
        chosen = next((u for u in audio_urls if "-us" in u or "_us" in u), audio_urls[0])
        if chosen.startswith("//"):
            chosen = "https:" + chosen
        r2 = urllib.request.Request(chosen, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(r2, timeout=4) as aresp:
            mp3 = aresp.read()
            if len(mp3) > 500:
                return mp3
    except Exception:
        return None
    return None


def split_tts_chunks(text: str, max_len: int = 175) -> list:
    clean = re.sub(r"\s+", " ", text.strip())
    if len(clean) <= max_len:
        return [clean] if clean else []
    # Split by sentence boundaries first, then clauses/words if a sentence is still > max_len
    parts = re.split(r"(?<=[.!?;,])\s+", clean)
    chunks = []
    cur = ""
    for p in parts:
        while len(p) > max_len:
            cut = p.rfind(" ", 0, max_len)
            if cut <= 0:
                cut = max_len
            if cur:
                chunks.append(cur.strip())
                cur = ""
            chunks.append(p[:cut].strip())
            p = p[cut:].strip()
        if not cur:
            cur = p
        elif len(cur) + 1 + len(p) <= max_len:
            cur += " " + p
        else:
            chunks.append(cur.strip())
            cur = p
    if cur:
        chunks.append(cur.strip())
    return chunks


def fetch_google_neural_tts_mp3(text: str, tl: str = "en-US"):
    chunks = split_tts_chunks(text, max_len=175)
    mp3_parts = []
    for ch in chunks[:6]:
        q = urllib.parse.quote(ch)
        url = f"https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl={tl}&q={q}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            mp3_parts.append(resp.read())
    return b"".join(mp3_parts)


def get_tts_mp3(text: str, accent: str = "en-US") -> bytes:
    norm = re.sub(r"\s+", " ", text.strip())
    key = hashlib.sha256(f"{accent}:{norm.lower()}".encode("utf-8")).hexdigest()[:24]
    cache_path = os.path.join(CACHE_DIR, f"{key}.mp3")
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 300:
        with open(cache_path, "rb") as f:
            return f.read()

    mp3 = fetch_human_dictionary_mp3(norm)
    if not mp3:
        mp3 = fetch_google_neural_tts_mp3(norm, tl=accent)

    if mp3 and len(mp3) > 300:
        with open(cache_path, "wb") as f:
            f.write(mp3)
    return mp3


def call_gemini_fast_json(prompt: str, custom_key: str = ""):
    """Sub-second Gemini 3.5 Flash-Lite call (single fast attempt, max 2.8s cap)."""
    key = (custom_key or load_dotenv_key("GEMINI_API_KEY")).strip()
    if not key:
        return None

    m = "gemini-3.5-flash-lite"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={key}"
    try:
        body = json.dumps({
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.65,
                "maxOutputTokens": 220
            }
        }).encode("utf-8")
        r = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(r, timeout=2.8) as resp:
            out = json.loads(resp.read().decode("utf-8"))
            txt = out["candidates"][0]["content"]["parts"][0]["text"].strip()
            txt = re.sub(r"^```(?:json)?\s*|\s*```$", "", txt, flags=re.IGNORECASE).strip()
            parsed = json.loads(txt)
            if isinstance(parsed, dict):
                if "suggestions" in parsed and not isinstance(parsed["suggestions"], list):
                    parsed["suggestions"] = [str(parsed["suggestions"])]
                parsed["modelUsed"] = m
                return parsed
    except Exception:
        return None


def generate_sesame_contextual_reply(user_msg: str, scenario: str, persona: str, turn_idx: int) -> dict:
    msg = (user_msg or "").strip()
    lower = msg.lower()
    words = [w for w in re.findall(r"[a-zA-Z']+", msg)]
    word_count = len(words)
    speaker = "Maya" if persona != "miles" else "Miles"

    has_advanced = bool(re.search(r"\b(syllabus|curriculum|methodology|collaborate|experience|effectively|furthermore|however|although|deadline|presentation|research|innovation|confident|definitely|personally)\b", lower))
    if word_count >= 12 and has_advanced:
        cefr = "B2–C1"
        feedback = "Ngữ điệu tự nhiên, cấu trúc câu phức và từ vựng học thuật rất tốt!"
        better_say = msg if msg.endswith((".", "!", "?")) else msg + "."
    elif word_count >= 6:
        cefr = "B1+"
        feedback = "Diễn đạt rõ ý! Có thể nối thêm 'because' hoặc 'which helps me...' để lên B2."
        better_say = f"Honestly, {msg[0].lower() + msg[1:] if len(msg) > 1 else msg}, which really helps me improve."
    else:
        cefr = "A2–B1"
        feedback = "Phản xạ tốt! Hãy thử mở rộng thành 1–2 câu đầy đủ kèm lý do."
        better_say = "Well, from my perspective, practicing English daily makes a big difference."

    if re.search(r"\b(hello|hi|hey|good morning|good evening|how are you)\b", lower):
        reply_en = f"Hey! I'm {speaker}. It's great to hear your voice—what would you like to talk about today?"
        reply_vi = f"Chào bạn! Mình là {speaker}. Rất vui được nghe giọng bạn — hôm nay bạn muốn trò chuyện về chủ đề gì?"
        suggestions = [
            "I'm preparing for my B2 speaking exam at university.",
            "I had a busy day with group assignments.",
            "Let's practice a quick job interview together."
        ]
    elif re.search(r"\b(stress|tired|busy|deadline|hard|difficult|nervous)\b", lower):
        reply_en = "Oh, I totally get that—university deadlines can be intense! What's the biggest task you're working on right now?"
        reply_vi = "Ồ, mình hoàn toàn hiểu — deadline đại học đôi khi rất căng! Việc lớn nhất bạn đang làm lúc này là gì?"
        suggestions = [
            "I have an English presentation tomorrow morning.",
            "I need to review grammar and vocabulary for finals."
        ]
    else:
        reply_en = "That's a really interesting point! Could you tell me a little more about why you feel that way?"
        reply_vi = "Ý đó thú vị thật đấy! Bạn có thể chia sẻ thêm một chút lý do bạn nghĩ vậy không?"
        suggestions = [
            "Because practicing every day builds real confidence.",
            "In my experience, learning with examples is much faster."
        ]

    return {
        "replyEn": reply_en,
        "replyVi": reply_vi,
        "cefr": cefr,
        "feedback": feedback,
        "betterSay": better_say,
        "suggestions": suggestions,
        "source": "sesame-fallback"
    }


class ChYHabHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/tts":
            params = urllib.parse.parse_qs(parsed.query)
            text = (params.get("text") or [""])[0].strip()
            accent = (params.get("accent") or ["en-US"])[0].strip()
            if not text:
                self.send_error(400, "Missing text")
                return
            try:
                mp3 = get_tts_mp3(text, accent=accent)
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
            payload = json.dumps({
                "ok": True,
                "model": "gemini-3.5-flash-lite",
                "cached_files": len(os.listdir(CACHE_DIR))
            }).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            req_data = json.loads(raw)
        except Exception:
            req_data = {}

        if parsed.path == "/api/live-chat":
            user_msg = (req_data.get("message") or "").strip()
            scenario = (req_data.get("scenario") or "free").strip()
            persona = (req_data.get("persona") or "maya").strip()
            turn_idx = int(req_data.get("turn") or 0)
            history = req_data.get("history") or []
            custom_key = (req_data.get("apiKey") or "").strip()
            speaker = "Maya" if persona != "miles" else "Miles"

            hist_str = "\n".join(
                f"{'Student' if h.get('role') == 'user' else speaker}: {h.get('text', '')}"
                for h in history[-4:]
            )

            prompt = (
                f"You are {speaker}, a warm, natural real-time spoken English companion (like Sesame AI) "
                f"talking live with a Vietnamese university student (scenario: {scenario}).\n"
                f"Recent conversation:\n{hist_str}\n"
                f"Student just said: \"{user_msg}\"\n"
                f"Return ONLY valid JSON with exact keys:\n"
                f"- replyEn: 1-2 short natural spoken English sentences (max 28 words total, warm human tone, end with a natural follow-up question)\n"
                f"- replyVi: concise Vietnamese translation of replyEn\n"
                f"- cefr: student's speaking level (A2, B1, B1+, B2, or C1)\n"
                f"- feedback: 1 short helpful tip in Vietnamese\n"
                f"- betterSay: a natural B2 English phrasing of what the student meant\n"
                f"- suggestions: array of 2 short English replies the student could say next"
            )

            result = call_gemini_fast_json(prompt, custom_key=custom_key)
            if not result or not result.get("replyEn"):
                result = generate_sesame_contextual_reply(user_msg, scenario, persona, turn_idx)
            else:
                result["source"] = result.get("modelUsed", "gemini-3.5-flash-lite")

            # Embed MP3 audio directly as Base64 so playback starts in 0ms with zero autoplay/CORS/ngrok issues!
            accent = "en-US" if persona != "miles" else "en-GB"
            try:
                mp3_bytes = get_tts_mp3(result["replyEn"], accent=accent)
                if mp3_bytes:
                    result["audioBase64"] = base64.b64encode(mp3_bytes).decode("ascii")
            except Exception:
                pass

            res_bytes = json.dumps(result).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(res_bytes)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(res_bytes)
            return

        if parsed.path == "/api/ai-grade":
            sentence = (req_data.get("sentence") or "").strip()
            level = (req_data.get("level") or "A2").strip()
            word = (req_data.get("word") or "experience").strip()
            prompt = (
                f"Bạn là giám khảo chấm viết tiếng Anh CEFR ({level}). "
                f"Sinh viên đặt câu với từ '{word}': \"{sentence}\". "
                f"Trả về JSON: score (25-98), levelMatch, grammarStat, comment, suggestion."
            )
            result = call_gemini_fast_json(prompt)
            if result and result.get("score"):
                result["source"] = result.get("modelUsed", "gemini-3.5-flash-lite")
                res_bytes = json.dumps(result).encode("utf-8")
            else:
                res_bytes = json.dumps({"fallback": True}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(res_bytes)))
            self.end_headers()
            self.wfile.write(res_bytes)
            return

        self.send_error(404, "Not found")


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with ThreadedHTTPServer(("", PORT), ChYHabHandler) as httpd:
        print(f"ChYHab Ultra-Fast Server listening on http://localhost:{PORT}", flush=True)
        httpd.serve_forever()
