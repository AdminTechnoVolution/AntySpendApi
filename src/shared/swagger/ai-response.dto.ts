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
