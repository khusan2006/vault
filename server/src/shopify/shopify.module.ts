import { Module } from '@nestjs/common';
import { ShopifyService } from './shopify.service.js';

@Module({
  providers: [ShopifyService],
  exports: [ShopifyService],
})
export class ShopifyModule {}
