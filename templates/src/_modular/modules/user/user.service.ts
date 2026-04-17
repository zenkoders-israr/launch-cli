import { Injectable, NotFoundException } from '@nestjs/common';
import { timingSafeEqual, createHash } from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  resetPasswordToken: string | null;
  resetPasswordExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function safeTokenCompare(a: string, b: string): boolean {
  try {
    const ha = createHash('sha256').update(a).digest();
    const hb = createHash('sha256').update(b).digest();
    return timingSafeEqual(ha, hb);
  } catch {
    return false;
  }
}

// In-memory store — replace with your repository implementation
const store: User[] = [];

@Injectable()
export class UserService {
  async create(data: Partial<User>): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      name: data.name ?? '',
      email: data.email ?? '',
      password: data.password ?? '',
      resetPasswordToken: null,
      resetPasswordExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.push(user);
    return this.sanitize(user);
  }

  async findById(id: string): Promise<User> {
    const user = store.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async findByEmailRaw(email: string): Promise<User | undefined> {
    return store.find((u) => u.email === email);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = store.find((u) => u.email === email);
    return user ? this.sanitize(user) : undefined;
  }

  async findByResetToken(token: string): Promise<User | undefined> {
    return store.find(
      (u) =>
        u.resetPasswordToken !== null &&
        u.resetPasswordExpiry !== null &&
        u.resetPasswordExpiry > new Date() &&
        safeTokenCompare(u.resetPasswordToken, token),
    );
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const idx = store.findIndex((u) => u.id === id);
    if (idx === -1) throw new NotFoundException('User not found');
    store[idx] = { ...store[idx], ...data, updatedAt: new Date() };
    return this.sanitize(store[idx]);
  }

  async upsert(email: string, data: Partial<User>): Promise<User> {
    const existing = store.find((u) => u.email === email);
    if (existing) return this.update(existing.id, data);
    return this.create({ ...data, email });
  }

  async remove(id: string): Promise<void> {
    const idx = store.findIndex((u) => u.id === id);
    if (idx === -1) throw new NotFoundException('User not found');
    store.splice(idx, 1);
  }

  private sanitize(user: User): User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, resetPasswordToken, resetPasswordExpiry, ...rest } = user;
    return rest as User;
  }
}
