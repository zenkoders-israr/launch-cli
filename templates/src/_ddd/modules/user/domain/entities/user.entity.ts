import { AggregateRoot } from '@shared/domain/base/aggregate-root';
import { UserCreatedEvent } from '../events/user-created.event';

export interface UserProps {
  name: string;
  email: string;
  password: string;
  resetPasswordToken: string | null;
  resetPasswordExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity extends AggregateRoot<string> {
  private props: UserProps;

  private constructor(id: string, props: UserProps) {
    super(id);
    this.props = props;
  }

  static create(id: string, props: Omit<UserProps, 'createdAt' | 'updatedAt'>): UserEntity {
    const user = new UserEntity(id, {
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    user.addDomainEvent(new UserCreatedEvent(id, props.email));
    return user;
  }

  static reconstitute(id: string, props: UserProps): UserEntity {
    return new UserEntity(id, props);
  }

  get name(): string { return this.props.name; }
  get email(): string { return this.props.email; }
  get password(): string { return this.props.password; }
  get resetPasswordToken(): string | null { return this.props.resetPasswordToken; }
  get resetPasswordExpiry(): Date | null { return this.props.resetPasswordExpiry; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updateName(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  setResetToken(token: string, expiry: Date): void {
    this.props.resetPasswordToken = token;
    this.props.resetPasswordExpiry = expiry;
    this.props.updatedAt = new Date();
  }

  clearResetToken(): void {
    this.props.resetPasswordToken = null;
    this.props.resetPasswordExpiry = null;
    this.props.updatedAt = new Date();
  }

  changePassword(hashed: string): void {
    this.props.password = hashed;
    this.props.updatedAt = new Date();
  }

  isResetTokenValid(token: string): boolean {
    return (
      this.props.resetPasswordToken !== null &&
      this.props.resetPasswordExpiry !== null &&
      this.props.resetPasswordExpiry > new Date() &&
      this.props.resetPasswordToken === token
    );
  }
}
