import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { tenantStorage } from './tenant.context';

/**
 * Reads the x-tenant-id header and binds it to AsyncLocalStorage
 * so any service in the request chain can call getCurrentTenantId().
 * Register this middleware in AppModule for all routes.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const tenantId = req.headers['x-tenant-id'] as string | undefined;
    if (!tenantId) throw new BadRequestException('Missing x-tenant-id header');

    tenantStorage.run({ tenantId }, () => next());
  }
}
