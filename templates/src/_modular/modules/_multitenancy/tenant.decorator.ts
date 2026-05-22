import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/** Inject the current tenant ID into a controller method parameter */
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.headers['x-tenant-id'] as string;
  },
);
