import { registerDecorator, ValidationOptions } from 'class-validator';

/** Server-side password policy — enforced here regardless of whatever the
 *  frontend does, since client-side validation is only a UX nicety, never
 *  a security control. Minimum 10 chars, at least one upper, one lower,
 *  one digit, one symbol. */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          if (value.length < 10) return false;
          if (!/[a-z]/.test(value)) return false;
          if (!/[A-Z]/.test(value)) return false;
          if (!/[0-9]/.test(value)) return false;
          if (!/[^A-Za-z0-9]/.test(value)) return false;
          return true;
        },
        defaultMessage(): string {
          return 'Password must be at least 10 characters and include upper, lower, digit, and symbol.';
        },
      },
    });
  };
}
