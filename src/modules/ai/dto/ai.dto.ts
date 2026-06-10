import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ExpenseExtractionRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  defaultCurrencyCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userLanguage?: string;
}

export class ReceiptExtractionRequestDto {
  @ApiProperty({ description: 'Base64-encoded image bytes without a data: URL prefix' })
  @IsString()
  @IsNotEmpty()
  imageBase64!: string;

  @ApiProperty({
    enum: ['jpeg', 'png', 'webp', 'image/jpeg', 'image/png', 'image/webp'],
  })
  @IsString()
  @IsIn(['jpeg', 'png', 'webp', 'image/jpeg', 'image/png', 'image/webp'])
  mimeType!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  defaultCurrencyCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userLanguage?: string;

  @ApiProperty({
    required: false,
    description: 'Optional on-device OCR text used as a parsing hint',
  })
  @IsOptional()
  @IsString()
  ocrText?: string;
}

export class LeakAnalysisTransactionDto {
  @ApiProperty()
  @IsNumber()
  id!: number;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsNumber()
  amount!: number;

  @ApiProperty()
  @IsString()
  currencyCode!: string;

  @ApiProperty()
  @IsString()
  categoryName!: string;

  @ApiProperty()
  @IsNumber()
  daysAgo!: number;

  @ApiProperty()
  @IsNumber()
  occurredAtMillis!: number;
}

export class LeakAnalysisRecurringDto {
  @ApiProperty()
  @IsNumber()
  id!: number;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsNumber()
  amount!: number;

  @ApiProperty()
  @IsString()
  currencyCode!: string;

  @ApiProperty()
  @IsString()
  categoryName!: string;

  @ApiProperty()
  @IsString()
  frequency!: string;

  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}

export class LeakAnalysisRequestDto {
  @ApiProperty({ required: false, description: 'Month in YYYY-MM format; defaults to current month' })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userLanguage?: string;

  @ApiProperty({ required: false, type: [LeakAnalysisTransactionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeakAnalysisTransactionDto)
  transactions?: LeakAnalysisTransactionDto[];

  @ApiProperty({ required: false, type: [LeakAnalysisRecurringDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeakAnalysisRecurringDto)
  recurringExpenses?: LeakAnalysisRecurringDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  primaryCurrencyCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  microExpenseThresholdPrimaryMinor?: number;
}
