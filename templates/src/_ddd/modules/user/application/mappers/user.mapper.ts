import { UserEntity } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dto/user.dto';

export class UserMapper {
  static toDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
