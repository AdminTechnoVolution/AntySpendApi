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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeakAnalysisResponseDto = exports.DetectedLeakDto = exports.ExpenseExtractionResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ExpenseExtractionResponseDto {
    expenses;
}
exports.ExpenseExtractionResponseDto = ExpenseExtractionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'array',
        items: { type: 'object', additionalProperties: true },
    }),
    __metadata("design:type", Array)
], ExpenseExtractionResponseDto.prototype, "expenses", void 0);
class DetectedLeakDto {
    title;
    explanation;
    savingTip;
    frequency;
    aggregateAmount;
    currencyCode;
    severity;
    associatedTransactionIds;
}
exports.DetectedLeakDto = DetectedLeakDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DetectedLeakDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DetectedLeakDto.prototype, "explanation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DetectedLeakDto.prototype, "savingTip", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DetectedLeakDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DetectedLeakDto.prototype, "aggregateAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DetectedLeakDto.prototype, "currencyCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DetectedLeakDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Number] }),
    __metadata("design:type", Array)
], DetectedLeakDto.prototype, "associatedTransactionIds", void 0);
class LeakAnalysisResponseDto {
    leakScore;
    leakSummary;
    detectedLeaks;
    auditSummary;
}
exports.LeakAnalysisResponseDto = LeakAnalysisResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], LeakAnalysisResponseDto.prototype, "leakScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LeakAnalysisResponseDto.prototype, "leakSummary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [DetectedLeakDto] }),
    __metadata("design:type", Array)
], LeakAnalysisResponseDto.prototype, "detectedLeaks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LeakAnalysisResponseDto.prototype, "auditSummary", void 0);
