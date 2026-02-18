import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity.js';
import { CryptoService } from '../common/crypto.service.js';

interface SessionUpsertData {
  shop: string;
  accessToken: string;
  scope: string;
  isOnline: boolean;
  userId?: string | null;
  onlineAccessInfo?: Record<string, unknown> | null;
  expiresAt?: Date | null;
}

interface CacheEntry {
  session: Session;
  decryptedToken: string;
  cachedAt: number;
}

const CACHE_TTL_MS = 60_000;

@Injectable()
export class SessionService {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly cryptoService: CryptoService,
  ) {}

  async findOfflineByShop(shop: string): Promise<{ session: Session; accessToken: string } | null> {
    const cacheKey = `offline:${shop}`;
    const cached = this.getFromCache(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const session = await this.sessionRepository.findOne({
      where: { shop, isOnline: false },
    });

    if (!session) {
      return null;
    }

    const isExpired = session.expiresAt && session.expiresAt < new Date();
    if (isExpired) {
      return null;
    }

    const decryptedToken = this.cryptoService.decrypt(session.accessToken);
    this.setCache(cacheKey, session, decryptedToken);

    return { session, accessToken: decryptedToken };
  }

  async findOnlineByShopAndUser(
    shop: string,
    userId: string,
  ): Promise<{ session: Session; accessToken: string } | null> {
    const cacheKey = `online:${shop}:${userId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const session = await this.sessionRepository.findOne({
      where: { shop, userId, isOnline: true },
    });

    if (!session) {
      return null;
    }

    const isExpired = session.expiresAt && session.expiresAt < new Date();
    if (isExpired) {
      return null;
    }

    const decryptedToken = this.cryptoService.decrypt(session.accessToken);
    this.setCache(cacheKey, session, decryptedToken);

    return { session, accessToken: decryptedToken };
  }

  async upsert(data: SessionUpsertData): Promise<void> {
    const encryptedToken = this.cryptoService.encrypt(data.accessToken);

    const where: Record<string, unknown> = {
      shop: data.shop,
      isOnline: data.isOnline,
    };
    if (data.isOnline && data.userId) {
      where.userId = data.userId;
    }

    let session = await this.sessionRepository.findOne({ where });

    if (session) {
      session.accessToken = encryptedToken;
      session.scope = data.scope;
      session.expiresAt = data.expiresAt ?? null;
      session.onlineAccessInfo = data.onlineAccessInfo ?? null;
    } else {
      session = this.sessionRepository.create({
        shop: data.shop,
        accessToken: encryptedToken,
        scope: data.scope,
        isOnline: data.isOnline,
        userId: data.userId ?? null,
        onlineAccessInfo: data.onlineAccessInfo ?? null,
        expiresAt: data.expiresAt ?? null,
      });
    }

    await this.sessionRepository.save(session);

    this.invalidateCacheForShop(data.shop, data.isOnline, data.userId);
  }

  async deleteByShop(shop: string): Promise<void> {
    await this.sessionRepository.delete({ shop });
    this.invalidateAllCacheForShop(shop);
  }

  private getFromCache(key: string): { session: Session; accessToken: string } | null | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    const isStale = Date.now() - entry.cachedAt > CACHE_TTL_MS;
    if (isStale) {
      this.cache.delete(key);
      return undefined;
    }

    return { session: entry.session, accessToken: entry.decryptedToken };
  }

  private setCache(key: string, session: Session, decryptedToken: string): void {
    this.cache.set(key, { session, decryptedToken, cachedAt: Date.now() });
  }

  private invalidateCacheForShop(shop: string, isOnline: boolean, userId?: string | null): void {
    if (isOnline && userId) {
      this.cache.delete(`online:${shop}:${userId}`);
    } else {
      this.cache.delete(`offline:${shop}`);
    }
  }

  private invalidateAllCacheForShop(shop: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(`:${shop}`) || key.includes(`:${shop}:`)) {
        this.cache.delete(key);
      }
    }
  }
}
