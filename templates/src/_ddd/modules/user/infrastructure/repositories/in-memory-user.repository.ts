import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

// In-memory implementation — replace with ORM adapter (TypeORM, Prisma, Mongoose)
const store: UserEntity[] = [];

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    return store.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return store.find((u) => u.email === email) ?? null;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    store.push(user);
    return user;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const idx = store.findIndex((u) => u.id === user.id);
    if (idx !== -1) store[idx] = user;
    return user;
  }

  async delete(id: string): Promise<void> {
    const idx = store.findIndex((u) => u.id === id);
    if (idx !== -1) store.splice(idx, 1);
  }
}
