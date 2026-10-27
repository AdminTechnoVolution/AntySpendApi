import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import { JwtAuthGuard, SkipSubscriptionCheck } from '../../../shared/auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../../../shared/auth/jwt-payload.interface';
import { ApiStandardAuthResponses } from '../../../shared/swagger/common-responses.decorator';
import { BEARER_AUTH_SCHEME } from '../../../shared/swagger/swagger.constants';
import { MascotChatService } from '../application/mascot-chat.service';
import { MascotPremiumGuard } from '../application/mascot-premium.guard';
import { MascotTurnRequestDto } from '../dto/ai.dto';

@ApiTags('ai')
@ApiBearerAuth(BEARER_AUTH_SCHEME)
@UseGuards(JwtAuthGuard, MascotPremiumGuard)
@SkipSubscriptionCheck()
@Controller('ai/mascot')
export class MascotController {
  constructor(private readonly mascotChat: MascotChatService) {}

  @Post('turn')
  @ApiOperation({ summary: 'Process one spoken turn in the Anty mascot conversation' })
  @ApiOkResponse({ description: 'Spoken response and structured action draft' })
  @ApiStandardAuthResponses()
  processTurn(@CurrentUser() _user: AuthenticatedUser, @Body() dto: MascotTurnRequestDto) {
    return this.mascotChat.processTurn(dto);
  }
}
