import { DomainError } from '@shared/kernel/errors/domain.errors';

export class UserNotFoundError extends DomainError {
  constructor(id: string) {
    super(`User with id "${id}" not found`, 'USER_NOT_FOUND');
  }
}

export class UserEmailConflictError extends DomainError {
  constructor(email: string) {
    super(`Email "${email}" is already in use`, 'USER_EMAIL_CONFLICT');
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid credentials', 'INVALID_CREDENTIALS');
  }
}

export class InvalidResetTokenError extends DomainError {
  constructor() {
    super('Invalid or expired reset token', 'INVALID_RESET_TOKEN');
  }
}
