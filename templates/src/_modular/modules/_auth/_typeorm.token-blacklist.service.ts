import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenBlacklist } from './entities/token-blacklist.entity';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectRepository(TokenBlacklist)
    private repo: Repository<TokenBlacklist>,
  ) {}

  async revoke(jti: string, expiresAt: Date): Promise<void> {
    await this.repo.save({ jti, expiresAt });
  }

  async isRevoked(jti: string): Promise<boolean> {
    const entry = await this.repo.findOne({ where: { jti } });
    return !!entry;
  }

  async pruneExpired(): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
