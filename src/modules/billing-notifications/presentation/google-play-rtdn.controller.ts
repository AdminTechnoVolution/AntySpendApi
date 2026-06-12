import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicRoute } from '../../../shared/auth/jwt-auth.guard';
import { PubSubPushAuthGuard } from '../application/pubsub-push-auth.guard';
import { RtdnHandlerService } from '../application/rtdn-handler.service';
import type { PubSubPushBody } from '../application/rtdn.types';

@ApiTags('webhooks')
@PublicRoute()
@Controller('webhooks/google-play')
export class GooglePlayRtdnController {
  constructor(private readonly rtdnHandler: RtdnHandlerService) {}

  @Post('rtdn')
  @HttpCode(200)
  @UseGuards(PubSubPushAuthGuard)
  @ApiOperation({
    summary: 'Google Play RTDN Pub/Sub push endpoint (no user JWT)',
  })
  async receiveRtdn(@Body() body: PubSubPushBody): Promise<{ ok: true }> {
    await this.rtdnHandler.handlePush(body);
    return { ok: true };
  }
}
