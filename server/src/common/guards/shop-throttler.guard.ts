import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

@Injectable()
export class ShopThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const shopifyContext = (req as any).shopify;

    if (shopifyContext?.shop) {
      return shopifyContext.shop;
    }

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const shop = this.extractShopFromToken(token);
      if (shop) {
        return shop;
      }
    }

    return req.ip || 'unknown';
  }

  private extractShopFromToken(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (payload.dest) {
        return new URL(payload.dest).hostname;
      }

      return null;
    } catch {
      return null;
    }
  }
}
