import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from '../auth.service.js';
import {
  TOKEN_REQUIREMENTS_KEY,
  type TokenRequirements,
} from '../decorators/require-token.decorator.js';

export interface ShopifyRequestContext {
  shop: string;
  userId: string;
  sessionToken: string;
  onlineAccessToken?: string;
  offlineAccessToken?: string;
}

@Injectable()
export class ShopifyAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing session token');
    }

    const sessionToken = authHeader.slice(7);
    const payload = await this.authService.verifySessionToken(sessionToken);
    const shop = this.authService.extractShopFromPayload(payload);
    const userId = this.authService.extractUserIdFromPayload(payload);

    const requirements = this.reflector.get<TokenRequirements | undefined>(
      TOKEN_REQUIREMENTS_KEY,
      context.getHandler(),
    );

    const needsOffline = requirements?.offline ?? true;
    const needsOnline = requirements?.online ?? false;

    const shopifyContext: ShopifyRequestContext = {
      shop,
      userId,
      sessionToken,
    };

    const tokenPromises: Promise<void>[] = [];

    if (needsOffline) {
      tokenPromises.push(
        this.authService.getOfflineAccessToken(sessionToken, payload).then((token) => {
          shopifyContext.offlineAccessToken = token;
        }),
      );
    }

    if (needsOnline) {
      tokenPromises.push(
        this.authService.getOnlineAccessToken(sessionToken, payload).then((token) => {
          shopifyContext.onlineAccessToken = token;
        }),
      );
    }

    await Promise.all(tokenPromises);

    (request as any).shopify = shopifyContext;

    return true;
  }
}
