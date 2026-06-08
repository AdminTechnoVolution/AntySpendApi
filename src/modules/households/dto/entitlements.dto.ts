import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyPurchaseDto {
  @ApiProperty({ example: 'antyspend_personal_monthly' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: 'Google Play purchase token from BillingClient' })
  @IsString()
  @IsNotEmpty()
  purchaseToken!: string;

  @ApiPropertyOptional({
    example: 'com.technovolution.antyspend',
    description: 'Defaults to GOOGLE_PLAY_PACKAGE_NAME when omitted',
  })
  @IsOptional()
  @IsString()
  packageName?: string;
}
