import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  SyncableEntity,
  syncableIndexes,
  householdShareableIndexes,
} from '../../shared/sync/syncable.schema';

@Schema({ collection: 'user_settings', strict: true })
export class UserSettings extends SyncableEntity {
  @Prop({ required: true, default: 'USD' })
  primaryCurrencyCode!: string;

  @Prop({ required: true, default: false })
  hasCompletedOnboarding!: boolean;

  @Prop({ required: true, default: 'SYSTEM' })
  themeMode!: string;

  @Prop()
  defaultWalletId?: string;

  @Prop({ required: true, default: true })
  voiceInputEnabled!: boolean;

  @Prop({ required: true, default: false })
  usdConversionEnabled!: boolean;

  @Prop()
  preferredSecondaryCurrencyCode?: string;

  @Prop({ required: true, default: 'AUTO' })
  exchangeRateMode!: string;

  @Prop()
  manualUsdPerPrimaryUnit?: string;

  @Prop({ required: true, default: 0 })
  microExpenseThresholdPrimaryMinor!: number;

  @Prop()
  appLanguage?: string;

  @Prop({ required: true, default: 'MEDIUM' })
  textSize!: string;

  @Prop()
  googleUserName?: string;

  @Prop()
  googleUserEmail?: string;

  @Prop()
  googleUserProfilePictureUrl?: string;

  @Prop({ default: false })
  displayNameUserEdited?: boolean;
}

export type UserSettingsDocument = HydratedDocument<UserSettings>;
export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
syncableIndexes(UserSettingsSchema);
UserSettingsSchema.index({ userId: 1 }, { unique: true });

@Schema({ collection: 'wallets' })
export class Wallet extends SyncableEntity {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  currencyCode!: string;

  @Prop({ required: true, default: 'CASH' })
  walletType!: string;

  @Prop({ required: true, default: 0 })
  initialBalanceMinor!: number;

  @Prop({ required: true, default: false })
  isDefault!: boolean;
}

export type WalletDocument = HydratedDocument<Wallet>;
export const WalletSchema = SchemaFactory.createForClass(Wallet);
syncableIndexes(WalletSchema);
householdShareableIndexes(WalletSchema);

@Schema({ collection: 'categories' })
export class Category extends SyncableEntity {
  @Prop()
  key?: string;

  @Prop()
  customName?: string;

  @Prop({ required: true })
  type!: string;

  @Prop()
  iconName?: string;

  @Prop()
  colorHex?: string;

  @Prop({ required: true, default: false })
  isDefault!: boolean;
}

export type CategoryDocument = HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);
syncableIndexes(CategorySchema);
householdShareableIndexes(CategorySchema);

@Schema({ collection: 'merchants' })
export class Merchant extends SyncableEntity {
  @Prop({ required: true })
  name!: string;

  @Prop()
  normalizedName?: string;
}

export type MerchantDocument = HydratedDocument<Merchant>;
export const MerchantSchema = SchemaFactory.createForClass(Merchant);
syncableIndexes(MerchantSchema);

@Schema({ collection: 'transactions' })
export class Transaction extends SyncableEntity {
  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  originalAmountMinor!: number;

  @Prop({ required: true })
  originalCurrencyCode!: string;

  @Prop({ required: true })
  primaryAmountMinor!: number;

  @Prop({ required: true })
  primaryCurrencyCode!: string;

  @Prop()
  usdAmountMinor?: number;

  @Prop()
  usdCurrencyCode?: string;

  @Prop()
  exchangeRate?: string;

  @Prop()
  exchangeRateFromCurrencyCode?: string;

  @Prop()
  exchangeRateToCurrencyCode?: string;

  @Prop()
  exchangeRateSource?: string;

  @Prop()
  exchangeRateTimestampMillis?: number;

  @Prop()
  categoryId?: string;

  @Prop()
  walletId?: string;

  @Prop()
  paymentMethodId?: string;

  @Prop()
  paymentMethodKey?: string;

  @Prop()
  merchantId?: string;

  @Prop()
  title?: string;

  @Prop()
  note?: string;

  @Prop({ required: true })
  occurredAtMillis!: number;

  @Prop({ required: true, default: 'MANUAL' })
  source!: string;

  @Prop()
  rawInput?: string;

  @Prop()
  confidence?: number;
}

export type TransactionDocument = HydratedDocument<Transaction>;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
syncableIndexes(TransactionSchema);
householdShareableIndexes(TransactionSchema);
TransactionSchema.index({ userId: 1, occurredAtMillis: -1 });

@Schema({ collection: 'budgets' })
export class Budget extends SyncableEntity {
  @Prop()
  name?: string;

  @Prop()
  categoryId?: string;

  @Prop()
  walletId?: string;

  @Prop({ required: true })
  limitAmountMinor!: number;

  @Prop({ required: true })
  currencyCode!: string;

  @Prop({ required: true })
  periodType!: string;

  @Prop({ required: true })
  periodStartUtcMillis!: number;

  @Prop()
  periodEndExclusiveUtcMillis?: number;

  @Prop({ required: true, default: 80 })
  alertThresholdPercent!: number;

  @Prop({ required: true, default: true })
  isActive!: boolean;
}

export type BudgetDocument = HydratedDocument<Budget>;
export const BudgetSchema = SchemaFactory.createForClass(Budget);
syncableIndexes(BudgetSchema);
householdShareableIndexes(BudgetSchema);

@Schema({ collection: 'expense_splits' })
export class ExpenseSplit extends SyncableEntity {
  @Prop({ required: true })
  transactionId!: string;

  @Prop({ required: true })
  paidByUserId!: string;

  @Prop({ required: true })
  splitMethod!: string;

  @Prop({ required: true })
  totalAmountMinor!: number;

  @Prop({ required: true })
  currencyCode!: string;

  @Prop()
  note?: string;

  @Prop({ required: true, default: 'OPEN' })
  status!: string;
}

export type ExpenseSplitDocument = HydratedDocument<ExpenseSplit>;
export const ExpenseSplitSchema = SchemaFactory.createForClass(ExpenseSplit);
syncableIndexes(ExpenseSplitSchema);
householdShareableIndexes(ExpenseSplitSchema);

@Schema({ collection: 'expense_split_lines' })
export class ExpenseSplitLine extends SyncableEntity {
  @Prop({ required: true })
  expenseSplitId!: string;

  @Prop({ required: true })
  participantUserId!: string;

  @Prop({ required: true })
  owedAmountMinor!: number;
}

export type ExpenseSplitLineDocument = HydratedDocument<ExpenseSplitLine>;
export const ExpenseSplitLineSchema =
  SchemaFactory.createForClass(ExpenseSplitLine);
syncableIndexes(ExpenseSplitLineSchema);
householdShareableIndexes(ExpenseSplitLineSchema);

@Schema({ collection: 'settlements' })
export class Settlement extends SyncableEntity {
  @Prop({ required: true })
  fromUserId!: string;

  @Prop({ required: true })
  toUserId!: string;

  @Prop({ required: true })
  amountMinor!: number;

  @Prop({ required: true })
  currencyCode!: string;

  @Prop()
  linkedTransactionId?: string;

  @Prop()
  note?: string;

  @Prop({ required: true })
  settledAtMillis!: number;
}

export type SettlementDocument = HydratedDocument<Settlement>;
export const SettlementSchema = SchemaFactory.createForClass(Settlement);
syncableIndexes(SettlementSchema);
householdShareableIndexes(SettlementSchema);

@Schema({ collection: 'budget_member_quotas' })
export class BudgetMemberQuota extends SyncableEntity {
  @Prop({ required: true })
  budgetId!: string;

  @Prop({ required: true })
  memberUserId!: string;

  @Prop({ required: true })
  quotaPercent!: number;
}

export type BudgetMemberQuotaDocument = HydratedDocument<BudgetMemberQuota>;
export const BudgetMemberQuotaSchema =
  SchemaFactory.createForClass(BudgetMemberQuota);
syncableIndexes(BudgetMemberQuotaSchema);
householdShareableIndexes(BudgetMemberQuotaSchema);

@Schema({ collection: 'debt_accounts' })
export class DebtAccount extends SyncableEntity {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  balanceAmountMinor!: number;

  @Prop({ required: true })
  currencyCode!: string;

  @Prop({ required: true })
  annualInterestRateBps!: number;

  @Prop({ required: true })
  minimumPaymentMinor!: number;

  @Prop()
  recurringExpenseId?: string;

  @Prop({ required: true, default: true })
  isActive!: boolean;
}

export type DebtAccountDocument = HydratedDocument<DebtAccount>;
export const DebtAccountSchema = SchemaFactory.createForClass(DebtAccount);
syncableIndexes(DebtAccountSchema);
householdShareableIndexes(DebtAccountSchema);

@Schema({ collection: 'recurring_expenses' })
export class RecurringExpense extends SyncableEntity {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  transactionType!: string;

  @Prop({ required: true })
  amountMinor!: number;

  @Prop({ required: true })
  currencyCode!: string;

  @Prop()
  categoryId?: string;

  @Prop()
  walletId?: string;

  @Prop()
  merchantId?: string;

  @Prop({ required: true })
  frequency!: string;

  @Prop({ required: true })
  dueDayOfMonth!: number;

  @Prop()
  recurrenceDays?: string;

  @Prop({ required: true })
  nextDueAtMillis!: number;

  @Prop()
  paymentMethodKey?: string;

  @Prop({ required: true, default: true })
  isActive!: boolean;
}

export type RecurringExpenseDocument = HydratedDocument<RecurringExpense>;
export const RecurringExpenseSchema =
  SchemaFactory.createForClass(RecurringExpense);
syncableIndexes(RecurringExpenseSchema);

@Schema({ collection: 'savings_plans' })
export class SavingsPlan extends SyncableEntity {
  @Prop({ required: true })
  name!: string;

  @Prop()
  purpose?: string;

  @Prop({ required: true })
  goalAmountMinor!: number;

  @Prop({ required: true })
  currencyCode!: string;

  @Prop({ required: true })
  plannedContributionAmountMinor!: number;

  @Prop({ required: true })
  frequency!: string;

  @Prop()
  walletId?: string;

  @Prop({ required: true })
  startDateUtcMillis!: number;

  @Prop()
  targetDateUtcMillis?: number;

  @Prop()
  iconName?: string;

  @Prop()
  colorHex?: string;

  @Prop()
  notes?: string;

  @Prop({ required: true, default: true })
  isActive!: boolean;
}

export type SavingsPlanDocument = HydratedDocument<SavingsPlan>;
export const SavingsPlanSchema = SchemaFactory.createForClass(SavingsPlan);
syncableIndexes(SavingsPlanSchema);
householdShareableIndexes(SavingsPlanSchema);

@Schema({ collection: 'savings_movements' })
export class SavingsMovement extends SyncableEntity {
  @Prop({ required: true })
  savingsPlanId!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  originalAmountMinor!: number;

  @Prop({ required: true })
  originalCurrencyCode!: string;

  @Prop({ required: true })
  convertedAmountMinor!: number;

  @Prop({ required: true })
  convertedCurrencyCode!: string;

  @Prop()
  exchangeRate?: string;

  @Prop()
  exchangeRateSource?: string;

  @Prop()
  exchangeRateTimestampMillis?: number;

  @Prop()
  walletId?: string;

  @Prop({ required: true })
  dateUtcMillis!: number;

  @Prop()
  reason?: string;

  @Prop()
  note?: string;
}

export type SavingsMovementDocument = HydratedDocument<SavingsMovement>;
export const SavingsMovementSchema =
  SchemaFactory.createForClass(SavingsMovement);
syncableIndexes(SavingsMovementSchema);
householdShareableIndexes(SavingsMovementSchema);

@Schema({ collection: 'investments' })
export class Investment extends SyncableEntity {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  institution!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  currencyCode!: string;

  @Prop()
  defaultWalletId?: string;

  @Prop()
  notes?: string;

  @Prop({ required: true, default: true })
  isActive!: boolean;
}

export type InvestmentDocument = HydratedDocument<Investment>;
export const InvestmentSchema = SchemaFactory.createForClass(Investment);
syncableIndexes(InvestmentSchema);
householdShareableIndexes(InvestmentSchema);

@Schema({ collection: 'investment_movements' })
export class InvestmentMovement extends SyncableEntity {
  @Prop({ required: true })
  investmentId!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  amountMinor!: number;

  @Prop({ required: true })
  currencyCode!: string;

  @Prop()
  walletId?: string;

  @Prop({ required: true })
  dateUtcMillis!: number;

  @Prop()
  note?: string;
}

export type InvestmentMovementDocument = HydratedDocument<InvestmentMovement>;
export const InvestmentMovementSchema =
  SchemaFactory.createForClass(InvestmentMovement);
syncableIndexes(InvestmentMovementSchema);
householdShareableIndexes(InvestmentMovementSchema);

@Schema({ collection: 'currencies', strict: true })
export class Currency {
  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ required: true })
  minorUnits!: number;

  @Prop({ required: true })
  displayLabel!: string;

  @Prop({ required: true })
  createdAtMillis!: number;

  @Prop({ required: true })
  updatedAtMillis!: number;
}

export type CurrencyDocument = HydratedDocument<Currency>;
export const CurrencySchema = SchemaFactory.createForClass(Currency);

@Schema({ collection: 'exchange_rate_snapshots', strict: true })
export class ExchangeRateSnapshot {
  @Prop({ required: true, default: 'USD' })
  baseCurrency!: string;

  @Prop({ required: true })
  snapshotDate!: string;

  @Prop({ type: Object, required: true })
  rates!: Record<string, number>;

  @Prop({ required: true })
  fetchedAtMillis!: number;

  @Prop({ required: true })
  expiresAtMillis!: number;
}

export type ExchangeRateSnapshotDocument =
  HydratedDocument<ExchangeRateSnapshot>;
export const ExchangeRateSnapshotSchema =
  SchemaFactory.createForClass(ExchangeRateSnapshot);
ExchangeRateSnapshotSchema.index(
  { baseCurrency: 1, snapshotDate: 1 },
  { unique: true },
);
