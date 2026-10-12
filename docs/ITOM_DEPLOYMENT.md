# GitHub Pages + private trial backend

Deployment date: 2026-10-12. Version: Agent Canvas 1.27.0.

- UI: https://tommyyula.github.io/OpenHands/
- Backend: https://cam-wiki-ecology-kings.trycloudflare.com
- Source branch: deploy/itom-public; generated site branch: gh-pages.
- This is a private trial, not an anonymous hosted coding service.

## Build

```sh
npm ci --ignore-scripts
env -u VITE_SESSION_API_KEY VITE_BASE_PATH=/OpenHands VITE_BACKEND_BASE_URL=https://cam-wiki-ecology-kings.trycloudflare.com VITE_DO_NOT_TRACK=1 VITE_MOCK_API=false npm run build
docker build --build-context runtime_ws=./node_modules/ws -f docker/Dockerfile.itom-runtime -t itom-openhands:1.27.0-runtime-fix .
```

Publish static build files, excluding server and .vite, to gh-pages. Include .nojekyll and LICENSE, and copy index.html to 404.html. Never embed an API key in Vite variables or committed files.

## Runtime

The derived Dockerfile repairs missing static-server dependencies in the upstream image (MARS/tunnel modules, config/defaults.json and ws). It does not change agent behavior.

Supply a private 0600 env file with LOCAL_BACKEND_API_KEY and OH_SESSION_API_KEYS_0 both set to the same randomly generated secret. In this image, supplying only LOCAL_BACKEND_API_KEY did not enable agent-server authentication. Explicitly set the canonical OH_SESSION_API_KEYS_0.

Set OH_ALLOW_CORS_ORIGINS_0=https://tommyyula.github.io and OH_ALLOW_CORS_ORIGINS_1 to the backend origin. Keep AGENT_CANVAS_ALLOW_LAN_SESSION_KEY=false.

Bind Docker port 8000 to host loopback, keep state in a named volume, and mount only an isolated projects directory. Do not mount the Docker socket or host home directory.

## Verified

- Production frontend build and derived-image import smoke test passed.
- GitHub Pages loads the actual frontend in a browser.
- Public backend rejects missing and incorrect keys (401); valid key succeeds (200).
- Pages-origin CORS preflight succeeds (200).
- Browser onboarding accepts the backend key and advances to agent selection.

## Limits

- No LLM credentials configured and no real agent task executed.
- Shared session key is single-user/trusted-team access, not per-user tenancy.
- Backend runs on an existing Mac through a temporary Cloudflare Quick Tunnel; it is not hosted by GitHub Pages. Host sleep/reboot or tunnel termination makes the app backend unavailable.
- Quick Tunnel hostname changes require rebuilding the UI. Quick Tunnels do not guarantee uptime and do not support SSE; end-to-end streaming is not yet validated.
- Public Pages frontend does not include same-origin server-side MARS bridge routes. Core direct-backend onboarding was verified; not all integrations are validated.
- Production deployment should use an always-on host and stable authenticated ingress.
