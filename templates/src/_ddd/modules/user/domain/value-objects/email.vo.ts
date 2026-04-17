import { ValueObject } from '@shared/domain/value-objects/base.vo';
import { ValidationError } from '@shared/kernel/errors/domain.errors';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  constructor(value: string) {
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new ValidationError(`Invalid email: ${value}`);
    }
    super({ value: value.toLowerCase().trim() });
  }

  get value(): string {
    return this.props.value;
  }
}
