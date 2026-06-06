import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExchangeRatesResponseDto {
  @ApiProperty({ example: 'USD' })
  base!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { EUR: 0.92, MXN: 17.1 },
  })
  rates!: Record<string, number>;

  @ApiProperty()
  fetchedAtMillis!: number;

  @ApiPropertyOptional({ description: 'True when served from Mongo cache' })
  cached?: boolean;
}
