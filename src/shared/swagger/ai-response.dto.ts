import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpenseExtractionResponseDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  expenses!: Array<Record<string, unknown>>;
}

export class DetectedLeakDto {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  explanation!: string;

  @ApiProperty()
  savingTip!: string;

  @ApiProperty()
  frequency!: string;

  @ApiProperty()
  aggregateAmount!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty()
  severity!: string;

  @ApiProperty({ type: [Number] })
  associatedTransactionIds!: number[];
}

export class LeakAnalysisResponseDto {
  @ApiProperty()
  leakScore!: number;

  @ApiProperty()
  leakSummary!: string;

  @ApiProperty({ type: [DetectedLeakDto] })
  detectedLeaks!: DetectedLeakDto[];

  @ApiPropertyOptional()
  auditSummary?: string;
}

export class MonthlyReportLeakDto {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  amountMajor!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty()
  explanation!: string;

  @ApiProperty()
  suggestedAction!: string;
}

export class MonthlyReportBudgetRecommendationDto {
  @ApiProperty()
  categoryName!: string;

  @ApiProperty()
  suggestedLimitMajor!: number;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty()
  rationale!: string;

  @ApiProperty()
  createBudgetPrompt!: string;
}

export class MonthlyReportResponseDto {
  @ApiProperty({ example: '2026-05' })
  month!: string;

  @ApiProperty({ example: '2026-04' })
  previousMonth!: string;

  @ApiProperty()
  reportSummary!: string;

  @ApiProperty()
  monthComparisonSummary!: string;

  @ApiProperty()
  spendingChangePercent!: number;

  @ApiProperty({ type: [MonthlyReportLeakDto] })
  topLeaks!: MonthlyReportLeakDto[];

  @ApiProperty({ type: MonthlyReportBudgetRecommendationDto })
  budgetRecommendation!: MonthlyReportBudgetRecommendationDto;

  @ApiProperty({ type: [String] })
  highlights!: string[];
}
