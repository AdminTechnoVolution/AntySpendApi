import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import {
  ApiStandardAuthResponses,
  ApiStandardCrudResponses,
  ApiStandardMutationResponses,
} from './common-responses.decorator';

export function ApiIdempotencyKeyHeader() {
  return ApiHeader({
    name: 'Idempotency-Key',
    description: 'Unique key for idempotent POST requests',
    required: true,
  });
}

export function ApiCrudList(entityLabel: string, responseType: Type<unknown>) {
  return applyDecorators(
    ApiOperation({ summary: `List all ${entityLabel}` }),
    ApiOkResponse({ type: responseType, isArray: true }),
    ApiStandardAuthResponses(),
  );
}

export function ApiCrudGet(entityLabel: string, responseType: Type<unknown>) {
  return applyDecorators(
    ApiOperation({ summary: `Get ${entityLabel} by id` }),
    ApiParam({ name: 'id', description: 'Entity id' }),
    ApiOkResponse({ type: responseType }),
    ApiStandardCrudResponses(),
  );
}

export function ApiCrudCreate(entityLabel: string, bodyType: Type<unknown>, responseType: Type<unknown>) {
  return applyDecorators(
    ApiOperation({ summary: `Create ${entityLabel}` }),
    ApiIdempotencyKeyHeader(),
    ApiBody({ type: bodyType }),
    ApiCreatedResponse({ type: responseType }),
    ApiStandardMutationResponses(),
  );
}

export function ApiCrudUpdate(entityLabel: string, bodyType: Type<unknown>, responseType: Type<unknown>) {
  return applyDecorators(
    ApiOperation({ summary: `Update ${entityLabel}` }),
    ApiParam({ name: 'id', description: 'Entity id' }),
    ApiBody({ type: bodyType }),
    ApiOkResponse({ type: responseType }),
    ApiStandardCrudResponses(),
    ApiBadRequestResponse({ description: 'Validation error' }),
  );
}

export function ApiCrudDelete(entityLabel: string, responseType: Type<unknown>) {
  return applyDecorators(
    ApiOperation({ summary: `Soft-delete ${entityLabel}` }),
    ApiParam({ name: 'id', description: 'Entity id' }),
    ApiOkResponse({ type: responseType }),
    ApiStandardCrudResponses(),
  );
}
