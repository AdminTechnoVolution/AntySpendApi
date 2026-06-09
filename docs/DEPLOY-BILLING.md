# Billing deployment checklist

Production billing (Play verification + RTDN) requires manual GCP and Play Console configuration.

## Deploy from VS Code (recommended)

The Azure App Service extension deploys application code via zip deploy to `site/wwwroot`. **Application settings are stored separately** — they persist across redeploys and do not need to be re-uploaded when you push new code.

### Build on deploy (avoid Azure OOM)

Azure App Service has limited RAM (~1–1.75 GB on Basic). Running `nest build` on the server often fails with **JavaScript heap out of memory**. This repo ships **pre-built** `dist/` and uses Oryx for **`npm ci --omit=dev` only** (`.deployment` sets `CUSTOM_BUILD_COMMAND`; no remote `nest build`).

1. Copy [`.vscode/settings.json.example`](../.vscode/settings.json.example) to `.vscode/settings.json` (gitignored). It runs `npm run build` locally before zip deploy and includes `dist/`, `package.json`, and `package-lock.json` in the upload (while still excluding `node_modules` and `.env`).
2. Deploy from VS Code as usual — the extension builds on your machine, then Azure installs production dependencies during deploy.
3. Optional fallback if you ever re-enable remote build: Azure Portal → App Service → **Environment variables** → add `NODE_OPTIONS` = `--max-old-space-size=2048` (build phase only; remove or lower if runtime is tight on RAM).

GitHub Actions builds on the runner before deploy; the same `.deployment` config runs install-only Oryx on Azure.

### Billing secrets (one-time)

1. Download the Play Console service account JSON (**Setup → API access**).
2. On your machine, from the `AntySpendApi` directory:
   ```bash
   npm run billing:encode-sa -- /path/to/play-service-account.json
   ```
3. Copy the Base64 output (single line, stdout only).
4. Azure Portal → App Service **antyspend** → **Settings → Environment variables** (Application settings).
5. Set `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64` to the copied value.
6. Leave `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` empty (or remove it) when using Base64.
7. Save settings (Azure restarts the app).
8. Deploy from VS Code as usual — **no need to touch the secret again**.

## Production environment variables

| Variable | Required | Example / notes |
|---|---|---|
| `GOOGLE_PLAY_PACKAGE_NAME` | Yes | `com.technovolution.antyspend` |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64` | Yes (prod) | Output of `npm run billing:encode-sa` — **preferred for Azure** |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Local dev | Filesystem path or inline JSON; leave empty in prod when using Base64 |
| `RTDN_ENABLED` | Yes (for RTDN) | `true` |
| `GOOGLE_PUBSUB_PUSH_AUDIENCE` | Yes (for RTDN) | `https://api.antyspend.com/webhooks/google-play/rtdn` |
| `GOOGLE_PUBSUB_PUSH_SERVICE_ACCOUNT_EMAIL` | Yes (for RTDN) | Service account used by Pub/Sub push OIDC |
| `RTDN_SKIP_AUTH` | No | Must be `false` in production |

### Other App Settings (required for boot)

See [DEPLOY.md](./DEPLOY.md) for full Azure deployment guide. Minimum settings:

| Variable | Example |
|---|---|
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | Long random secret (min 16 chars) |
| `GOOGLE_CLIENT_ID` | `....apps.googleusercontent.com` |
| `NODE_ENV` | `production` |
| `PORT` | `8080` (injected by Azure; do not omit if overriding manually) |

Startup command: leave default `npm start` (runs `node dist/src/main`) or set `node dist/src/main.js` explicitly.

## Play Console prerequisites

1. **Setup → API access** — link GCP project, create service account, grant subscription read access, download JSON.
2. **Monetize → Products → Subscriptions** — active base plans for `antyspend_personal_monthly` and `antyspend_family_monthly`.
3. **Monetize → Monetization setup → Real-time developer notifications** — topic `projects/{GCP_PROJECT_ID}/topics/play-billing-rtdn`, send test notification.
4. **Setup → License testing** — add tester emails for sandbox purchases.

## GCP Pub/Sub

1. Topic: `play-billing-rtdn`
2. IAM: `google-play-developer-notifications@system.gserviceaccount.com` → Pub/Sub Publisher
3. Push subscription: endpoint `https://api.antyspend.com/webhooks/google-play/rtdn`, OIDC auth, audience = webhook URL

## Verify endpoints after deploy

```bash
# Entitlements module live (401 without token, not 404)
curl -s -o /dev/null -w "%{http_code}\n" https://api.antyspend.com/entitlements/me
```

Replace `ACCESS_TOKEN` with a valid JWT from `POST /auth/google`.

```bash
# Current entitlement
curl -s -H "Authorization: Bearer ACCESS_TOKEN" \
  https://api.antyspend.com/entitlements/me | jq

# Verify purchase (after Play Store purchase)
curl -s -X POST https://api.antyspend.com/entitlements/verify-purchase \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "antyspend_personal_monthly",
    "purchaseToken": "PURCHASE_TOKEN_FROM_PLAY"
  }' | jq
```

Expected `GET /entitlements/me` response when active:

```json
{
  "userId": "...",
  "planType": "PERSONAL",
  "status": "ACTIVE",
  "expiresAtMillis": 1234567890123,
  "productId": "antyspend_personal_monthly",
  "source": "PLAY_STORE",
  "active": true,
  "autoRenewing": true
}
```

After an internal testing purchase, `POST /entitlements/verify-purchase` should return `status: ACTIVE` (not a verification-failed error in the app).

## RTDN webhook (manual test)

After Play Console **Send test notification**, check API logs for `Duplicate RTDN message` or successful processing. The endpoint always returns `200` with `{ "ok": true }` when the payload is accepted (including deduplicated replays).

For local development without OIDC:

```bash
RTDN_SKIP_AUTH=true npm run start:dev
```

Then POST a simulated Pub/Sub body to `http://localhost:3000/webhooks/google-play/rtdn`.

## Local development

In `.env`, use a filesystem path (no Azure Base64 required):

```env
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=/Users/you/secrets/play-sa.json
# GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64=
```

Or set `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64` in `.env` to test the same path as production.

## Post-deploy validation

1. Internal testing purchase → `POST /entitlements/verify-purchase` returns 200, `status: ACTIVE`
2. Play Console test RTDN → webhook 200, event stored in `billing_notification_events`
3. Cancel subscription in Play → RTDN `SUBSCRIPTION_CANCELED` → entitlement `status: CANCELED` until expiry
