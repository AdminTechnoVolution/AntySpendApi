"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiStandardAuthResponses = ApiStandardAuthResponses;
exports.ApiStandardCrudResponses = ApiStandardCrudResponses;
exports.ApiStandardMutationResponses = ApiStandardMutationResponses;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
function ApiStandardAuthResponses() {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid JWT' }));
}
function ApiStandardCrudResponses() {
    return (0, common_1.applyDecorators)(ApiStandardAuthResponses(), (0, swagger_1.ApiNotFoundResponse)({ description: 'Entity not found' }));
}
function ApiStandardMutationResponses() {
    return (0, common_1.applyDecorators)(ApiStandardAuthResponses(), (0, swagger_1.ApiBadRequestResponse)({ description: 'Validation error' }));
}
