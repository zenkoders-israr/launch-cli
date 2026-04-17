import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { UserMapper } from '../mappers/user.mapper';
import { UserResponseDto } from '../dto/user.dto';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return UserMapper.toDto(user);
  }
}
