# Azure App Service deployment

AntySpend API runs on **Azure App Service for Linux** (Node 20+). Zip deploy is **ready-to-run**: production `node_modules` and pre-built `dist/` are included in the package. Azure does **not** run `npm install` on the server (see `.deployment`).

## What gets deployed

| Included in zip | Excluded (VS Code `zipIgnorePattern`) |
|---|---|
| `package.json`, `package-lock.json` | `.git/`, `.env`, `.env.*` |
| `dist/` (from `npm run build`) | `.vscode/`, `src/`, `test/`, `coverage/` |
| `node_modules/` (prod only, from `npm ci --omit=dev`) | |

The VS Code **deploy-prep** task (`.vscode/tasks.json`) runs `npm ci` → `npm run build` → `npm ci --omit=dev` before upload. Do not exclude `node_modules` from the zip — that caused `Cannot find module '@nestjs/common'` when Azure Oryx install did not run.

## Startup command

Azure runs `npm start` by default. This repo's `start` script runs the compiled app:

```bash
node dist/src/main
```

**Do not** set the startup command to `nest start` or `npm run start:dev` — those need devDependencies and TypeScript sources.

Optional explicit override in Azure Portal → **Settings → Configuration → General settings → Startup Command**:

```bash
node dist/src/main.js
```

Either `npm start` or `node dist/src/main.js` is fine after a successful deploy.

## Required Application settings

The app validates environment variables at boot with Joi. Missing or invalid values cause an immediate crash (check Log stream for `AntySpend API failed to start`).

| Setting | Required | Notes |
|---|---|---|
| `MONGODB_URI` | Yes | Must start with `mongodb://` or `mongodb+srv://` |
| `JWT_SECRET` | Yes | Minimum 16 characters |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth Web Client ID (same as Android) |
| `NODE_ENV` | Recommended | `production` |
| `PORT` | Auto | Azure injects `8080`; app reads `process.env.PORT` |

### Optional (feature-specific)

| Setting | When needed |
|---|---|
| `OPENROUTER_API_KEY` | AI endpoints |
| `EXCHANGE_RATE_API_TOKEN` | Live exchange rates |
| `ENABLE_SWAGGER` | Set `true` to expose `/docs` (off by default in prod) |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64` | Play subscription verification |
| `RTDN_ENABLED`, `GOOGLE_PUBSUB_PUSH_*` | Real-time billing webhooks |

See [DEPLOY-BILLING.md](./DEPLOY-BILLING.md) for billing-specific secrets.

## Deploy from VS Code

1. Copy [`.vscode/settings.json.example`](../.vscode/settings.json.example) → `.vscode/settings.json`.
2. Configure Application settings in Azure Portal (one-time).
3. Deploy — the extension runs **deploy-prep** (`npm ci` → `build` → `npm ci --omit=dev`), then uploads `dist/`, production `node_modules/`, and `package.json`.
4. **`WEBSITE_RUN_FROM_PACKAGE`** should not be set (or set to `0`) if you ever switch back to server-side install.

## Deploy from GitHub Actions

Workflow [`.github/workflows/main_antyspend.yml`](../.github/workflows/main_antyspend.yml) builds on the runner, then zip-deploys the artifact. The same `.deployment` file triggers install-only Oryx on Azure. Same Application settings apply.

## Build and smoke-test locally

```bash
npm install          # full install for build
npm run build
npm run start:prod   # smoke test with .env present
```

Simulate the Azure runtime (production deps only, pre-built `dist/`):

```bash
rm -rf node_modules
npm ci --omit=dev
node dist/src/main.js
```

The process should load NestJS modules. It may exit on missing env vars — that is expected without `.env`.

## Check logs in Azure

1. Azure Portal → App Service **antyspend** → **Monitoring → Log stream** (live stdout/stderr).
2. Or **Development Tools → Advanced Tools (Kudu)** → **Debug console** → browse `LogFiles/`.
3. Successful boot shows: `AntySpend API listening on port 8080`.
4. Env validation failures show: `AntySpend API failed to start:` followed by the Joi error.
5. During deploy, look for: `Running custom build command: npm ci --omit=dev`.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Cannot find module '@nestjs/common'` | Production `node_modules` missing from zip — use **deploy-prep** and do not exclude `node_modules` in `zipIgnorePattern` |
| Log stops after `Extracting modules...` then Application Error | `npm start` was running `nest start` (fixed: now runs `node dist/main`) |
| `Cannot find module '.../dist/src/main'` | `dist/` missing from zip — run `npm run build` before deploy |
| Immediate crash, Joi message in logs | Missing `MONGODB_URI`, `JWT_SECRET`, or `GOOGLE_CLIENT_ID` in App Settings |
| Heap OOM during deploy | Remote `nest build` — build locally/CI only; never run `npm run build` on Azure |
| `npm ci` fails on server | Not used when `node_modules` is bundled; fix lock file locally with `npx npm@10.9.2 install` |

No `web.config` is required on Linux App Service. `web.config` / iisnode applies only to Windows App Service plans.
