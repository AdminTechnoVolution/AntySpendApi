import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SyncableEntity, syncableIndexes } from '../../shared/sync/syncable.schema';

@Schema({ collection: 'user_settings' })
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

@Schema({ collection: 'currencies' })
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

@Schema({ collection: 'exchange_rate_snapshots' })
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
export const ExchangeRateSnapshotSchema = SchemaFactory.createForClass(
  ExchangeRateSnapshot,
);
ExchangeRateSnapshotSchema.index(
  { baseCurrency: 1, snapshotDate: 1 },
  { unique: true },
);
