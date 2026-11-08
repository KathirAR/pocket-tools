/**
 * Cutline AI backend (Firebase Cloud Functions, 2nd gen).
 *
 *   transcribe  – speech to timed words/segments with OpenAI Whisper
 *   planEdit    – looks at a reference video + your clips and returns an edit plan (Claude, vision)
 *   trends      – current Reels song / caption / hashtag ideas for a niche (Claude + web search)
 *
 * Every function requires Firebase Auth, an allow-listed Google account and
 * stays inside per-account daily limits, so the API keys can't be drained
 * by anyone who finds the public editor.
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret, defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const Anthropic = require("@anthropic-ai/sdk");

admin.initializeApp();
setGlobalOptions({ region: "asia-south1", maxInstances: 5 });

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const ALLOWED_EMAILS = defineString("ALLOWED_EMAILS", {
  description: "Comma-separated Google account emails that may use Cutline AI (for example you@gmail.com)",
});
const CLAUDE_MODEL = defineString("CLAUDE_MODEL", { default: "claude-sonnet-5-5" });

// Per account, per UTC day.
const LIMITS = { transcribeSeconds: 3600, plans: 30, trends: 30 };

// Must match the editor's lists (video-editor/index.html).
const LOOKS = ["original", "warm", "golden", "soft", "bright", "moody", "cool", "vintage", "mono"];
const MOTIONS = ["none", "push", "pull", "punch", "shake"];
const TRANSITIONS = ["none", "fade", "black", "flash", "zoom", "whip"];
const TEXT_STYLES = ["title", "caption", "pop", "script", "step", "words"];
const FONTS = ["display", "clean", "impact", "script", "retro", "serif", "tamil"];
const ANIMS = ["none", "fade", "pop", "slide", "float", "type", "words"];

// ---------------------------------------------------------------- helpers
function requireUser(req) {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in with Google to use AI features.");
  const email = String(req.auth.token.email || "").toLowerCase();
  const allowed = ALLOWED_EMAILS.value().split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!email || !req.auth.token.email_verified || !allowed.includes(email)) {
    throw new HttpsError("permission-denied", "This Google account isn't allowed to use Cutline AI. Ask the owner to add it.");
  }
  return req.auth.uid;
}

async function spend(uid, key, amount) {
  const db = admin.firestore();
  const day = new Date().toISOString().slice(0, 10);
  const ref = db.doc(`cutlineUsage/${uid}_${day}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const used = (snap.exists && snap.get(key)) || 0;
    if (used + amount > LIMITS[key]) {
      throw new HttpsError("resource-exhausted", `Today's limit for this feature is used up. It resets at 05:30 IST.`);
    }
    tx.set(ref, { [key]: used + amount, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  });
}

const claude = () => new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });
const isB64 = (s, max) => typeof s === "string" && s.length > 0 && s.length <= max && /^[A-Za-z0-9+/=]+$/.test(s.slice(0, 200));
const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
const str = (v, max = 400) => String(v == null ? "" : v).slice(0, max);

function extractJson(text) {
  const tagged = text.match(/<json>([\s\S]*?)<\/json>/);
  const raw = tagged ? tagged[1] : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(raw);
}

// ---------------------------------------------------------------- transcribe
exports.transcribe = onCall({ secrets: [OPENAI_API_KEY], timeoutSeconds: 300, memory: "512MiB" }, async (req) => {
  const uid = requireUser(req);
  const { audio, language } = req.data || {};
  if (!isB64(audio, 8_000_000)) throw new HttpsError("invalid-argument", "Send 16 kHz mono WAV audio, under about 4 minutes per request.");
  const buf = Buffer.from(audio, "base64");
  if (buf.toString("ascii", 0, 4) !== "RIFF") throw new HttpsError("invalid-argument", "Audio must be a WAV file.");
  await spend(uid, "transcribeSeconds", Math.max(1, Math.ceil((buf.length - 44) / 32000)));

  const form = new FormData();
  form.append("file", new Blob([buf], { type: "audio/wav" }), "audio.wav");
  form.append("model", "whisper-1");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "word");
  form.append("timestamp_granularities[]", "segment");
  if (language && language !== "auto") form.append("language", str(language, 5));

  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY.value()}` },
    body: form,
  });
  if (!r.ok) {
    logger.error("whisper failed", r.status, await r.text());
    throw new HttpsError("internal", "The speech service couldn't transcribe this audio. Try again in a minute.");
  }
  const j = await r.json();
  return {
    language: j.language || null,
    segments: (j.segments || []).map((s) => ({ start: s.start, end: s.end, text: String(s.text || "").trim() })),
    words: (j.words || []).map((w) => ({ start: w.start, end: w.end, word: String(w.word || "").trim() })),
  };
});

// ---------------------------------------------------------------- planEdit
const PLAN_TOOL = {
  name: "submit_edit_plan",
  description: "Submit the finished edit plan for the creator's video.",
  input_schema: {
    type: "object",
    required: ["summary", "look", "segments", "texts"],
    properties: {
      summary: { type: "string", description: "2-4 sentences: what the reference does well and how this edit matches it or improves on it." },
      look: { type: "string", enum: LOOKS },
      segments: {
        type: "array",
        description: "Clips in playback order. Reuse a clip more than once if it helps.",
        items: {
          type: "object",
          required: ["mediaId", "in", "out"],
          properties: {
            mediaId: { type: "string" },
            in: { type: "number", description: "Source start, seconds" },
            out: { type: "number", description: "Source end, seconds" },
            speed: { type: "number", minimum: 0.25, maximum: 4 },
            motion: { type: "string", enum: MOTIONS },
            transition: { type: "string", enum: TRANSITIONS, description: "Transition into the next segment" },
            transitionDuration: { type: "number", minimum: 0.15, maximum: 1.2 },
            note: { type: "string", description: "Why this shot here (short)" },
          },
        },
      },
      texts: {
        type: "array",
        items: {
          type: "object",
          required: ["text", "style", "start", "end"],
          properties: {
            text: { type: "string" },
            style: { type: "string", enum: TEXT_STYLES },
            font: { type: "string", enum: FONTS },
            start: { type: "number" },
            end: { type: "number" },
            y: { type: "number", minimum: 0.08, maximum: 0.85, description: "Vertical centre, 0 = top, 1 = bottom" },
            animation: { type: "string", enum: ANIMS },
          },
        },
      },
      stickers: {
        type: "array",
        items: {
          type: "object",
          required: ["emoji", "start", "end"],
          properties: { emoji: { type: "string" }, start: { type: "number" }, end: { type: "number" }, x: { type: "number" }, y: { type: "number" }, size: { type: "number" } },
        },
      },
      captionsFromSpeech: { type: "boolean", description: "True if the clips contain talking that should be captioned word by word" },
      music: {
        type: "object",
        properties: { mood: { type: "string" }, bpm: { type: "number" }, searchTerms: { type: "array", items: { type: "string" } } },
      },
      postCaption: { type: "string", description: "Instagram caption to post with the video" },
      hashtags: { type: "array", items: { type: "string" } },
    },
  },
};

const PLAN_SYSTEM = `You are a senior short-form video editor for Instagram Reels, YouTube Shorts and TikTok creators in India.
You receive frames and timing data from a REFERENCE video the creator likes, plus frames (and sometimes transcripts) of the creator's OWN clips.
Build an edit of the creator's clips that recreates the reference's structure, pacing, text treatment and look, and improve on it where you can:
a hook in the first 1.5 seconds, no dead air, a clear payoff or reveal, and a call to action near the end.

Rules:
- Use only the mediaId values provided, and keep in/out inside each clip's duration. Images can run 1-4 seconds.
- Match the reference's average shot length unless the creator asks otherwise. Target the requested total length.
- Text must fit the format's safe zone: keep y between 0.12 and 0.75 for 9:16. Keep on-screen text short (max ~7 words per line).
- Write on-screen text in the language the creator asks for. For Tamil use the "tamil" font. For mixed Tamil-English ("Tanglish") write Tamil words in English letters.
- Text times are on the final timeline, in seconds, starting at 0.
- Only add stickers if the reference uses them or they clearly help.
- Never copy the reference's exact text; write original lines that do the same job.
Call submit_edit_plan exactly once with the full plan.`;

exports.planEdit = onCall({ secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 300, memory: "1GiB" }, async (req) => {
  const uid = requireUser(req);
  const d = req.data || {};
  const ref = d.reference || {};
  const clips = Array.isArray(d.clips) ? d.clips.slice(0, 24) : [];
  if (!clips.length) throw new HttpsError("invalid-argument", "Add at least one clip.");
  const refFrames = Array.isArray(ref.frames) ? ref.frames.slice(0, 18) : [];
  const allImages = refFrames.length + clips.reduce((a, c) => a + Math.min(6, (c.frames || []).length), 0);
  if (allImages > 90) throw new HttpsError("invalid-argument", "Too many frames. Use fewer clips.");
  await spend(uid, "plans", 1);

  const content = [];
  const img = (b64) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } });
  content.push({ type: "text", text:
`FORMAT: ${str(d.aspect, 8)} | TARGET LENGTH: ${num(d.targetLength, num(ref.duration, 20)).toFixed(1)}s | ON-SCREEN TEXT LANGUAGE: ${str(d.language, 40) || "English"}
CREATOR'S GOAL: ${str(d.goal, 600) || "(not given)"}
${d.music ? `MUSIC ON TIMELINE: about ${num(d.music.bpm)} BPM; beat times (s): ${(d.music.beats || []).slice(0, 80).map((b) => num(b).toFixed(2)).join(", ")}` : "NO MUSIC YET"}

REFERENCE VIDEO: ${num(ref.duration).toFixed(1)}s, ${num(ref.width)}x${num(ref.height)}, ${(ref.shots || []).length} shots, average shot ${num(ref.avgShot).toFixed(2)}s.
Shot boundaries (s): ${(ref.shots || []).slice(0, 80).map((s) => `${num(s.start).toFixed(2)}-${num(s.end).toFixed(2)}`).join(", ")}
${ref.transcript ? `Reference speech: ${str(ref.transcript, 3000)}` : ""}
${ref.caption ? `Reference post caption: ${str(ref.caption, 1000)}` : ""}
Reference frames follow, each labelled with its time.` });
  refFrames.forEach((f) => { if (isB64(f.b64, 400_000)) { content.push({ type: "text", text: `Reference @ ${num(f.t).toFixed(2)}s` }); content.push(img(f.b64)); } });

  content.push({ type: "text", text: "CREATOR'S CLIPS:" });
  clips.forEach((c) => {
    content.push({ type: "text", text: `mediaId=${str(c.id, 60)} | ${c.kind === "image" ? "photo" : "video"} | duration ${num(c.duration).toFixed(2)}s | ${num(c.width)}x${num(c.height)} | name "${str(c.name, 80)}"${c.transcript ? `\nSpeech: ${str(c.transcript, 1500)}` : ""}` });
    (c.frames || []).slice(0, 6).forEach((f) => { if (isB64(f.b64, 300_000)) { content.push({ type: "text", text: `${str(c.id, 60)} @ ${num(f.t).toFixed(2)}s` }); content.push(img(f.b64)); } });
  });

  try {
    const msg = await claude().messages.create({
      model: CLAUDE_MODEL.value(),
      max_tokens: 6000,
      system: PLAN_SYSTEM,
      tools: [PLAN_TOOL],
      tool_choice: { type: "tool", name: PLAN_TOOL.name },
      messages: [{ role: "user", content }],
    });
    const use = msg.content.find((b) => b.type === "tool_use" && b.name === PLAN_TOOL.name);
    if (!use) throw new Error("no plan returned");
    return { plan: use.input, model: msg.model, usage: msg.usage };
  } catch (e) {
    if (e instanceof HttpsError) throw e;
    logger.error("planEdit failed", e && e.message);
    throw new HttpsError("internal", "The AI couldn't build an edit this time. Try again, or use fewer clips.");
  }
});

// ---------------------------------------------------------------- trends
const TRENDS_SYSTEM = `You research what is trending RIGHT NOW on Instagram Reels for a creator's niche and region.
Search the web (news, music charts, Instagram trend roundups, creator newsletters) for the last few weeks.
Prefer sources dated within the last 30 days, and say so when something is older.
Never invent songs or trends. If you can't confirm something, leave it out.
Reply with a short note, then the result as JSON inside <json></json> with this shape:
{"songs":[{"title":"","artist":"","from":"film/album or empty","why":"why it's trending / how creators use it","source":"url"}],
 "hooks":["opening line ideas for on-screen text"],
 "captions":["full post caption ideas with emojis"],
 "hashtags":["#tag"],
 "formats":[{"name":"","how":""}],
 "notes":"one or two sentences on how fresh and certain this is"}
Give 6-10 songs, 6 hooks, 4 captions, 15-25 hashtags and 3-5 formats.`;

exports.trends = onCall({ secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 300, memory: "512MiB" }, async (req) => {
  const uid = requireUser(req);
  const d = req.data || {};
  const niche = str(d.niche, 120).trim() || "lifestyle";
  const region = str(d.region, 60).trim() || "India";
  const language = str(d.language, 40).trim() || "English";
  const key = `${niche}|${region}|${language}`.toLowerCase().replace(/[^a-z0-9|]+/g, "-").slice(0, 200);
  const db = admin.firestore();
  const cacheRef = db.doc(`cutlineTrends/${key}`);
  const cached = await cacheRef.get();
  if (cached.exists && Date.now() - cached.get("at") < 12 * 3600 * 1000 && !d.refresh) return Object.assign({ cached: true }, cached.data());
  await spend(uid, "trends", 1);

  const loc = { type: "approximate", country: "IN", timezone: "Asia/Kolkata" };
  if (/tamil|chennai/i.test(region)) Object.assign(loc, { region: "Tamil Nadu", city: "Chennai" });
  const today = new Date().toISOString().slice(0, 10);
  const messages = [{ role: "user", content: `Today is ${today}. Niche: ${niche}. Region/audience: ${region}. Caption language: ${language}.${d.reference ? ` Reference post: ${str(d.reference, 600)}` : ""} Find what's trending on Instagram Reels for this right now.` }];

  try {
    const client = claude();
    let msg;
    for (let i = 0; i < 4; i++) {
      msg = await client.messages.create({
        model: CLAUDE_MODEL.value(),
        max_tokens: 6000,
        system: TRENDS_SYSTEM,
        tools: [{ type: "web_search_20260318", name: "web_search", max_uses: 8, allowed_callers: ["direct"], user_location: loc }],
        messages,
      });
      if (msg.stop_reason !== "pause_turn") break;
      messages.push({ role: "assistant", content: msg.content });
    }
    const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
    const data = extractJson(text);
    const clean = {
      songs: (data.songs || []).slice(0, 12).map((s) => ({ title: str(s.title, 120), artist: str(s.artist, 120), from: str(s.from, 120), why: str(s.why, 300), source: /^https?:\/\//.test(s.source || "") ? str(s.source, 500) : "" })),
      hooks: (data.hooks || []).slice(0, 10).map((s) => str(s, 160)),
      captions: (data.captions || []).slice(0, 6).map((s) => str(s, 800)),
      hashtags: (data.hashtags || []).slice(0, 30).map((s) => str(s, 60)),
      formats: (data.formats || []).slice(0, 6).map((f) => ({ name: str(f.name, 80), how: str(f.how, 300) })),
      notes: str(data.notes, 400),
      asOf: today, niche, region, language, at: Date.now(),
    };
    await cacheRef.set(clean);
    return clean;
  } catch (e) {
    if (e instanceof HttpsError) throw e;
    logger.error("trends failed", e && e.message);
    throw new HttpsError("internal", "Couldn't fetch trends right now. Try again in a minute.");
  }
});
