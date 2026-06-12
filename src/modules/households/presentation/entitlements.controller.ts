import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, SkipSubscriptionCheck } from '../../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { ApiStandardAuthResponses } from '../../../shared/swagger/common-responses.decorator';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { EntitlementsService } from '../application/entitlements.service';
import { VerifyPurchaseDto } from '../dto/entitlements.dto';

@ApiTags('entitlements')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard)
@Controller('entitlements')
export class EntitlementsController {
  constructor(private readonly entitlementsService: EntitlementsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current subscription entitlement' })
  @ApiOkResponse({ description: 'Entitlement snapshot' })
  @ApiStandardAuthResponses()
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.entitlementsService.getMyEntitlement(user.userId);
  }

  @Post('verify-purchase')
  @SkipSubscriptionCheck()
  @ApiOperation({
    summary: 'Verify Google Play purchase and upsert entitlement',
  })
  @ApiOkResponse({ description: 'Verified entitlement' })
  @ApiStandardAuthResponses()
  verifyPurchase(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VerifyPurchaseDto,
  ) {
    return this.entitlementsService.verifyPurchase(
      user.userId,
      dto.productId,
      dto.purchaseToken,
      dto.packageName,
    );
  }
}
