import { Controller, Get, UseGuards } from '@nestjs/common';
import { ShopifyAuthGuard } from '../auth/guards/shopify-auth.guard.js';
import { ShopifyContext } from '../auth/decorators/shopify-context.decorator.js';
import type { ShopifyRequestContext } from '../auth/guards/shopify-auth.guard.js';
import { SetupService, type SetupStatus } from './setup.service.js';

@Controller('api/setup-status')
@UseGuards(ShopifyAuthGuard)
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get()
  getSetupStatus(
    @ShopifyContext() ctx: ShopifyRequestContext,
  ): Promise<SetupStatus> {
    return this.setupService.getSetupStatus(ctx.shop);
  }
}
