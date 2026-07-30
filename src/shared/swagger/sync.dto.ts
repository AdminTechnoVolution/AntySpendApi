import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { RejectMongoOperators } from '../security/reject-mongo-operators.decorator';
import { SYNC_ENTITY_TYPES } from '../sync/sync.types';

export class SyncChangeDto {
  @ApiProperty({ enum: SYNC_ENTITY_TYPES })
  @IsIn(SYNC_ENTITY_TYPES)
  entityType!: (typeof SYNC_ENTITY_TYPES)[number];

  @ApiProperty({
    description:
      'Stable entity id: 32-char hex or canonical UUID kept for backward compatibility',
  })
  @IsString()
  @Matches(
    /^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i,
  )
  entityId!: string;

  @ApiProperty()
  @IsNumber()
  updatedAtMillis!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deletedAtMillis?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  @RejectMongoOperators()
  payload!: Record<string, unknown>;
}

export class SyncPushRequestDto {
  @ApiProperty({ type: [SyncChangeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncChangeDto)
  changes!: SyncChangeDto[];

  @ApiPropertyOptional({ description: 'Last serverVersion from a previous pull/push' })
  @IsOptional()
  @IsString()
  lastKnownServerVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class SyncRejectedChangeDto {
  @ApiProperty()
  entityId!: string;

  @ApiProperty()
  reason!: string;
}

export class SyncPushResponseDto {
  @ApiProperty({ type: [String], description: 'Entity ids accepted by server' })
  accepted!: string[];

  @ApiProperty({ type: [SyncRejectedChangeDto] })
  rejected!: SyncRejectedChangeDto[];

  @ApiProperty({ type: [String], description: 'Entity ids with no change (noop)' })
  noop!: string[];

  @ApiProperty()
  serverVersion!: string;
}

export class SyncPullResponseDto {
  @ApiProperty({ type: [SyncChangeDto] })
  entities!: SyncChangeDto[];

  @ApiProperty()
  newServerVersion!: string;
}

export class SyncPullQueryDto {
  @ApiPropertyOptional({ description: 'Pull changes since this serverVersion' })
  @IsOptional()
  @IsString()
  since?: string;
}
