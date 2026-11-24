#!/usr/bin/env python3
"""
ChYHab — Local Full-Stack Server (Static + Neural TTS Proxy/Cache + Sesame-Style Live Voice AI)
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


def fetch_google_neural_tts_mp3(text: str, tl: str = "en-US"):
    """Fetch natural English Neural TTS MP3 from Google, chunking if needed."""
    clean = re.sub(r"\s+", " ", text.strip())[:200]
    q = urllib.parse.quote(clean)
    url = f"https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl={tl}&q={q}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        return resp.read()


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


def call_gemini_json(prompt: str, custom_key: str = ""):
    """Call Google Gemini Flash model (supports both AI Studio and Vertex Express keys)."""
    key = (custom_key or GEMINI_KEY).strip()
    if not key:
        return None
    models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    for m in models:
        endpoints = [
            f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={key}",
            f"https://aiplatform.googleapis.com/v1/publishers/google/models/{m}:generateContent?key={key}"
        ]
        for ep in endpoints:
            try:
                body = json.dumps({
                    "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                    "generationConfig": {"responseMimeType": "application/json", "temperature": 0.7}
                }).encode("utf-8")
                r = urllib.request.Request(ep, data=body, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(r, timeout=7) as resp:
                    out = json.loads(resp.read().decode("utf-8"))
                    txt = out["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(txt)
            except Exception:
                continue
    return None


def generate_sesame_contextual_reply(user_msg: str, scenario: str, persona: str, turn_idx: int) -> dict:
    """
    Contextual Sesame-style conversational voice engine.
    Generates warm, natural spoken responses (Maya/Miles style) tailored to what the student said.
    """
    msg = (user_msg or "").strip()
    lower = msg.lower()
    words = [w for w in re.findall(r"[a-zA-Z']+", msg)]
    word_count = len(words)
    speaker = "Maya" if persona != "miles" else "Miles"

    # Estimate CEFR & coaching tip
    has_advanced = bool(re.search(r"\b(syllabus|curriculum|methodology|collaborate|experience|effectively|furthermore|however|although|deadline|presentation|research|innovation|confident|definitely|personally)\b", lower))
    if word_count >= 12 and has_advanced:
        cefr = "B2–C1"
        feedback = "Ngữ điệu tự nhiên, cấu trúc câu phức và từ vựng học thuật rất ấn tượng!"
        better_say = msg if msg.endswith((".", "!", "?")) else msg + "."
    elif word_count >= 6:
        cefr = "B1+"
        feedback = "Diễn đạt rõ ý! Bạn có thể nối thêm mệnh đề 'because' hoặc 'which helps me...' để đạt chuẩn B2."
        better_say = f"Honestly, {msg[0].lower() + msg[1:] if len(msg) > 1 else msg}, which really helps me improve every day."
    else:
        cefr = "A2–B1"
        feedback = "Phản xạ tốt! Hãy thử mở rộng câu trả lời thành 1–2 câu đầy đủ kèm lý do."
        better_say = "Well, from my perspective, practicing English daily makes a huge difference."

    # Topic detection for genuine conversational responsiveness
    if re.search(r"\b(hello|hi|hey|good morning|good evening|how are you)\b", lower):
        reply_en = f"Hey there! I'm {speaker}, your live English companion. It's so good to hear your voice—what's on your mind today, or what are you studying this week?"
        reply_vi = f"Chào bạn! Mình là {speaker}, trợ lý luyện nói trực tiếp của bạn. Rất vui được nghe giọng bạn — hôm nay bạn đang nghĩ gì hay đang ôn môn gì thế?"
        suggestions = [
            "I'm preparing for my B2 English speaking exam at university.",
            "I had a really busy day with group assignments and deadlines.",
            "Can we practice a quick internship interview together?"
        ]
    elif re.search(r"\b(stress|tired|busy|deadline|hard|difficult|exhausted|worried|nervous)\b", lower):
        reply_en = "Oh, I totally get that—university deadlines can feel overwhelming sometimes. Take a deep breath! What's the biggest thing on your plate right now?"
        reply_vi = "Ồ, mình hoàn toàn hiểu mà — deadline ở đại học đôi khi thật sự áp lực. Hít một hơi sâu nhé! Việc lớn nhất bạn đang phải giải quyết lúc này là gì?"
        suggestions = [
            "I have a group presentation tomorrow and I still feel nervous.",
            "I need to memorize 60 grammar units before the final test.",
            "Balancing my part-time job and coursework is quite challenging."
        ]
    elif re.search(r"\b(exam|vstep|ielts|test|grammar|vocabulary|syllabus|study|learn|english)\b", lower):
        reply_en = "That's a smart way to approach it! Consistency really beats cramming at the last minute. Which skill do you feel is your biggest challenge right now—speaking fluency or academic vocabulary?"
        reply_vi = "Cách tiếp cận đó rất thông minh! Sự đều đặn luôn tốt hơn học dồn phút cuối. Kỹ năng nào đang là thử thách lớn nhất với bạn lúc này — độ trôi chảy khi nói hay từ vựng học thuật?"
        suggestions = [
            "Speaking fluency is my main challenge because I rarely talk to native speakers.",
            "I want to use more advanced C1 vocabulary naturally when I speak.",
            "Sometimes I still mix up present perfect and past simple tenses."
        ]
    elif re.search(r"\b(interview|intern|internship|job|company|career|work|cv|resume)\b", lower) or scenario == "interview":
        reply_en = "I love that energy! In a real interview, showing how you collaborate and solve problems sets you apart. Tell me, what kind of project or role excites you the most?"
        reply_vi = "Mình rất thích nguồn năng lượng đó! Trong phỏng vấn thực tế, thể hiện cách bạn hợp tác và giải quyết vấn đề sẽ giúp bạn nổi bật. Dự án hay vị trí nào làm bạn hứng thú nhất?"
        suggestions = [
            "I love working on innovative tech projects where I can learn from senior engineers.",
            "I enjoy roles that combine business analysis with creative problem solving.",
            "My goal is to join a dynamic team and gain hands-on industry experience."
        ]
    elif re.search(r"\b(presentation|project|research|methodology|capstone|group|team|defend)\b", lower) or scenario == "defense":
        reply_en = "That sounds like a really solid project! If I were your professor listening right now, I'd ask: what was the single most surprising result your team discovered?"
        reply_vi = "Nghe là thấy đồ án rất chắc chắn rồi! Nếu mình là giảng viên đang ngồi hội đồng, mình sẽ hỏi: kết quả bất ngờ nhất mà nhóm bạn phát hiện ra là gì?"
        suggestions = [
            "We discovered that 60-second micro-tasks increased daily student retention by 40 percent.",
            "Our survey showed that students learn twice as fast when lessons match their course syllabus.",
            "The biggest surprise was how much voice roleplay reduced speaking anxiety."
        ]
    else:
        followups = [
            (
                "Oh, that's a really interesting perspective! I like how clearly you expressed that. If you had to give one piece of advice to a freshman at your university, what would you tell them?",
                "Ồ, góc nhìn đó thú vị thật đấy! Mình rất thích cách bạn diễn đạt rõ ràng như vậy. Nếu được khuyên một điều cho sinh viên năm nhất trường bạn, bạn sẽ nói gì?",
                [
                    "I would tell them to start building their English habit from the very first semester.",
                    "Don't be afraid of making mistakes when speaking in front of the class.",
                    "Join student clubs to gain practical teamwork experience early on."
                ]
            ),
            (
                "Hmm, I see what you mean! Speaking of daily life on campus, how do you usually unwind after a long day of lectures?",
                "Ừm, mình hiểu ý bạn! Nhân chuyện đời sống sinh viên, bạn thường thư giãn thế nào sau một ngày dài trên giảng đường?",
                [
                    "I usually listen to English podcasts while walking around the campus lake.",
                    "Hanging out with my classmates at a small coffee shop always helps me recharge.",
                    "I enjoy playing sports or reading a good book before bed."
                ]
            )
        ]
        f_en, f_vi, f_sug = followups[turn_idx % len(followups)]
        reply_en, reply_vi, suggestions = f_en, f_vi, f_sug

    return {
        "replyEn": reply_en,
        "replyVi": reply_vi,
        "cefr": cefr,
        "feedback": feedback,
        "betterSay": better_say,
        "suggestions": suggestions,
        "source": "sesame-engine"
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
                "tts": "google-neural+dictionary",
                "live_voice": "sesame-gemini-flash",
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
            custom_key = (req_data.get("apiKey") or "").strip()
            speaker = "Maya" if persona != "miles" else "Miles"

            prompt = (
                f"You are {speaker}, a warm, hyper-natural real-time English voice companion (like Sesame AI) "
                f"helping a Vietnamese university student in scenario '{scenario}'. "
                f"The student just said: \"{user_msg}\". "
                f"Respond in JSON with fields: "
                f"replyEn (1-2 natural spoken English sentences, 18-32 words, warm conversational tone with a follow-up question), "
                f"replyVi (natural Vietnamese translation of replyEn), "
                f"cefr (estimated CEFR level of student's message: A2, B1, B1+, B2, or C1), "
                f"feedback (1 short coaching tip in Vietnamese), "
                f"betterSay (a more natural B2/C1 English version of what the student said), "
                f"suggestions (array of 3 natural English reply options for the student's next turn)."
            )

            result = call_gemini_json(prompt, custom_key=custom_key)
            if not result or not result.get("replyEn"):
                result = generate_sesame_contextual_reply(user_msg, scenario, persona, turn_idx)
            else:
                result["source"] = "gemini-flash"

            # Pre-warm Neural TTS MP3 right now so browser audio playback starts with 0 latency!
            accent = "en-US" if persona != "miles" else "en-GB"
            try:
                get_tts_mp3(result["replyEn"], accent=accent)
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
            result = call_gemini_json(prompt)
            if result and result.get("score"):
                result["source"] = "gemini-flash"
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
        print(f"ChYHab Full-Stack Server listening on http://localhost:{PORT}", flush=True)
        httpd.serve_forever()
