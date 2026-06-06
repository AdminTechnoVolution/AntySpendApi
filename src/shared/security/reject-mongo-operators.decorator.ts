import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { containsMongoOperatorKeys } from './strip-mongo-keys';

@ValidatorConstraint({ name: 'rejectMongoOperators', async: false })
export class RejectMongoOperatorsConstraint
  implements ValidatorConstraintInterface
{
  validate(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    return !containsMongoOperatorKeys(value);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'must not contain MongoDB operator keys';
  }
}

export function RejectMongoOperators(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: RejectMongoOperatorsConstraint,
    });
  };
}
