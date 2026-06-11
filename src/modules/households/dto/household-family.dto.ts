import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ExpenseSplitLineDto {
  @IsString()
  @IsNotEmpty()
  participantUserId!: string;

  @IsNumber()
  @Min(0)
  owedAmountMinor!: number;
}

export class CreateExpenseSplitDto {
  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @IsString()
  @IsNotEmpty()
  paidByUserId!: string;

  @IsString()
  @IsNotEmpty()
  splitMethod!: string;

  @IsNumber()
  @Min(1)
  totalAmountMinor!: number;

  @IsString()
  @IsNotEmpty()
  currencyCode!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExpenseSplitLineDto)
  lines!: ExpenseSplitLineDto[];
}

export class UpdateExpenseSplitDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateSettlementDto {
  @IsString()
  @IsNotEmpty()
  fromUserId!: string;

  @IsString()
  @IsNotEmpty()
  toUserId!: string;

  @IsNumber()
  @Min(1)
  amountMinor!: number;

  @IsString()
  @IsNotEmpty()
  currencyCode!: string;

  @IsOptional()
  @IsString()
  linkedTransactionId?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  settledAtMillis?: number;
}

export class BudgetQuotaItemDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  quotaPercent!: number;
}

export class ReplaceBudgetQuotasDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BudgetQuotaItemDto)
  quotas!: BudgetQuotaItemDto[];
}
