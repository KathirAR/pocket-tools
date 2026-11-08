# Cutline AI setup

Cutline's AI features run on Cloud Functions in the same Firebase project as the finance tracker (`pocket-finance-tracker-c1386`). The editor works without them; the **AI** menu needs this one-time setup.

| Feature | Function | Uses |
|---|---|---|
| Auto captions | `transcribe` | OpenAI Whisper (`whisper-1`), word timestamps |
| Make it like a reference | `planEdit` | Claude (vision) reads frames from the reference and your clips, returns an edit plan |
| Trending ideas | `trends` | Claude with web search; results cached for 12 hours per niche |

Only Google accounts you list in `ALLOWED_EMAILS` can use them, with daily limits per account (60 min of transcription, 30 drafts, 30 trend searches). Change `LIMITS` in `functions/index.js` to adjust.

## 1. Before you start

- Switch the Firebase project to the **Blaze (pay as you go)** plan. Cloud Functions that call outside APIs need it. Set a budget alert in Google Cloud Billing while you're there.
- Get two API keys:
  - **Anthropic:** console.anthropic.com → API keys
  - **OpenAI:** platform.openai.com → API keys (for Whisper)
- Install Node.js 22 and the Firebase CLI:
  ```
  npm install -g firebase-tools
  firebase login
  ```

## 2. Deploy

From the repo root:

```
cd functions
npm install
cd ..
firebase functions:secrets:set ANTHROPIC_API_KEY
firebase functions:secrets:set OPENAI_API_KEY
firebase deploy --only functions:cutline
```

The first deploy asks for `ALLOWED_EMAILS`. Enter the Google accounts that may use the AI, separated by commas, e.g. `you@gmail.com,editor@gmail.com`. It's saved in `functions/.env.pocket-finance-tracker-c1386`; edit that file and redeploy to change it later.

Optional: set `CLAUDE_MODEL` the same way (default `claude-sonnet-5-5`; `claude-opus-5-5` gives stronger edit plans at a higher cost).

Functions deploy to `asia-south1` (Mumbai) for lower latency from India.

## 3. Let the editor sign in

1. Firebase console → **Authentication → Sign-in method**: make sure **Google** is enabled (the finance tracker already uses it).
2. **Authentication → Settings → Authorized domains**: add the domain you open the editor from, e.g. `kathirar.github.io`. Add `localhost` too if you test locally.
3. To host the editor, turn on **GitHub Pages** for this repo (Settings → Pages → deploy from `main`, root). The editor is then at `https://kathirar.github.io/pocket-tools/video-editor/`.

Open the editor, click **AI → Sign in with Google**, and try **Trending ideas** first. It's the quickest check that everything is wired up.

## What it costs

Rough figures; check each provider's current pricing.

| Action | Approximate cost |
|---|---|
| Auto captions | Whisper ≈ $0.006 per minute of audio |
| One reference draft (≈30 frames, Sonnet) | a few US cents; more with Opus or long transcripts |
| One trend search (up to 8 web searches) | ≈ $0.08 in searches plus tokens; cached for 12 h |

Firebase's own Functions and Firestore usage for one creator normally stays inside the free tier.

## Good to know

- **Reference videos are uploaded as files.** Instagram links can't be downloaded by the app, so screen-record or save the reel first. Frames are analysed in your browser; only small JPEG stills and timing data reach the AI.
- **Trends come from a web search, not from Instagram.** Instagram has no public trending-audio API, so treat suggestions as leads and confirm on the Reels audio page. Add trending songs inside Instagram when you post.
- **Audio for captions** is extracted in the browser as 16 kHz mono WAV and sent in chunks of under two minutes.
- Logs: `firebase functions:log --only transcribe,planEdit,trends`.
