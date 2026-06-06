import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiStandardAuthResponses() {
  return applyDecorators(
    ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' }),
  );
}

export function ApiStandardCrudResponses() {
  return applyDecorators(
    ApiStandardAuthResponses(),
    ApiNotFoundResponse({ description: 'Entity not found' }),
  );
}

export function ApiStandardMutationResponses() {
  return applyDecorators(
    ApiStandardAuthResponses(),
    ApiBadRequestResponse({ description: 'Validation error' }),
  );
}
