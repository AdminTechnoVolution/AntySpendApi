export const SYNC_ENTITY_TYPES = [
  'settings',
  'wallets',
  'categories',
  'merchants',
  'transactions',
  'budgets',
  'recurring_expenses',
  'savings_plans',
  'savings_movements',
  'investments',
  'investment_movements',
  'expense_splits',
  'expense_split_lines',
  'settlements',
  'budget_member_quotas',
  'debt_accounts',
] as const;

export type SyncEntityType = (typeof SYNC_ENTITY_TYPES)[number];

export interface SyncChange {
  entityType: SyncEntityType;
  entityId: string;
  updatedAtMillis: number;
  deletedAtMillis?: number;
  clientUpdatedAtMillis?: number;
  deviceId?: string;
  payload: Record<string, unknown>;
}

export interface SyncPushRequest {
  changes: SyncChange[];
  lastKnownServerVersion?: string;
  deviceId?: string;
}

export interface SyncPushResult {
  accepted: string[];
  rejected: Array<{ entityId: string; reason: string }>;
  noop: string[];
  serverVersion: string;
}

export interface SyncPullResult {
  entities: SyncChange[];
  newServerVersion: string;
}

export interface SyncableFields {
  id: string;
  userId: string;
  createdAtMillis: number;
  updatedAtMillis: number;
  deletedAtMillis?: number;
  clientUpdatedAtMillis?: number;
  deviceId?: string;
}
