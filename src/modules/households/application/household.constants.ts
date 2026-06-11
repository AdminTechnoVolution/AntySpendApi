export const MAX_HOUSEHOLD_MEMBERS = 5;
export const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export const OWNER_ONLY_SHARED_ENTITY_TYPES = new Set([
  'wallets',
  'categories',
  'budgets',
  'savings_plans',
  'investments',
  'debt_accounts',
]);

export const MEMBER_CONTRIBUTION_ENTITY_TYPES = new Set([
  'transactions',
  'savings_movements',
  'investment_movements',
]);

export const HOUSEHOLD_SHAREABLE_ENTITY_TYPES = new Set([
  ...OWNER_ONLY_SHARED_ENTITY_TYPES,
  ...MEMBER_CONTRIBUTION_ENTITY_TYPES,
  'expense_splits',
  'expense_split_lines',
  'settlements',
  'budget_member_quotas',
]);
