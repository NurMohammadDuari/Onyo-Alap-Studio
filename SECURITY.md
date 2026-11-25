# Security Policy — Onyo Alap Studio

1. **Server-Only Secrets**: `GEMINI_API_KEY` is read exclusively in server-side Next.js API routes (`process.env.GEMINI_API_KEY`). Never prefix secrets with `NEXT_PUBLIC_`.
2. **Credential Hygiene**: Personal access tokens (`ghp_*`, SSH keys, `.env`) must never be stored in source files, commit history, build scripts, or logs.
3. **Media Copyright & Exclusion**: Downloaded third-party reference MP4s and large uncompressed PNG frame dumps are excluded from Git tracking via `.git/info/exclude` and must not be published.
4. **Render Authorization Guardrails**: Final H.264 MP4 synthesis validates explicit approval on the exact latest `storyboard_versions` row (`USER_APPROVED` / `FINAL_RENDER_AUTHORIZED`) before invoking FFmpeg.
