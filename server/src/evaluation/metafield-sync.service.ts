import { Injectable, Logger } from '@nestjs/common';
import { SessionService } from '../session/session.service.js';
import { ShopifyService } from '../shopify/shopify.service.js';
import {
  METAFIELD_NAMESPACE,
  METAFIELD_KEYS,
} from '../common/constants/metafields.js';
import type { ComputedBenefit } from './entities/evaluation-cache.entity.js';

@Injectable()
export class MetafieldSyncService {
  private readonly logger = new Logger(MetafieldSyncService.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly shopifyService: ShopifyService,
  ) {}

  async syncCustomerMetafield(
    shopId: string,
    customerId: string,
    benefits: ComputedBenefit[],
  ): Promise<void> {
    try {
      const sessionResult =
        await this.sessionService.findOfflineByShop(shopId);
      if (!sessionResult) {
        this.logger.warn(
          `No offline session for shop ${shopId}, skipping metafield sync`,
        );
        return;
      }

      const shopify = this.shopifyService.getClient();
      const gid = customerId.startsWith('gid://')
        ? customerId
        : `gid://shopify/Customer/${customerId}`;

      const session = {
        shop: shopId,
        accessToken: sessionResult.accessToken,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = new shopify.clients.Graphql({ session: session as any });

      await client.request(
        `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields { id namespace key }
            userErrors { field message }
          }
        }`,
        {
          variables: {
            metafields: [
              {
                ownerId: gid,
                namespace: METAFIELD_NAMESPACE,
                key: METAFIELD_KEYS.ELIGIBLE_BENEFITS,
                type: 'json',
                value: JSON.stringify(benefits),
              },
            ],
          },
        },
      );

      this.logger.log(
        `Synced metafield for customer ${customerId} on shop ${shopId} (${benefits.length} benefits)`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to sync metafield for customer ${customerId} on shop ${shopId}`,
        error,
      );
    }
  }
}
