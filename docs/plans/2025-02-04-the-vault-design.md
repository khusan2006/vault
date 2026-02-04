# The Vault - Design Document

## Overview

The Vault is a Shopify app that enables merchants to create rule-based access control for customers. Merchants define campaigns with conditions (who qualifies) and benefits (what they get).

## Core Concepts

### Campaigns (formerly "Rules")
A campaign consists of:
- **Conditions** - Who qualifies (customer attributes with AND/OR logic)
- **Benefits** - What they get (visibility, discount, free product)
- **Scope** - What products/collections it applies to

### Condition Types (v1)
- Customer tags
- Account age
- Total spend
- Order count

### Benefit Types
1. **Visibility** - Products appear only to qualifying customers (automatic)
2. **Discount** - Percentage or fixed amount off (automatic)
3. **Free Product** - Claim a product for free (requires explicit claim)

### Condition Logic
Full AND/OR support with nesting:
```typescript
interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: (Condition | ConditionGroup)[];
}

interface Condition {
  type: 'tag' | 'account_age' | 'total_spent' | 'order_count';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Shopify Storefront                    │
│  (Reads metafields for visibility/pricing, theme blocks) │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ Metafield sync
┌─────────────────────────────────────────────────────────┐
│                   The Vault Backend                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Campaigns   │  │ Evaluator   │  │ Claim Service   │  │
│  │ (CRUD)      │  │ (Who gets   │  │ (Free products) │  │
│  │             │  │  what)      │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                          │                               │
│                    ┌─────┴─────┐                        │
│                    │ PostgreSQL │                        │
│                    └───────────┘                        │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ Webhooks
┌─────────────────────────────────────────────────────────┐
│                    Shopify Admin                         │
│         (Source of truth for customers/products)         │
└─────────────────────────────────────────────────────────┘
```

**Key decisions:**
1. Rules stored as JSONB in Postgres - flexible, queryable
2. Evaluation results cached in customer metafields - fast storefront reads
3. Re-evaluate on webhooks - customer updated, order placed
4. Claims validated server-side - checkout never trusts client

## Database Schema

### campaigns
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| shop_id | string | Indexed |
| name | string | Campaign name |
| description | string? | Optional description |
| conditions | jsonb | ConditionGroup tree |
| benefits | jsonb | Array of benefit objects |
| priority | int | Higher wins on conflicts |
| is_active | boolean | Active status |
| created_at | timestamp | |
| updated_at | timestamp | |

### claims
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| shop_id | string | Indexed |
| campaign_id | uuid | FK to campaigns |
| customer_id | string | Shopify customer GID |
| benefit_type | enum | 'free_product' |
| product_id | string | Shopify product GID |
| claimed_at | timestamp | |
| order_id | string? | Links to fulfillment |
| UNIQUE | | (shop_id, campaign_id, customer_id, product_id) |

### evaluation_cache
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| shop_id | string | |
| customer_id | string | |
| eligible_campaigns | jsonb | Array of campaign IDs |
| computed_benefits | jsonb | Denormalized benefits |
| evaluated_at | timestamp | |
| UNIQUE | | (shop_id, customer_id) |

## Backend Module Structure

```
src/
├── app.module.ts
├── auth/
├── session/
├── shopify/
├── webhooks/ (extend)
│
├── campaigns/
│   ├── campaigns.module.ts
│   ├── campaigns.controller.ts
│   ├── campaigns.service.ts
│   ├── entities/
│   │   └── campaign.entity.ts
│   └── dto/
│       ├── create-campaign.dto.ts
│       └── update-campaign.dto.ts
│
├── evaluation/
│   ├── evaluation.module.ts
│   ├── evaluation.service.ts
│   ├── condition-evaluator.ts
│   ├── benefit-resolver.ts
│   └── entities/
│       └── evaluation-cache.entity.ts
│
├── claims/
│   ├── claims.module.ts
│   ├── claims.controller.ts
│   ├── claims.service.ts
│   └── entities/
│       └── claim.entity.ts
│
├── metafields/
│   ├── metafields.module.ts
│   └── metafields.service.ts
│
└── common/
    ├── types/
    │   ├── condition.types.ts
    │   └── benefit.types.ts
    └── constants/
        └── metafields.ts
```

## Frontend Structure

```
client/
├── app/
│   ├── layout.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── page.tsx (home dashboard)
│   ├── campaigns/
│   │   ├── page.tsx (list)
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── analytics/
│   │           └── page.tsx
│   ├── claims/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
│
├── components/
│   ├── campaigns/
│   │   ├── CampaignList.tsx
│   │   ├── CampaignForm.tsx
│   │   ├── ConditionBuilder.tsx
│   │   └── BenefitSelector.tsx
│   ├── onboarding/
│   │   └── OnboardingSteps.tsx
│   ├── home/
│   │   ├── StatsCards.tsx
│   │   └── RecentActivity.tsx
│   └── shared/
│       └── AppFrame.tsx
│
├── lib/
│   ├── api.ts
│   └── app-bridge.ts
│
└── types/
    └── index.ts
```

**UI Framework:** Shopify Polaris
- `Frame`, `Navigation` - App shell
- `IndexTable` - Campaigns list
- `Card`, `Layout` - Page structure
- `Form`, `TextField`, `Select` - Forms
- `Badge`, `Banner` - Status indicators

## Shopify Integration

### Metafields (namespace: "vault")

Customer metafield `eligible_benefits`:
```json
[{
  "campaign_id": "uuid",
  "type": "visibility",
  "product_ids": ["gid://shopify/Product/123"]
}, {
  "type": "discount",
  "product_ids": ["gid://shopify/Product/456"],
  "discount": { "type": "percentage", "value": 20 }
}, {
  "type": "free_product",
  "product_ids": ["gid://shopify/Product/789"],
  "claimed": false
}]
```

### Webhooks
| Webhook | Action |
|---------|--------|
| customers/update | Re-evaluate customer |
| orders/paid | Re-evaluate customer |
| app/uninstalled | Clean up shop data |

## Evaluation Flow

1. **Trigger:** Customer logs in, webhook fires, or campaign updated
2. **Fetch:** Get customer data from Shopify
3. **Evaluate:** Run all active campaigns against customer
4. **Resolve:** Handle conflicts via priority
5. **Cache:** Store in evaluation_cache table
6. **Sync:** Push benefits to customer metafield

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Database schema + migrations
- Campaign CRUD (backend)
- Basic condition evaluator (tags, account age only)
- Polaris app shell with navigation

### Phase 2: Core Campaign Builder (Week 3-4)
- Campaign list page
- Campaign create/edit form
- Condition builder UI (AND/OR tree)
- Benefit selector (all 3 types)
- Metafield sync service

### Phase 3: Evaluation Engine (Week 5-6)
- Full condition evaluation logic
- Webhook handlers (customer/update, orders/paid)
- Evaluation caching
- Customer preview ("test who qualifies")

### Phase 4: Claims & Validation (Week 7-8)
- Claims tracking
- Checkout validation endpoint
- Storefront theme extension (basic)
- Claims history page

### Phase 5: Polish (Week 9-10)
- Onboarding flow
- Home dashboard with stats
- Campaign analytics
- Error handling, edge cases
