import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ShopifyAuthGuard, type ShopifyRequestContext } from './auth/index.js';

@Controller('api')
export class AppController {
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  @UseGuards(ShopifyAuthGuard)
  @Get('hello')
  getHello(@Req() req: Request) {
    const { shop, userId } = (req as any).shopify as ShopifyRequestContext;
    return { message: 'Hello World!', shop, userId };
  }
}
