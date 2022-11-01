import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AccountAddressValidator } from '../helpers/account-address-validator.helper';

export function IsAccountAddress(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsAccountAddressConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsAccountAddress' })
export class IsAccountAddressConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string): boolean {
    return AccountAddressValidator.validate(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Invalid address';
  }
}
