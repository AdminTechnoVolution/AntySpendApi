import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import type { SyncPushRequest } from '../../../shared/sync/sync.types';
import {
  SyncPullQueryDto,
  SyncPullResponseDto,
  SyncPushRequestDto,
  SyncPushResponseDto,
} from '../../../shared/swagger/sync.dto';
import { ApiStandardAuthResponses } from '../../../shared/swagger/common-responses.decorator';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { SyncService } from '../application/sync.service';

@ApiTags('sync')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  @ApiOperation({ summary: 'Push local changes (LWW by updatedAtMillis)' })
  @ApiBody({ type: SyncPushRequestDto })
  @ApiOkResponse({ type: SyncPushResponseDto })
  @ApiStandardAuthResponses()
  push(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SyncPushRequest,
  ) {
    return this.syncService.push(user.userId, body);
  }

  @Get('pull')
  @ApiOperation({ summary: 'Pull server changes since serverVersion' })
  @ApiOkResponse({ type: SyncPullResponseDto })
  @ApiStandardAuthResponses()
  pull(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SyncPullQueryDto,
  ) {
    return this.syncService.pull(user.userId, query.since);
  }
}
