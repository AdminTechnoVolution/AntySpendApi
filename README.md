# AntySpend API

NestJS backend for the [AntySpend](https://github.com/technovolution/AntySpend) Android app. Provides JWT auth (Google Sign-In), CRUD for all financial entities, AI expense extraction & leak analysis (OpenRouter), exchange-rate proxy, and offline-first LWW sync.

## Stack

- NestJS 11 + TypeScript
- MongoDB (Mongoose)
- JWT + Google idToken verification
- OpenRouter (server-side only)
- ExchangeRate-API proxy with Mongo cache
- Swagger UI at `/docs`, OpenAPI JSON at `/docs-json` and `/openapi.json` (when `ENABLE_SWAGGER=true`)

## Prerequisites

- Node.js 20+
- MongoDB 6+ (local or Atlas)
- Google OAuth Web Client ID (same as Android)
- OpenRouter API key (for AI endpoints)
- ExchangeRate-API token (optional; for live FX rates)

## Setup

```bash
cd antyspend-api
cp .env.example .env
# Edit .env with your values

npm install
npm run start:dev
```

API runs at `http://localhost:3000`.

Set `ENABLE_SWAGGER=true` in `.env` to expose Swagger (off by default).

| Resource | URL |
|---|---|
| Swagger UI | `http://localhost:3000/docs` (requires `ENABLE_SWAGGER=true`) |
| OpenAPI JSON | `http://localhost:3000/docs-json` or `http://localhost:3000/openapi.json` (requires `ENABLE_SWAGGER=true`) |

Use **Authorize** in Swagger UI with `Bearer <accessToken>` from `POST /auth/google`.

### Export OpenAPI spec

```bash
# With the dev server running and ENABLE_SWAGGER=true:
curl -s http://localhost:3000/openapi.json -o openapi.json

# Or from docs-json:
curl -s http://localhost:3000/docs-json -o openapi.json
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT (min 16 chars) |
| `JWT_ACCESS_EXPIRES` | No | Access token TTL (default `15m`) |
| `JWT_REFRESH_EXPIRES` | No | Refresh token TTL (default `7d`) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth Web Client ID |
| `OPENROUTER_API_KEY` | For AI | OpenRouter API key |
| `OPENROUTER_MODEL` | No | Model id (default `google/gemini-2.5-flash-lite`) |
| `EXCHANGE_RATE_API_TOKEN` | For FX | ExchangeRate-API v6 token |
| `RATE_LIMIT_MAX` | No | Max requests per client per window (default `50`) |
| `RATE_LIMIT_TTL_MS` | No | Rate limit window in ms (default `60000`) |
| `ENABLE_SWAGGER` | No | Expose `/docs` and OpenAPI JSON (default `false`) |
| `PORT` | No | HTTP port (default `3000`) |

## Security

### Rate limiting

- **50 requests per minute** per client (configurable via `RATE_LIMIT_MAX` / `RATE_LIMIT_TTL_MS`).
- Client identity: **`userId` from a valid JWT access token**, otherwise **client IP** (respects `trust proxy` for one hop behind a reverse proxy).
- Returns **429 Too Many Requests** when exceeded.
- Swagger/OpenAPI routes (`/docs`, `/docs-json`, `/openapi.json`) are excluded when enabled via `ENABLE_SWAGGER=true`.
- Leave **`ENABLE_SWAGGER=false`** in production unless you explicitly need public API docs.
- Storage is **in-memory** (single instance). Use Redis-backed throttling for multi-replica deployments.

### NoSQL injection protection

Defense in depth for MongoDB writes and queries:

1. **HTTP middleware** — strips `$` operator keys and dotted keys from JSON **request bodies** before validation (Express 5 `req.query` is read-only; query/route params use DTOs and `ParseEntityIdPipe`).
2. **Validation** — `ValidationPipe` whitelists DTO fields; sync payloads reject nested Mongo operators via `@RejectMongoOperators()`.
3. **Service layer** — `sanitizeDocumentForStorage()` deep-strips dangerous keys before any `$set` in sync, CRUD, and settings updates.
4. **Mongoose** — `strictQuery` and `strict: true` schemas at connection and schema level.
5. **Route params** — CRUD `:id` params must match 32-char hex (`ParseEntityIdPipe`).

### MongoDB Atlas recommendations

- Use a **least-privilege** database user (read/write on the app database only).
- Enable **IP allowlist** (or VPC peering) for production.
- Store `MONGODB_URI` only in environment secrets; rotate credentials periodically.
- Never log connection strings in production.


Vertical slices per domain module:

```
src/modules/<slice>/
  presentation/   # Controllers
  application/    # Use cases / services
  infrastructure/ # Mongo schemas (shared in entity.schemas.ts)
  dto/            # Request/response DTOs
```

Shared cross-cutting code lives in `src/shared/` (config, auth, sync LWW, OpenRouter client, prompts).

## Key endpoints

### Auth
- `POST /auth/google` — exchange Google idToken for JWT pair
- `POST /auth/refresh` — refresh access token
- `POST /auth/logout` — revoke refresh token
- `DELETE /auth/account` — permanently delete authenticated user and all cloud data (Bearer JWT)
- `GET /auth/me` — authenticated profile

### AI (Bearer JWT)
- `POST /ai/expense-extraction` — `{ text, defaultCurrencyCode?, userLanguage? }`
- `POST /ai/leak-analysis` — `{ month?, userLanguage? }` (loads transactions from Mongo)

### Exchange rates
- `GET /exchange-rates/latest` — USD-based rates (Mongo cache, 1 snapshot/día UTC)

### CRUD (Bearer JWT, scoped by userId)
- `GET|POST|PATCH|DELETE /wallets`
- `GET|POST|PATCH|DELETE /categories`
- `GET|POST|PATCH|DELETE /merchants`
- `GET|POST|PATCH|DELETE /transactions`
- `GET|POST|PATCH|DELETE /budgets`
- `GET|POST|PATCH|DELETE /recurring-expenses`
- `POST /recurring-expenses/:id/mark-paid`
- `GET|POST|PATCH|DELETE /savings-plans`
- `GET|POST|PATCH|DELETE /savings-movements`
- `GET|POST|PATCH|DELETE /investments`
- `GET|POST|PATCH|DELETE /investment-movements`
- `GET|PATCH /settings`
- `GET /currencies` — global catalog (seeded on startup)
- `POST /currencies/seed` — re-run seed

### Sync (Bearer JWT)
- `POST /sync/push` — bulk LWW push `{ changes[], lastKnownServerVersion?, deviceId? }`
- `GET /sync/pull?since=<serverVersion>` — pull all user entities

All syncable entities include: `id`, `userId`, `createdAtMillis`, `updatedAtMillis`, optional `deletedAtMillis`, `clientUpdatedAtMillis`, `deviceId`.

**LWW rule:** client wins if `updatedAtMillis` is newer; on tie, lexicographically greater `deviceId` wins, else server wins.

## Scripts

```bash
npm run start:dev    # watch mode
npm run build        # compile
npm run start:prod   # run compiled
npm test             # unit tests
npm run test:e2e     # e2e tests
```

## Android integration

1. After Google Sign-In, POST idToken to `/auth/google`; store `accessToken` + `refreshToken`.
2. Send `Authorization: Bearer <accessToken>` on all protected routes.
3. On 401, refresh via `/auth/refresh`.
4. Replace direct OpenRouter / ExchangeRate calls with `/ai/*` and `/exchange-rates/latest`.
5. Use `/sync/push` and `/sync/pull` for offline-first Room sync.

## License

Private — AntySpend project.
