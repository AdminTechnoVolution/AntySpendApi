# Anty financial assistant v2

The Android overlay now delegates conversation to a coordinator in the data module. The API interprets speech transcripts through OpenRouter; device repositories own financial queries and writes. Existing `POST /ai/mascot/turn` clients remain supported.

## Protocol

`POST /ai/mascot/v2/turn` requires the existing JWT and mascot premium guards. Requests include `conversationId`, `turnId`, `message`, `history`, `userLanguage` and `financialContext`. Responses echo the request IDs and contain `reply`, `decision`, `queries` and `actions`. Invalid model responses fail before reaching the device executor.

Decisions are `ANSWER`, `QUERY`, `ACTIONS`, `CONFIRM` and `CANCEL`. Query requests specify an entity, scope (`PRIVATE`, `HOUSEHOLD`, `BOTH`), calendar period, optional date/category/wallet/parent/search filters and offset. Custom date ranges have an exclusive end. Details are paginated in groups of 25; totals always cover every matching record. Amounts use integer minor units locally, serialized as decimal strings in model context to preserve 64-bit precision through JavaScript.

Supported query entities: transactions, wallets, categories, budgets, debts, debt movements, personal loans and repayments, recurring expenses, savings plans and movements, investments and movements. Accessible data shared by other family members is returned separately as read-only `MEMBER_SHARED` groups. Personal, household and member-shared totals are never merged.

Actions specify `operation`, `entity`, `scope`, `targetId`, `fields` (name/value strings), and `missingFields`. The executor validates field allowlists, real accessible references, amounts and permissions. Non-create targets must first have appeared in query results. Debt movements are read through `DEBT_MOVEMENT`; an existing debt movement is voided through a `VOID DEBT` action with `movementId`.

## Behavior

- A complete expense/income request saves immediately. A transcript containing several movements produces separate actions. Each action can use the same expense extraction service as the voice-entry screen, and both paths share category resolution.
- Other writes are prepared and described before confirmation. Proposals expire after five minutes, are checked against a data fingerprint, and are discarded on restart or account change.
- Supported management operations follow the app modules: create/update/delete financial resources; pay debts, loans and recurring expenses; create/update/delete savings and investment movements; delete loan repayments; void debt payments. Loan editing is limited to the person, as in the existing app. Existing currency locks and negative-balance restrictions remain enforced.
- Unqualified writes go to personal finances. Shared writes need an explicit shared-scope request. Members may add household movements and manage their own movements; household resource administration requires the owner.
- Available money means calendar-month income minus expenses, separated by currency and scope. It is distinct from wallet balance. This week begins Monday in the device timezone. Missing conversions are reported.
- The voice Activity owns the only avatar and bubble during listening/processing. The service restores its avatar after the Activity releases ownership. Turn IDs suppress duplicate callbacks and recover completed responses after Activity recreation.

## Interrupted writes

Before invoking a writer, the coordinator synchronously commits the prepared batch and an execution marker. Completed results are cached by account/turn. Repeated turns return those results without repeating writes. If the process or a network request fails between starting a writer and persisting its result, the result is **unknown** and is not automatically retried. The user must inspect the record before issuing a new request. This is an at-most-once replay guard, not a distributed transaction across network repositories.

## Validation and rollout

API: `npm test -- --runInBand mascot-chat.service.spec.ts mascot-premium.guard.spec.ts openrouter.client.spec.ts` and `npm run build`.

Android: `./gradlew :app:assembleDebug :data:testDebugUnitTest :domain:test`. Instrumented WebP-header regression: `./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.technovolution.antyspend.ui.AntyHeaderRenderingTest`.

Deploy the API before installing the updated normal Android build. Follow the existing GitHub Actions deployment described in `docs/DEPLOY.md`. No database schema migration or new environment variables are required.

For local device testing only, `-PantyApiBaseUrl=http://127.0.0.1:3000` overrides the debug API URL; use `adb reverse tcp:3000 tcp:3000` with the local API running. Release configuration is unchanged. Local API startup requires access to the configured MongoDB instance and OpenRouter.

The opt-in financial device test uses the signed-in test account, calls the deployed API/OpenRouter, and creates/cleans only marked expense fixtures. Run it with `-Pandroid.testInstrumentationRunnerArguments.class=com.technovolution.antyspend.ui.MascotFinancialDeviceTest -Pandroid.testInstrumentationRunnerArguments.antyFinancialE2e=true`. It intentionally fails if the server rejects the account; it does not bypass premium checks.

The hardware acceptance pass must still check listening, cancellation, rotation, background/foreground transitions, network errors, a real multi-item recording, and a read-after-write financial query.

## Model availability

The configured model may be retired independently of an app release. Text requests include an ordered OpenRouter `models` list with `google/gemini-3.5-flash-lite` as a structured-output fallback; image requests use the same image-capable fallback. Provider parameter enforcement and data-collection restrictions are preserved. See https://openrouter.ai/docs/guides/routing/model-fallbacks.
