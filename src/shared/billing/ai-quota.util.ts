/** Shared monthly free-AI-usage quota (expense-extraction, receipt-extraction, leak-analysis, monthly-report). */
export const AI_FREE_MONTHLY_QUOTA = 5;

/** Calendar month key in UTC, e.g. '2026-08'. Used to detect month rollover for the free quota. */
export function currentUtcMonthKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 7);
}

/** Start of the next UTC calendar month, in epoch millis — when the free quota resets. */
export function startOfNextUtcMonthMillis(now = Date.now()): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
}
