import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { WeiValidator } from '../helpers/wei-validator.helper';

export function IsWei(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsWeiConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsWei' })
export class IsWeiConstraint implements ValidatorConstraintInterface {
  validate(value: string | number): boolean {
    return WeiValidator.validate(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Invalid wei value';
  }
}
