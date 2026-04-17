import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { RedisService } from '@infrastructure/cache/redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redisService.ping();
      const isHealthy = pong === 'PONG';
      const result = this.getStatus(key, isHealthy);
      if (isHealthy) return result;
      throw new HealthCheckError('Redis check failed', result);
    } catch (err) {
      const result = this.getStatus(key, false, { message: String(err) });
      throw new HealthCheckError('Redis check failed', result);
    }
  }
}
