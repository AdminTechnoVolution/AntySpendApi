# Azure App Service deployment

AntySpend API runs on **Azure App Service for Linux** (Node 20+). Zip deploy is **ready-to-run**: production `node_modules` and pre-built `dist/` are included in the package. Azure does **not** run `npm install` on the server (see `.deployment`).

## What gets deployed

The repo is **pnpm-managed** (`pnpm-lock.yaml` is the real lockfile; `package-lock.json` is gitignored). The GitHub Actions workflow — the only deploy path now used — builds with pnpm:

| Included in zip | Excluded (VS Code `zipIgnorePattern`) |
|---|---|
| `package.json` | `.git/`, `.env`, `.env.*` |
| `dist/` (from `pnpm run build`) | `.vscode/`, `src/`, `test/`, `coverage/` |
| `node_modules/` (prod only, from `pnpm prune --prod`) | |

The workflow runs `pnpm install --frozen-lockfile` → `pnpm run build` → `pnpm prune --prod`, then uploads the whole working directory as a GitHub Actions artifact and zip-deploys it to Azure. Do not exclude `node_modules` from the zip — that caused `Cannot find module '@nestjs/common'` when Azure Oryx install did not run.

**pnpm-specific gotcha:** pnpm's default `node_modules` layout is symlinked (a package's transitive dependencies — e.g. `tslib`, pulled in by `@nestjs/common` — exist only as symlinks into `node_modules/.pnpm/...`). That symlinked tree does not reliably survive the `actions/upload-artifact` → `actions/download-artifact` round trip, which caused a production `Cannot find module 'tslib'` crash even though direct dependencies resolved fine. Fixed by setting `nodeLinker: hoisted` in [`pnpm-workspace.yaml`](../pnpm-workspace.yaml), which makes pnpm lay out a flat, symlink-free `node_modules` like npm/yarn classic. (This setting has to live in `pnpm-workspace.yaml`, not `.npmrc` — pnpm 10+ ignores `node-linker` in `.npmrc` once a `pnpm-workspace.yaml` is present.)

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

## Deploy from GitHub Actions

Workflow [`.github/workflows/main_antyspend.yml`](../.github/workflows/main_antyspend.yml) is the only deploy path: it builds on the runner with pnpm, then zip-deploys the artifact. The same `.deployment` file triggers install-only Oryx on Azure. Same Application settings apply.

## Build and smoke-test locally

```bash
pnpm install --frozen-lockfile   # full install for build
pnpm run build
pnpm run start:prod              # smoke test with .env present
```

Simulate the Azure runtime (production deps only, pre-built `dist/`):

```bash
rm -rf node_modules
pnpm install --frozen-lockfile
pnpm run build
pnpm prune --prod
node dist/src/main.js
```

The process should load NestJS modules. It may exit on missing env vars — that is expected without `.env`.

## Check logs in Azure

1. Azure Portal → App Service **antyspend** → **Monitoring → Log stream** (live stdout/stderr).
2. Or **Development Tools → Advanced Tools (Kudu)** → **Debug console** → browse `LogFiles/`.
3. Successful boot shows: `AntySpend API listening on port 8080`.
4. Env validation failures show: `AntySpend API failed to start:` followed by the Joi error.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Cannot find module '@nestjs/common'` | Production `node_modules` missing from zip — do not exclude `node_modules` in `zipIgnorePattern` |
| `Cannot find module 'tslib'` (or another transitive dep) while a direct dependency like `@nestjs/common` resolves fine | pnpm's symlinked `node_modules` didn't survive the `upload-artifact`/`download-artifact` round trip — confirm `nodeLinker: hoisted` is set in `pnpm-workspace.yaml` |
| Log stops after `Extracting modules...` then Application Error | `npm start` was running `nest start` (fixed: now runs `node dist/main`) |
| `Cannot find module '.../dist/src/main'` | `dist/` missing from zip — run `pnpm run build` before deploy |
| Immediate crash, Joi message in logs | Missing `MONGODB_URI`, `JWT_SECRET`, or `GOOGLE_CLIENT_ID` in App Settings |
| Heap OOM during deploy | Remote `nest build` — build locally/CI only; never run `pnpm run build` on Azure |

No `web.config` is required on Linux App Service. `web.config` / iisnode applies only to Windows App Service plans.
