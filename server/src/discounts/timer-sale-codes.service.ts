import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Campaign } from '../campaigns/entities/campaign.entity.js';
import type { DiscountConfig, TimerSaleConfig } from '../common/types/index.js';
import { EvaluationService } from '../evaluation/evaluation.service.js';
import { SessionService } from '../session/session.service.js';
import { TimerSaleCode } from './entities/timer-sale-code.entity.js';

export type TimerSaleCodeStatus =
  | 'ok'
  | 'not_eligible'
  | 'inactive'
  | 'expired'
  | 'used'
  | 'not_configured'
  | 'error';

export interface TimerSaleCodeResult {
  status: TimerSaleCodeStatus;
  code: string | null;
  expiresAt: string | null;
}

interface PriceRuleResponse {
  price_rule: { id: number };
}

interface DiscountCodeResponse {
  discount_code: { id: number; code: string };
}

@Injectable()
export class TimerSaleCodesService {
  private readonly logger = new Logger(TimerSaleCodesService.name);
  private readonly apiVersion = '2025-01';

  constructor(
    @InjectRepository(TimerSaleCode)
    private readonly codeRepository: Repository<TimerSaleCode>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    private readonly evaluationService: EvaluationService,
    private readonly sessionService: SessionService,
  ) {}

  async getOrCreateTimerSaleCode(
    shopId: string,
    customerId: string,
    campaignId: string,
  ): Promise<TimerSaleCodeResult> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId, shopId },
    });

    if (!campaign || campaign.type !== 'timer_sale') {
      return { status: 'not_configured', code: null, expiresAt: null };
    }

    if (!this.isCampaignActive(campaign)) {
      return { status: 'inactive', code: null, expiresAt: null };
    }

    const cfg = campaign.config as TimerSaleConfig;
    if (!cfg || cfg.discountMethod !== 'discount_code') {
      return { status: 'not_configured', code: null, expiresAt: null };
    }
    if (!cfg.discount || !cfg.discount.value) {
      return { status: 'not_configured', code: null, expiresAt: null };
    }

    const eligible = await this.isCustomerEligible(
      shopId,
      customerId,
      campaignId,
    );
    if (!eligible) {
      return { status: 'not_eligible', code: null, expiresAt: null };
    }

    const now = new Date();
    const endsAt = this.resolveEndsAt(campaign, cfg, now);
    if (!endsAt || endsAt.getTime() <= now.getTime()) {
      return { status: 'expired', code: null, expiresAt: null };
    }

    const existing = await this.codeRepository.findOne({
      where: { shopId, campaignId, customerId },
    });

    if (existing) {
      if (existing.usedAt) {
        return { status: 'used', code: null, expiresAt: null };
      }
      if (existing.endsAt.getTime() <= now.getTime()) {
        return { status: 'expired', code: null, expiresAt: null };
      }
      return {
        status: 'ok',
        code: existing.code,
        expiresAt: existing.endsAt.toISOString(),
      };
    }

    try {
      const code = this.generateCode(campaign);
      const created = await this.createDiscountCode(
        shopId,
        customerId,
        campaign,
        cfg.discount,
        code,
        now,
        endsAt,
      );

      const entry = this.codeRepository.create({
        shopId,
        campaignId,
        customerId,
        code,
        priceRuleId: created?.priceRuleId ?? null,
        discountCodeId: created?.discountCodeId ?? null,
        startsAt: now,
        endsAt,
        usedAt: null,
        usedOrderId: null,
      });
      await this.codeRepository.save(entry);

      return {
        status: 'ok',
        code,
        expiresAt: endsAt.toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to create timer sale code for ${shopId}:${campaignId}:${customerId}`,
        error,
      );
      return { status: 'error', code: null, expiresAt: null };
    }
  }

  async markCodesUsed(
    shopId: string,
    customerId: string,
    codes: string[],
    orderId?: string,
  ): Promise<void> {
    if (!codes.length) return;

    const normalized = codes.map((c) => c.trim().toUpperCase()).filter(Boolean);
    if (!normalized.length) return;

    await this.codeRepository
      .createQueryBuilder()
      .update(TimerSaleCode)
      .set({
        usedAt: new Date(),
        usedOrderId: orderId ?? null,
      })
      .where('shop_id = :shopId', { shopId })
      .andWhere('customer_id = :customerId', { customerId })
      .andWhere('used_at IS NULL')
      .andWhere('UPPER(code) IN (:...codes)', { codes: normalized })
      .execute();
  }

  private async isCustomerEligible(
    shopId: string,
    customerId: string,
    campaignId: string,
  ): Promise<boolean> {
    const cached = await this.evaluationService.getCachedBenefits(
      shopId,
      customerId,
    );
    const benefits =
      cached ??
      (await this.evaluationService.evaluateCustomer(shopId, customerId));

    return benefits.some((b) => b.campaignId === campaignId);
  }

  private isCampaignActive(campaign: Campaign): boolean {
    if (campaign.status !== 'active') return false;
    const now = Date.now();
    if (campaign.startsAt && campaign.startsAt.getTime() > now) return false;
    if (campaign.endsAt && campaign.endsAt.getTime() < now) return false;
    return true;
  }

  private resolveEndsAt(
    campaign: Campaign,
    config: TimerSaleConfig,
    now: Date,
  ): Date | null {
    const durationMs = Math.max(0, config.timerDurationMinutes || 0) * 60000;
    let endsAt: Date | null = null;

    if (config.timerType === 'global' && campaign.endsAt) {
      endsAt = new Date(campaign.endsAt);
    } else if (durationMs > 0) {
      endsAt = new Date(now.getTime() + durationMs);
    }

    if (campaign.endsAt && endsAt && endsAt > campaign.endsAt) {
      endsAt = new Date(campaign.endsAt);
    }

    return endsAt;
  }

  private generateCode(campaign: Campaign): string {
    const suffix = randomBytes(4).toString('hex').toUpperCase();
    const base = campaign.name
      ? campaign.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()
      : 'SALE';
    return `VAULT-${base}-${suffix}`;
  }

  private async createDiscountCode(
    shopId: string,
    customerId: string,
    campaign: Campaign,
    discount: DiscountConfig,
    code: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<{ priceRuleId: string; discountCodeId: string } | null> {
    const session = await this.sessionService.findOfflineByShop(shopId);
    if (!session) {
      throw new Error(`No offline session for shop ${shopId}`);
    }

    const productIds = this.normalizeIds(
      (campaign.config as TimerSaleConfig).productIds,
    );
    const collectionIds = this.normalizeIds(
      (campaign.config as TimerSaleConfig).collectionIds,
    );

    const hasTargets = productIds.length > 0 || collectionIds.length > 0;

    const numericCustomerId = this.parseNumericId(customerId);
    if (!numericCustomerId) {
      throw new Error(`Invalid customer id: ${customerId}`);
    }

    const priceRulePayload: Record<string, unknown> = {
      title: `Vault timer sale ${campaign.id} ${customerId}`,
      target_type: 'line_item',
      target_selection: hasTargets ? 'entitled' : 'all',
      allocation_method: discount.type === 'fixed_amount' ? 'each' : 'across',
      value_type: discount.type === 'percentage' ? 'percentage' : 'fixed_amount',
      value: this.discountValue(discount),
      customer_selection: 'prerequisite',
      prerequisite_customer_ids: [numericCustomerId],
      once_per_customer: true,
      usage_limit: 1,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    };

    if (hasTargets) {
      if (productIds.length > 0) {
        priceRulePayload.entitled_product_ids = productIds;
      }
      if (collectionIds.length > 0) {
        priceRulePayload.entitled_collection_ids = collectionIds;
      }
    }

    const ruleResponse = await this.shopifyRest<PriceRuleResponse>(
      shopId,
      session.accessToken,
      'POST',
      '/price_rules.json',
      { price_rule: priceRulePayload },
    );

    const priceRuleId = String(ruleResponse.price_rule.id);

    const codeResponse = await this.shopifyRest<DiscountCodeResponse>(
      shopId,
      session.accessToken,
      'POST',
      `/price_rules/${priceRuleId}/discount_codes.json`,
      { discount_code: { code } },
    );

    const discountCodeId = String(codeResponse.discount_code.id);

    return { priceRuleId, discountCodeId };
  }

  private discountValue(discount: DiscountConfig): string {
    const value = Math.abs(discount.value || 0);
    if (!value) return '0';
    return String(-value);
  }

  private normalizeIds(ids: string[]): number[] {
    if (!Array.isArray(ids)) return [];
    const out: number[] = [];
    for (const id of ids) {
      const raw = String(id || '').trim();
      if (!raw) continue;
      const cleaned = raw.includes('/') ? raw.split('/').pop() : raw;
      const num = Number(cleaned);
      if (Number.isFinite(num) && num > 0) out.push(num);
    }
    return out;
  }

  private parseNumericId(value: string): number | null {
    const raw = String(value || '').trim();
    if (!raw) return null;
    const cleaned = raw.includes('/') ? raw.split('/').pop() : raw;
    const num = Number(cleaned);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  private async shopifyRest<T>(
    shop: string,
    accessToken: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `https://${shop}/admin/api/${this.apiVersion}${path}`;
    const response = await fetch(url, {
      method,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText} ${text}`,
      );
    }

    return response.json() as Promise<T>;
  }
}
