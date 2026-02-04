import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShopifyService } from '../shopify/shopify.service.js';
import { SessionService } from '../session/session.service.js';
import { RequestedTokenType } from '@shopify/shopify-api';

export interface SessionTokenPayload {
  iss: string;
  dest: string;
  aud: string;
  sub: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
  sid: string;
}

type TokenType = 'online' | 'offline';

interface TokenExchangeLock {
  promise: Promise<string>;
  timestamp: number;
}

@Injectable()
export class AuthService {
  private readonly apiKey: string;
  private readonly requiredScopes: Set<string>;
  private readonly tokenExchangeLocks = new Map<string, TokenExchangeLock>();
  private readonly lockTtlMs = 30000;

  constructor(
    private readonly configService: ConfigService,
    private readonly shopifyService: ShopifyService,
    private readonly sessionService: SessionService,
  ) {
    this.apiKey = this.configService.getOrThrow<string>('shopify.apiKey');
    const scopes = this.configService.getOrThrow<string>('shopify.scopes');
    this.requiredScopes = new Set(scopes.split(',').map((s) => s.trim()));
  }

  async verifySessionToken(token: string): Promise<SessionTokenPayload> {
    try {
      const shopify = this.shopifyService.getClient();
      const payload = (await shopify.session.decodeSessionToken(token)) as SessionTokenPayload;

      if (payload.aud !== this.apiKey) {
        throw new UnauthorizedException('Invalid session token audience');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid session token');
    }
  }

  extractShopFromPayload(payload: SessionTokenPayload): string {
    return new URL(payload.dest).hostname;
  }

  extractUserIdFromPayload(payload: SessionTokenPayload): string {
    return payload.sub;
  }

  async getOfflineAccessToken(
    sessionToken: string,
    payload: SessionTokenPayload,
  ): Promise<string> {
    const shop = this.extractShopFromPayload(payload);

    const existing = await this.sessionService.findOfflineByShop(shop);
    if (existing && this.hasRequiredScopes(existing.session.scope)) {
      return existing.accessToken;
    }

    return this.exchangeTokenWithLock(shop, sessionToken, 'offline');
  }

  async getOnlineAccessToken(
    sessionToken: string,
    payload: SessionTokenPayload,
  ): Promise<string> {
    const shop = this.extractShopFromPayload(payload);
    const userId = this.extractUserIdFromPayload(payload);

    const existing = await this.sessionService.findOnlineByShopAndUser(shop, userId);
    if (existing && this.hasRequiredScopes(existing.session.scope)) {
      return existing.accessToken;
    }

    return this.exchangeTokenWithLock(shop, sessionToken, 'online', userId);
  }

  private hasRequiredScopes(grantedScopes: string): boolean {
    const granted = new Set(grantedScopes.split(',').map((s) => s.trim()));
    for (const scope of this.requiredScopes) {
      if (!granted.has(scope)) {
        return false;
      }
    }
    return true;
  }

  private async exchangeTokenWithLock(
    shop: string,
    sessionToken: string,
    type: TokenType,
    userId?: string,
  ): Promise<string> {
    const lockKey = `${shop}:${type}:${userId ?? 'app'}`;

    this.cleanupStaleLocks();

    const existingLock = this.tokenExchangeLocks.get(lockKey);
    if (existingLock) {
      return existingLock.promise;
    }

    const exchangePromise = this.performTokenExchange(shop, sessionToken, type, userId);

    this.tokenExchangeLocks.set(lockKey, {
      promise: exchangePromise,
      timestamp: Date.now(),
    });

    try {
      return await exchangePromise;
    } finally {
      this.tokenExchangeLocks.delete(lockKey);
    }
  }

  private cleanupStaleLocks(): void {
    const now = Date.now();
    for (const [key, lock] of this.tokenExchangeLocks) {
      if (now - lock.timestamp > this.lockTtlMs) {
        this.tokenExchangeLocks.delete(key);
      }
    }
  }

  private async performTokenExchange(
    shop: string,
    sessionToken: string,
    type: TokenType,
    userId?: string,
  ): Promise<string> {
    const shopify = this.shopifyService.getClient();

    const requestedTokenType =
      type === 'online'
        ? RequestedTokenType.OnlineAccessToken
        : RequestedTokenType.OfflineAccessToken;

    try {
      const { session } = await shopify.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType,
      });

      if (!session.accessToken || !session.scope) {
        throw new Error('Invalid token exchange response');
      }

      await this.sessionService.upsert({
        shop,
        accessToken: session.accessToken,
        scope: session.scope,
        isOnline: session.isOnline,
        userId: session.isOnline ? (userId ?? null) : null,
        expiresAt: session.expires ? new Date(session.expires) : null,
      });

      return session.accessToken;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException(`Token exchange failed (${type}): ${message}`);
    }
  }
}
