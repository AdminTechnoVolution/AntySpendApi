import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class MemberPrivacySettingsDto {
  @ApiProperty({ default: false })
  shareWallets!: boolean;

  @ApiProperty({ default: false })
  shareTransactions!: boolean;

  @ApiProperty({ default: false })
  shareInvestments!: boolean;

  @ApiProperty({ default: false })
  shareCategories!: boolean;
}

export class CreateHouseholdDto {
  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;
}

export class UpdateHouseholdDto {
  @ApiProperty({ maxLength: 80 })
  @IsString()
  @MaxLength(80)
  name!: string;
}

export class CreateInviteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdatePrivacyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shareWallets?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shareTransactions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shareInvestments?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shareCategories?: boolean;
}
