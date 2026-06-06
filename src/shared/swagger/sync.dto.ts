import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SYNC_ENTITY_TYPES } from '../sync/sync.types';

export class SyncChangeDto {
  @ApiProperty({ enum: SYNC_ENTITY_TYPES })
  entityType!: (typeof SYNC_ENTITY_TYPES)[number];

  @ApiProperty()
  entityId!: string;

  @ApiProperty()
  updatedAtMillis!: number;

  @ApiPropertyOptional()
  deletedAtMillis?: number;

  @ApiPropertyOptional()
  clientUpdatedAtMillis?: number;

  @ApiPropertyOptional()
  deviceId?: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  payload!: Record<string, unknown>;
}

export class SyncPushRequestDto {
  @ApiProperty({ type: [SyncChangeDto] })
  changes!: SyncChangeDto[];

  @ApiPropertyOptional({ description: 'Last serverVersion from a previous pull/push' })
  lastKnownServerVersion?: string;

  @ApiPropertyOptional()
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
