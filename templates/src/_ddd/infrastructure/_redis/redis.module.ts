import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from 'cache-manager-ioredis-yet';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: [
          createKeyv(
            new Redis({
              host: config.get<string>('REDIS_HOST') ?? 'localhost',
              port: config.get<number>('REDIS_PORT') ?? 6379,
              password: config.get<string>('REDIS_PASSWORD') || undefined,
            }),
          ),
        ],
      }),
    }),
  ],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.get<string>('REDIS_HOST') ?? 'localhost',
          port: config.get<number>('REDIS_PORT') ?? 6379,
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        }),
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService, CacheModule],
})
export class RedisModule {}
