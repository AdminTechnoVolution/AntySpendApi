import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicRoute } from '../../../shared/auth/jwt-auth.guard';
import { AppleNotificationHandlerService } from '../application/apple-notification-handler.service';
import type { AppStoreNotificationRequestBody } from '../application/apple-notification.types';

/**
 * No bearer auth here by design — Apple doesn't send one. The `signedPayload`'s own certificate
 * chain, verified all the way back to Apple's root in `AppleBillingVerificationService`, is what
 * proves this request actually came from Apple; an unverifiable payload is rejected there.
 */
@ApiTags('webhooks')
@PublicRoute()
@Controller('webhooks/apple')
export class AppleStoreNotificationsController {
  constructor(private readonly handler: AppleNotificationHandlerService) {}

  @Post('notifications')
  @HttpCode(200)
  @ApiOperation({
    summary: 'App Store Server Notifications V2 endpoint (no user JWT)',
  })
  async receiveNotification(@Body() body: AppStoreNotificationRequestBody): Promise<{ ok: true }> {
    await this.handler.handleNotification(body);
    return { ok: true };
  }
}
