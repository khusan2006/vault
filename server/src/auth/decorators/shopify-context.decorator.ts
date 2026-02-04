import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { ShopifyRequestContext } from '../guards/shopify-auth.guard.js';

export const ShopifyContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ShopifyRequestContext => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as any).shopify as ShopifyRequestContext;
  },
);
