export { Entity } from './domain/base/entity';
export { AggregateRoot } from './domain/base/aggregate-root';
export { ValueObject } from './domain/value-objects/base.vo';
export { Ok, Err } from './kernel/result/result';
export type { Result } from './kernel/result/result';
export { DomainError, NotFoundError, ValidationError } from './kernel/errors/domain.errors';
export type { ID, Nullable, Optional } from './kernel/types';
