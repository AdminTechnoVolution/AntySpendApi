"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiIdempotencyKeyHeader = ApiIdempotencyKeyHeader;
exports.ApiCrudList = ApiCrudList;
exports.ApiCrudGet = ApiCrudGet;
exports.ApiCrudCreate = ApiCrudCreate;
exports.ApiCrudUpdate = ApiCrudUpdate;
exports.ApiCrudDelete = ApiCrudDelete;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_responses_decorator_1 = require("./common-responses.decorator");
function ApiIdempotencyKeyHeader() {
    return (0, swagger_1.ApiHeader)({
        name: 'Idempotency-Key',
        description: 'Unique key for idempotent POST requests',
        required: true,
    });
}
function ApiCrudList(entityLabel, responseType) {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: `List all ${entityLabel}` }), (0, swagger_1.ApiOkResponse)({ type: responseType, isArray: true }), (0, common_responses_decorator_1.ApiStandardAuthResponses)());
}
function ApiCrudGet(entityLabel, responseType) {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: `Get ${entityLabel} by id` }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Entity id' }), (0, swagger_1.ApiOkResponse)({ type: responseType }), (0, common_responses_decorator_1.ApiStandardCrudResponses)());
}
function ApiCrudCreate(entityLabel, bodyType, responseType) {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: `Create ${entityLabel}` }), ApiIdempotencyKeyHeader(), (0, swagger_1.ApiBody)({ type: bodyType }), (0, swagger_1.ApiCreatedResponse)({ type: responseType }), (0, common_responses_decorator_1.ApiStandardMutationResponses)());
}
function ApiCrudUpdate(entityLabel, bodyType, responseType) {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: `Update ${entityLabel}` }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Entity id' }), (0, swagger_1.ApiBody)({ type: bodyType }), (0, swagger_1.ApiOkResponse)({ type: responseType }), (0, common_responses_decorator_1.ApiStandardCrudResponses)(), (0, swagger_1.ApiBadRequestResponse)({ description: 'Validation error' }));
}
function ApiCrudDelete(entityLabel, responseType) {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiOperation)({ summary: `Soft-delete ${entityLabel}` }), (0, swagger_1.ApiParam)({ name: 'id', description: 'Entity id' }), (0, swagger_1.ApiOkResponse)({ type: responseType }), (0, common_responses_decorator_1.ApiStandardCrudResponses)());
}
