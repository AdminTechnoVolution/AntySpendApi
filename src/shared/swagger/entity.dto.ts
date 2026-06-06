import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SyncableFieldsDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  createdAtMillis!: number;

  @ApiProperty()
  updatedAtMillis!: number;

  @ApiPropertyOptional()
  deletedAtMillis?: number;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class WalletDto extends SyncableFieldsDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty({ default: 'CASH' })
  walletType!: string;

  @ApiProperty({ default: 0 })
  initialBalanceMinor!: number;

  @ApiProperty({ default: false })
  isDefault!: boolean;
}

export class CreateWalletDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  currencyCode!: string;

  @ApiPropertyOptional({ default: 'CASH' })
  walletType?: string;

  @ApiPropertyOptional({ default: 0 })
  initialBalanceMinor?: number;

  @ApiPropertyOptional({ default: false })
  isDefault?: boolean;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class UpdateWalletDto extends PartialType(CreateWalletDto) {}

export class CategoryDto extends SyncableFieldsDto {
  @ApiPropertyOptional()
  key?: string;

  @ApiPropertyOptional()
  customName?: string;

  @ApiProperty()
  type!: string;

  @ApiPropertyOptional()
  iconName?: string;

  @ApiPropertyOptional()
  colorHex?: string;

  @ApiProperty({ default: false })
  isDefault!: boolean;
}

export class CreateCategoryDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  key?: string;

  @ApiPropertyOptional()
  customName?: string;

  @ApiProperty()
  type!: string;

  @ApiPropertyOptional()
  iconName?: string;

  @ApiPropertyOptional()
  colorHex?: string;

  @ApiPropertyOptional({ default: false })
  isDefault?: boolean;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class MerchantDto extends SyncableFieldsDto {
  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  normalizedName?: string;
}

export class CreateMerchantDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  normalizedName?: string;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class UpdateMerchantDto extends PartialType(CreateMerchantDto) {}

export class TransactionDto extends SyncableFieldsDto {
  @ApiProperty()
  type!: string;

  @ApiProperty()
  originalAmountMinor!: number;

  @ApiProperty()
  originalCurrencyCode!: string;

  @ApiProperty()
  primaryAmountMinor!: number;

  @ApiProperty()
  primaryCurrencyCode!: string;

  @ApiPropertyOptional()
  usdAmountMinor?: number;

  @ApiPropertyOptional()
  usdCurrencyCode?: string;

  @ApiPropertyOptional()
  exchangeRate?: string;

  @ApiPropertyOptional()
  exchangeRateFromCurrencyCode?: string;

  @ApiPropertyOptional()
  exchangeRateToCurrencyCode?: string;

  @ApiPropertyOptional()
  exchangeRateSource?: string;

  @ApiPropertyOptional()
  exchangeRateTimestampMillis?: number;

  @ApiPropertyOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiPropertyOptional()
  paymentMethodId?: string;

  @ApiPropertyOptional()
  paymentMethodKey?: string;

  @ApiPropertyOptional()
  merchantId?: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  note?: string;

  @ApiProperty()
  occurredAtMillis!: number;

  @ApiProperty({ default: 'MANUAL' })
  source!: string;

  @ApiPropertyOptional()
  rawInput?: string;

  @ApiPropertyOptional()
  confidence?: number;
}

export class CreateTransactionDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  originalAmountMinor!: number;

  @ApiProperty()
  originalCurrencyCode!: string;

  @ApiProperty()
  primaryAmountMinor!: number;

  @ApiProperty()
  primaryCurrencyCode!: string;

  @ApiPropertyOptional()
  usdAmountMinor?: number;

  @ApiPropertyOptional()
  usdCurrencyCode?: string;

  @ApiPropertyOptional()
  exchangeRate?: string;

  @ApiPropertyOptional()
  exchangeRateFromCurrencyCode?: string;

  @ApiPropertyOptional()
  exchangeRateToCurrencyCode?: string;

  @ApiPropertyOptional()
  exchangeRateSource?: string;

  @ApiPropertyOptional()
  exchangeRateTimestampMillis?: number;

  @ApiPropertyOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiPropertyOptional()
  paymentMethodId?: string;

  @ApiPropertyOptional()
  paymentMethodKey?: string;

  @ApiPropertyOptional()
  merchantId?: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  note?: string;

  @ApiProperty()
  occurredAtMillis!: number;

  @ApiPropertyOptional({ default: 'MANUAL' })
  source?: string;

  @ApiPropertyOptional()
  rawInput?: string;

  @ApiPropertyOptional()
  confidence?: number;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}

export class TransactionQueryDto {
  @ApiPropertyOptional({ description: 'Filter transactions from this epoch millis' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fromMillis?: number;

  @ApiPropertyOptional({ description: 'Filter transactions until this epoch millis' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  toMillis?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class BudgetDto extends SyncableFieldsDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiProperty()
  limitAmountMinor!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty()
  periodType!: string;

  @ApiProperty()
  periodStartUtcMillis!: number;

  @ApiPropertyOptional()
  periodEndExclusiveUtcMillis?: number;

  @ApiProperty({ default: 80 })
  alertThresholdPercent!: number;

  @ApiProperty({ default: true })
  isActive!: boolean;
}

export class CreateBudgetDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiProperty()
  limitAmountMinor!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty()
  periodType!: string;

  @ApiProperty()
  periodStartUtcMillis!: number;

  @ApiPropertyOptional()
  periodEndExclusiveUtcMillis?: number;

  @ApiPropertyOptional({ default: 80 })
  alertThresholdPercent?: number;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {}

export class RecurringExpenseDto extends SyncableFieldsDto {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  transactionType!: string;

  @ApiProperty()
  amountMinor!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiPropertyOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiPropertyOptional()
  merchantId?: string;

  @ApiProperty()
  frequency!: string;

  @ApiProperty()
  dueDayOfMonth!: number;

  @ApiPropertyOptional()
  recurrenceDays?: string;

  @ApiProperty()
  nextDueAtMillis!: number;

  @ApiPropertyOptional()
  paymentMethodKey?: string;

  @ApiProperty({ default: true })
  isActive!: boolean;
}

export class CreateRecurringExpenseDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  transactionType!: string;

  @ApiProperty()
  amountMinor!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiPropertyOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiPropertyOptional()
  merchantId?: string;

  @ApiProperty()
  frequency!: string;

  @ApiProperty()
  dueDayOfMonth!: number;

  @ApiPropertyOptional()
  recurrenceDays?: string;

  @ApiProperty()
  nextDueAtMillis!: number;

  @ApiPropertyOptional()
  paymentMethodKey?: string;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class UpdateRecurringExpenseDto extends PartialType(CreateRecurringExpenseDto) {}

export class SavingsPlanDto extends SyncableFieldsDto {
  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  purpose?: string;

  @ApiProperty()
  goalAmountMinor!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty()
  plannedContributionAmountMinor!: number;

  @ApiProperty()
  frequency!: string;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiProperty()
  startDateUtcMillis!: number;

  @ApiPropertyOptional()
  targetDateUtcMillis?: number;

  @ApiPropertyOptional()
  iconName?: string;

  @ApiPropertyOptional()
  colorHex?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({ default: true })
  isActive!: boolean;
}

export class CreateSavingsPlanDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  purpose?: string;

  @ApiProperty()
  goalAmountMinor!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty()
  plannedContributionAmountMinor!: number;

  @ApiProperty()
  frequency!: string;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiProperty()
  startDateUtcMillis!: number;

  @ApiPropertyOptional()
  targetDateUtcMillis?: number;

  @ApiPropertyOptional()
  iconName?: string;

  @ApiPropertyOptional()
  colorHex?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class UpdateSavingsPlanDto extends PartialType(CreateSavingsPlanDto) {}

export class SavingsMovementDto extends SyncableFieldsDto {
  @ApiProperty()
  savingsPlanId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  originalAmountMinor!: number;

  @ApiProperty()
  originalCurrencyCode!: string;

  @ApiProperty()
  convertedAmountMinor!: number;

  @ApiProperty()
  convertedCurrencyCode!: string;

  @ApiPropertyOptional()
  exchangeRate?: string;

  @ApiPropertyOptional()
  exchangeRateSource?: string;

  @ApiPropertyOptional()
  exchangeRateTimestampMillis?: number;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiProperty()
  dateUtcMillis!: number;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  note?: string;
}

export class CreateSavingsMovementDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  savingsPlanId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  originalAmountMinor!: number;

  @ApiProperty()
  originalCurrencyCode!: string;

  @ApiProperty()
  convertedAmountMinor!: number;

  @ApiProperty()
  convertedCurrencyCode!: string;

  @ApiPropertyOptional()
  exchangeRate?: string;

  @ApiPropertyOptional()
  exchangeRateSource?: string;

  @ApiPropertyOptional()
  exchangeRateTimestampMillis?: number;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiProperty()
  dateUtcMillis!: number;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  note?: string;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class UpdateSavingsMovementDto extends PartialType(CreateSavingsMovementDto) {}

export class InvestmentDto extends SyncableFieldsDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  institution!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  currencyCode!: string;

  @ApiPropertyOptional()
  defaultWalletId?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({ default: true })
  isActive!: boolean;
}

export class CreateInvestmentDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  institution!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  currencyCode!: string;

  @ApiPropertyOptional()
  defaultWalletId?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional({ default: true })
  isActive?: boolean;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class UpdateInvestmentDto extends PartialType(CreateInvestmentDto) {}

export class InvestmentMovementDto extends SyncableFieldsDto {
  @ApiProperty()
  investmentId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  amountMinor!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiProperty()
  dateUtcMillis!: number;

  @ApiPropertyOptional()
  note?: string;
}

export class CreateInvestmentMovementDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  investmentId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  amountMinor!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiPropertyOptional()
  walletId?: string;

  @ApiProperty()
  dateUtcMillis!: number;

  @ApiPropertyOptional()
  note?: string;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class UpdateInvestmentMovementDto extends PartialType(CreateInvestmentMovementDto) {}

export class UserSettingsDto extends SyncableFieldsDto {
  @ApiProperty({ default: 'USD' })
  primaryCurrencyCode!: string;

  @ApiProperty({ default: false })
  hasCompletedOnboarding!: boolean;

  @ApiProperty({ default: 'SYSTEM' })
  themeMode!: string;

  @ApiPropertyOptional()
  defaultWalletId?: string;

  @ApiProperty({ default: true })
  voiceInputEnabled!: boolean;

  @ApiProperty({ default: false })
  usdConversionEnabled!: boolean;

  @ApiPropertyOptional()
  preferredSecondaryCurrencyCode?: string;

  @ApiProperty({ default: 'AUTO' })
  exchangeRateMode!: string;

  @ApiPropertyOptional()
  manualUsdPerPrimaryUnit?: string;

  @ApiProperty({ default: 0 })
  microExpenseThresholdPrimaryMinor!: number;

  @ApiPropertyOptional()
  appLanguage?: string;

  @ApiProperty({ default: 'MEDIUM' })
  textSize!: string;

  @ApiPropertyOptional()
  googleUserName?: string;

  @ApiPropertyOptional()
  googleUserEmail?: string;

  @ApiPropertyOptional()
  googleUserProfilePictureUrl?: string;

  @ApiProperty({ default: false })
  displayNameUserEdited?: boolean;
}

export class UpdateUserSettingsDto {
  @ApiPropertyOptional()
  primaryCurrencyCode?: string;

  @ApiPropertyOptional()
  hasCompletedOnboarding?: boolean;

  @ApiPropertyOptional()
  themeMode?: string;

  @ApiPropertyOptional()
  defaultWalletId?: string;

  @ApiPropertyOptional()
  voiceInputEnabled?: boolean;

  @ApiPropertyOptional()
  usdConversionEnabled?: boolean;

  @ApiPropertyOptional()
  preferredSecondaryCurrencyCode?: string;

  @ApiPropertyOptional()
  exchangeRateMode?: string;

  @ApiPropertyOptional()
  manualUsdPerPrimaryUnit?: string;

  @ApiPropertyOptional()
  microExpenseThresholdPrimaryMinor?: number;

  @ApiPropertyOptional()
  appLanguage?: string;

  @ApiPropertyOptional()
  textSize?: string;

  @ApiPropertyOptional()
  googleUserName?: string;

  @ApiPropertyOptional()
  googleUserEmail?: string;

  @ApiPropertyOptional()
  googleUserProfilePictureUrl?: string;

  @ApiPropertyOptional()
  displayNameUserEdited?: boolean;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;
}

export class CurrencyDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  minorUnits!: number;

  @ApiProperty()
  displayLabel!: string;

  @ApiProperty()
  createdAtMillis!: number;

  @ApiProperty()
  updatedAtMillis!: number;
}

export class CurrencySeedResponseDto {
  @ApiProperty({ example: true })
  seeded!: boolean;
}
