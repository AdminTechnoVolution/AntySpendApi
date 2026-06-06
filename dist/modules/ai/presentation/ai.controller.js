"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../shared/auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../../shared/auth/current-user.decorator");
const ai_response_dto_1 = require("../../../shared/swagger/ai-response.dto");
const common_responses_decorator_1 = require("../../../shared/swagger/common-responses.decorator");
const swagger_constants_1 = require("../../../shared/swagger/swagger.constants");
const ai_service_1 = require("../application/ai.service");
const ai_dto_1 = require("../dto/ai.dto");
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    extractExpenses(user, dto) {
        return this.aiService.extractExpenses(user.userId, dto);
    }
    analyzeLeaks(user, dto) {
        return this.aiService.analyzeLeaks(user.userId, dto);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('expense-extraction'),
    (0, swagger_1.ApiOperation)({ summary: 'Extract expenses from voice/text transcription' }),
    (0, swagger_1.ApiOkResponse)({ type: ai_response_dto_1.ExpenseExtractionResponseDto }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_dto_1.ExpenseExtractionRequestDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "extractExpenses", null);
__decorate([
    (0, common_1.Post)('leak-analysis'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze leak spending for current or specified month' }),
    (0, swagger_1.ApiOkResponse)({ type: ai_response_dto_1.LeakAnalysisResponseDto }),
    (0, common_responses_decorator_1.ApiStandardAuthResponses)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_dto_1.LeakAnalysisRequestDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "analyzeLeaks", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('ai'),
    (0, swagger_1.ApiBearerAuth)(swagger_constants_1.BEARER_AUTH_SCHEME),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map