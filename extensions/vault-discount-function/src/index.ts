type DiscountValue = {
  type?: string;
  value?: number;
};

type Benefit = {
  type?: string;
  campaignType?: string;
  productIds?: string[];
  discount?: DiscountValue;
};

type RunInput = {
  cart?: {
    lines?: Array<{
      quantity?: number;
      merchandise?: {
        id?: string;
        product?: { id?: string };
      };
    }>;
    buyerIdentity?: {
      customer?: {
        metafield?: { value?: string | null } | null;
      } | null;
    } | null;
  } | null;
  discountNode?: {
    metafield?: { value?: string | null } | null;
  } | null;
};

const EMPTY_RESULT = { discounts: [], discountApplicationStrategy: 'FIRST' };

function parseBenefits(raw: unknown): Benefit[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Benefit[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Benefit[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseMode(input: RunInput): string | null {
  const raw = input.discountNode?.metafield?.value;
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'mode' in parsed) {
        return String((parsed as { mode?: string }).mode || '');
      }
    } catch {
      return raw;
    }
  }
  return String(raw);
}

function cleanId(id?: string | null): string {
  if (!id) return '';
  const parts = String(id).split('/');
  return parts[parts.length - 1] || '';
}

function matchesBenefit(benefit: Benefit, productId: string, mode: string | null): boolean {
  if (!benefit || benefit.type !== 'discount') return false;
  if (mode && benefit.campaignType && benefit.campaignType !== mode) return false;
  const ids = benefit.productIds || [];
  if (!ids.length) return true;
  return ids.includes(productId);
}

export function run(input: RunInput) {
  const cart = input.cart;
  const lines = cart?.lines || [];
  const customer = cart?.buyerIdentity?.customer;
  const rawBenefits = customer?.metafield?.value;
  const benefits = parseBenefits(rawBenefits);
  if (!benefits.length || !lines.length) return EMPTY_RESULT;

  const mode = parseMode(input);
  const discounts = [] as Array<{
    targets: Array<{ productVariant: { id: string } }>;
    value: Record<string, unknown>;
  }>;

  for (const line of lines) {
    const variantId = line.merchandise?.id;
    const productId = cleanId(line.merchandise?.product?.id);
    if (!variantId || !productId) continue;

    const benefit = benefits.find((b) => matchesBenefit(b, productId, mode));
    if (!benefit || !benefit.discount || !benefit.discount.value) continue;

    const discountValue = benefit.discount.value;
    const value =
      benefit.discount.type === 'fixed_amount'
        ? { fixedAmount: { amount: discountValue, appliesToEachItem: true } }
        : { percentage: { value: discountValue } };

    discounts.push({
      targets: [{ productVariant: { id: variantId } }],
      value,
    });
  }

  if (!discounts.length) return EMPTY_RESULT;
  return {
    discounts,
    discountApplicationStrategy: 'FIRST',
  };
}
