import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ShopifyAuthGuard } from './guards/shopify-auth.guard.js';
import { SessionModule } from '../session/session.module.js';
import { ShopifyModule } from '../shopify/shopify.module.js';

@Module({
  imports: [SessionModule, ShopifyModule],
  providers: [AuthService, ShopifyAuthGuard],
  exports: [AuthService, ShopifyAuthGuard],
})
export class AuthModule {}
