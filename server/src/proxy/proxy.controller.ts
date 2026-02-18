import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { ProxySignatureGuard } from './proxy-signature.guard.js';
import { EvaluationService } from '../evaluation/evaluation.service.js';

@Controller('api/proxy')
@UseGuards(ProxySignatureGuard)
@SkipThrottle()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(
    private readonly evaluationService: EvaluationService,
  ) {}

  // ---------------------------------------------------------------------------
  // Customer benefits
  // ---------------------------------------------------------------------------

  @Get('customer-benefits')
  async getCustomerBenefits(
    @Query('shop') shop: string,
    @Query('logged_in_customer_id') customerId: string,
  ) {
    if (!customerId) return { benefits: [] };

    try {
      const cached = await this.evaluationService.getCachedBenefits(
        shop,
        customerId,
      );
      if (cached) return { benefits: cached };

      const benefits = await this.evaluationService.evaluateCustomer(
        shop,
        customerId,
      );
      return { benefits };
    } catch (error) {
      this.logger.error(
        `Failed to get benefits for customer ${customerId} on ${shop}`,
        error,
      );
      return { benefits: [] };
    }
  }

  // ---------------------------------------------------------------------------
  // Exclusive products page (served as Liquid)
  // ---------------------------------------------------------------------------

  @Get('exclusive')
  getExclusivePage(@Res() res: Response) {
    // The heading/subtitle/grid are populated dynamically by vault.js
    // using the campaign's landingPage displayConfig. IDs allow JS to
    // replace the placeholder text with the merchant's custom content.
    const html = `
<div class="v-excl" id="vault-exclusive-section">
  <div class="v-excl__header">
    <h2 class="v-excl__title" id="vault-excl-title">Exclusive Products</h2>
    <p class="v-excl__sub" id="vault-excl-subtitle">Products available just for you</p>
  </div>

  {% if customer %}
    <div class="v-excl__grid" id="vault-products-grid">
      <div class="v-excl__loading" id="vault-loading">
        <div class="v-loading-spin"></div>
        <p>Loading your exclusive products…</p>
      </div>
    </div>
  {% else %}
    <div class="v-excl__login">
      <p>Please <a href="/account/login">log in</a> to see your exclusive products and offers.</p>
    </div>
  {% endif %}
</div>
`;

    res.setHeader('Content-Type', 'application/liquid');
    res.send(html);
  }
}
