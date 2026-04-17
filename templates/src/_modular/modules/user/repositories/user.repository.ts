// User repository — wire this to your ORM (TypeORM, Prisma, Mongoose)
// Inject PrismaService / DataSource / Model here and implement the methods
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    throw new Error('Not implemented — wire your ORM here');
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    throw new Error('Not implemented — wire your ORM here');
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    throw new Error('Not implemented — wire your ORM here');
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    throw new Error('Not implemented — wire your ORM here');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented — wire your ORM here');
  }
}
