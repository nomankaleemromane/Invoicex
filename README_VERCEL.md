Deployment to Vercel - Serverless OpenAI proxy

What changed
- Added two Vercel serverless endpoints under `/api`:
  - `api/chat.js` - proxies chat requests to OpenAI (used by chatbot widget)
  - `api/analysis.js` - proxies AI investment analysis requests to OpenAI (used by AI Analyst button)
- `marketplace.html` updated to call `/api/chat` and `/api/analysis` instead of loading `js/api.json` with a hardcoded key.

Environment variables (required)
- Set OPENAI_API_KEY in your Vercel project settings (Environment Variables).
  - This keeps your API key secret and out of the repo.

Deploy steps (quick)
1. Install Vercel CLI (optional):
   npm i -g vercel
2. From project root where `package.json` lives (or this folder), run:
   vercel deploy --prod
3. In Vercel dashboard, go to Settings → Environment Variables and add `OPENAI_API_KEY` with your OpenAI key.

Local testing
- The serverless functions expect `process.env.OPENAI_API_KEY`. For local testing with Vercel CLI, run `vercel env add` or set environment variables in your shell before running `vercel dev`.

Security notes
- Remove `js/api.json` from the repository or replace with a placeholder file that does not contain secrets. The production code no longer reads it.

Troubleshooting
- If AI responses fail with parsing errors, check the function logs in Vercel and inspect `raw` response returned by `/api/analysis` for debugging.

Contact
- If you want, I can also update `js/api.json` to a placeholder and add a small script to detect presence of an API key in the repo and fail the build. Let me know.