"""How audio/score.mp3 was made (2026-10-20), kept so a future score can be made the same way.

    GEMINI_API_KEY=... python3 _film/scripts/score.py lyria-3-pro-preview take_a take_b take_c

Each take is a full 2.5-minute track written to <tag>.mp3. Eight takes in three styles were compared;
the second take of this prompt ("min_b") was chosen after listening reviews, and the film is cut to it.
Analyse a new take with scripts/analyze_music.py before re-timing the film (src/timing.ts).
"""
import os, sys, time, json
from google import genai

PROMPT = """Instrumental only, no vocals, no voice, no choir.
A 2 minute 30 second original piece for a university research lab film about sensing the planet with AI: air, satellites, breath and energy.
Tempo exactly 118 BPM in 4/4 throughout, key of A minor moving to C major for the ending.
Style: minimal modern electronic with organic warmth. Precise pulsing synth arpeggios in 16th notes that feel like data and signals,
felt piano with soft hammer noise, warm deep sub bass, crisp small percussion (rim clicks, soft claps, shakers), tape-saturated pads,
occasional bell-like mallet tones. Hypnotic, intelligent, curious, quietly hopeful. Not corporate, not epic trailer music:
no brass, no big orchestral drums, no EDM drops, no guitars.

Structure (timestamps are exact):
[0:00-0:16] Intro. A single felt piano motif of four notes repeats and varies over a soft pad. No drums. A subtle filtered riser in the last two seconds.
[0:16-0:24] A pulsing 16th-note synth arpeggio and rim clicks enter; the bass begins. Forward motion.
[0:24-0:44] Groove A: soft kick on every beat, arpeggio opens up, piano motif on top. Medium energy.
[0:44-1:04] Groove B: a second arpeggio layer in counterpoint, deeper bass, the filter opens. Slightly darker.
[1:04-1:24] Groove C: lighter and more delicate, mallet tones, hi-hats thin out, piano motif in a higher register.
[1:24-1:44] Groove D: energy rebuilds with claps and a short percussion fill at 1:42.
[1:44-2:00] Peak: fullest arrangement, the piano motif becomes a bright lead, open hats. Confident and joyful.
[2:00-2:16] Warm reflective section: drums pull back to kick and shaker, piano and pad carry the motif.
[2:16-2:24] Final lift.
[2:24-2:30] One clean final chord on the downbeat at 2:24 that rings out and decays to silence."""

model = sys.argv[1]
c = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
for tag in sys.argv[2:]:
    for attempt in range(3):
        t = time.time()
        try:
            r = c.models.generate_content(model=model, contents=PROMPT)
        except Exception as e:
            print(tag, "error", str(e)[:300], flush=True); time.sleep(10); continue
        parts = (r.candidates[0].content.parts if r.candidates and r.candidates[0].content else []) or []
        audio = [p for p in parts if p.inline_data]
        texts = [p.text for p in parts if p.text]
        if not audio:
            print(tag, "no audio", r.prompt_feedback, texts[:1], flush=True); time.sleep(5); continue
        mt = audio[0].inline_data.mime_type
        ext = "mp3" if "mpeg" in mt or "mp3" in mt else "wav"
        fn = f"{tag}.{ext}"
        open(fn, "wb").write(audio[0].inline_data.data)
        json.dump({"model": model, "mime": mt, "secs": round(time.time() - t, 1), "text": texts}, open(f"{tag}.json", "w"))
        print(tag, "saved", fn, mt, round(time.time() - t, 1), "s", flush=True)
        break
