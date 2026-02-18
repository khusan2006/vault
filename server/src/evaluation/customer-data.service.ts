import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { SessionService } from '../session/session.service.js';
import { ShopifyService } from '../shopify/shopify.service.js';

export interface CustomerData {
  id: string;
  tags: string[];
  createdAt: Date;
  totalSpent: number;
  orderCount: number;
}

export interface CustomerDataWithHash extends CustomerData {
  dataHash: string;
}

@Injectable()
export class CustomerDataService {
  private readonly logger = new Logger(CustomerDataService.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly shopifyService: ShopifyService,
  ) {}

  async fetchCustomerData(
    shopId: string,
    customerId: string,
  ): Promise<CustomerDataWithHash> {
    const sessionResult = await this.sessionService.findOfflineByShop(shopId);
    if (!sessionResult) {
      throw new Error(`No offline session found for shop: ${shopId}`);
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

    const response = await client.request(
      `query GetCustomer($id: ID!) {
        customer(id: $id) {
          id
          tags
          createdAt
          amountSpent { amount currencyCode }
          numberOfOrders
        }
      }`,
      { variables: { id: gid } },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customer = (response as any).data?.customer;
    if (!customer) {
      throw new Error(`Customer not found: ${gid}`);
    }

    const data: CustomerData = {
      id: customer.id,
      tags: customer.tags || [],
      createdAt: new Date(customer.createdAt),
      totalSpent: parseFloat(customer.amountSpent?.amount || '0'),
      orderCount: parseInt(customer.numberOfOrders || '0', 10),
    };

    const dataHash = this.computeHash(data);
    return { ...data, dataHash };
  }

  /**
   * Fetch product handles for a list of product GIDs.
   * Returns a map of numeric product ID → handle.
   */
  async fetchProductHandles(
    shopId: string,
    productGids: string[],
  ): Promise<Map<string, string>> {
    const handleMap = new Map<string, string>();
    if (productGids.length === 0) return handleMap;

    const sessionResult = await this.sessionService.findOfflineByShop(shopId);
    if (!sessionResult) {
      this.logger.warn(
        `No offline session for shop ${shopId}, skipping product handle fetch`,
      );
      return handleMap;
    }

    const shopify = this.shopifyService.getClient();
    const session = {
      shop: shopId,
      accessToken: sessionResult.accessToken,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = new shopify.clients.Graphql({ session: session as any });

    // Build aliased query — fetch up to 50 products at once
    const gids = productGids.slice(0, 50).map((id) =>
      id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`,
    );

    const fragments = gids.map(
      (gid, i) => `p${i}: product(id: "${gid}") { id handle }`,
    );

    try {
      const response = await client.request(
        `query { ${fragments.join('\n')} }`,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (response as any).data;
      if (data) {
        for (let i = 0; i < gids.length; i++) {
          const product = data[`p${i}`];
          if (product?.handle) {
            const numericId = String(product.id).replace(
              'gid://shopify/Product/',
              '',
            );
            handleMap.set(numericId, product.handle);
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to fetch product handles', error);
    }

    return handleMap;
  }

  private computeHash(data: CustomerData): string {
    const hashInput = JSON.stringify({
      tags: [...data.tags].sort(),
      totalSpent: data.totalSpent,
      orderCount: data.orderCount,
      createdAt: data.createdAt.toISOString(),
    });
    return createHash('sha256').update(hashInput).digest('hex');
  }
}
