# Cutline AI setup

Cutline's AI menu has three features. All of them can run **for free**, with no server and no credit card.

| Feature | Free option (default) | Optional paid option |
|---|---|---|
| Auto captions | **On this device:** Whisper runs inside your browser | Gemini, or Whisper via the Firebase backend |
| Make it like a reference | **Gemini** with your free Google AI Studio key | Claude via the Firebase backend |
| Trending ideas | **Gemini** with Google Search, free key | Claude web search via the Firebase backend |

Pick the option in **AI → AI settings**. Settings and your key are saved in that browser only.

## Free setup (about 2 minutes)

1. **Host the editor.** In the GitHub repo, go to Settings → Pages and deploy from `main`, root folder. The editor is then at `https://kathirar.github.io/pocket-tools/video-editor/`.
   The AI features need the hosted page. They don't work inside the Claude preview, which can't reach outside services.
2. **Get a free Gemini key** at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Sign in with Google, click *Create API key*. No card needed.
3. Open the editor, then **AI → AI settings**. Paste the key, click **Check**, keep the recommended model, and **Save**.

That's it. Try **Trending ideas** first; it's the quickest check.

### What "free" means here

- **On-device captions** are completely free and private: the audio never leaves your computer. The speech model downloads once (about 80 MB for *Fast*, 250 MB for *More accurate*) and is cached by the browser. A laptop or desktop is recommended; phones may be slow. For Tamil and Hindi, the larger model or the Gemini option is more accurate.
- **Gemini's free tier** has per-minute and per-day limits that Google sets per project (see the rate-limit page in AI Studio). If you hit one, Cutline tells you to wait. One reference draft is one request; trends are cached in your browser for 12 hours.
- **Privacy on Gemini's free tier:** Google may use what you send (small frame stills, audio for captions, text) to improve its products. Use on-device captions if that matters for a video, and don't send anything private.
- **Google Search for trends:** if your key's plan doesn't include Search grounding, Trending ideas shows a message saying so. The other features still work.
- **Your key** is stored in that browser's local storage. Don't paste it on a shared computer. If it leaks, delete it in AI Studio and make a new one.

## Optional: Firebase backend (paid)

Use this if you want Claude for drafts and trends, server-side Whisper, or to share the AI with other people without giving them your key. It needs the Firebase **Blaze** plan (a card on file), an Anthropic key and an OpenAI key.

```
npm install -g firebase-tools
firebase login
cd functions && npm install && cd ..
firebase functions:secrets:set ANTHROPIC_API_KEY
firebase functions:secrets:set OPENAI_API_KEY
firebase deploy --only functions:cutline
```

- The first deploy asks for `ALLOWED_EMAILS`: the Google accounts allowed to use it, comma-separated. It's saved in `functions/.env.pocket-finance-tracker-c1386`; edit it and redeploy to change it.
- Optional `CLAUDE_MODEL` (default `claude-sonnet-5-5`).
- In the Firebase console: enable **Google** sign-in (already on for the finance tracker) and add `kathirar.github.io` under **Authentication → Settings → Authorized domains**.
- Then choose **My Firebase backend** in AI settings and sign in from the AI menu.
- Daily limits per account are in `LIMITS` in `functions/index.js` (60 min transcription, 30 drafts, 30 trend searches).
- Rough costs: Whisper ≈ $0.006 per audio minute; a draft with Sonnet is a few cents; a trend search ≈ $0.08 plus tokens.

## Good to know

- **Reference videos are uploaded as files.** Instagram links can't be downloaded, so screen-record or save the reel first. The browser finds the cuts and takes small stills; only those stills and timing data go to the AI.
- **Trends come from a web search, not from Instagram.** There's no public Instagram trending-audio API, so treat suggestions as leads and check them on the Reels audio page. Add trending songs inside Instagram when you post.
