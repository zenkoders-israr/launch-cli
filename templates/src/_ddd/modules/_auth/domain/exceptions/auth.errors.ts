import { DomainError } from '@shared/kernel/errors/domain.errors';

export class AuthenticationError extends DomainError {
  constructor() {
    super('Invalid credentials', 'AUTHENTICATION_ERROR');
  }
}

export class TokenExpiredError extends DomainError {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED');
  }
}
