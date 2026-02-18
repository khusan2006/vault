# The Vault - UI/UX Overhaul Design

## Approach
Shopify-native with tasteful enhancements. Follow Polaris conventions as the foundation, add progressive disclosure and micro-interactions that elevate the experience.

## Pages

### 1. Home Dashboard
- **Layout:** Two-column (2/3 + 1/3) using `Layout.Section` + `Layout.Section variant="oneThird"`
- **Left:** Stats bar (3 inline metrics, clickable), Recent campaigns table (last 5)
- **Right:** Getting started checklist (disappears when complete, replaced by quick actions), App status card (honest status with link to theme editor)
- **Removed:** Welcome banner, overview card, quick actions as separate card

### 2. Campaigns List
- **Tabs:** All | Active | Draft | Paused | Archived with counts
- **Search:** Debounced search by name
- **Table columns:** Name (clickable link), Status (badge), Audience (human-readable), Benefits (icon + text), Date
- **Bulk actions:** Delete (with confirmation modal), Change status
- **Empty states:** No campaigns (full EmptyState), no results (inline with clear filters)
- **Toasts:** After delete, duplicate, status change

### 3. Campaign Creation Wizard
- **3 steps:** Details -> Audience -> Benefits
- **Step indicator:** Horizontal stepper with checkmarks for completed steps
- **Step 1:** Name + description only
- **Step 2:** Simple mode (templates) by default, advanced mode (full ConditionBuilder) via toggle
- **Step 3:** Three selectable benefit cards, expand inline to configure
- **Review:** Summary card with "Create campaign" button, creates as Draft
- **Escape hatch:** "Switch to full form" link, preference saved to localStorage

### 4. Campaign Edit Page
- **Layout:** Two-column (2/3 main + 1/3 sidebar)
- **Main:** Details card, Audience card, Benefits card
- **Sidebar:** Status card, Schedule card (collapsible), Priority card (collapsible)
- **Save bar:** ContextualSaveBar for unsaved changes
- **Loading:** SkeletonPage instead of spinner
- **Actions:** Save, Duplicate (secondary), Delete (destructive with modal)

### 5. Feedback & Micro-interactions
- Toast notifications after every mutation
- Inline validation on blur
- Empty state placeholders with dashed borders
- Button spinners during async operations
- Error banners with context
- Confirmation dialogs only for destructive actions

## New Files
- `client/src/components/campaigns/CampaignWizard.tsx` - Wizard container with step management
- `client/src/components/campaigns/WizardStepIndicator.tsx` - Step progress bar
- `client/src/components/campaigns/SimpleConditionBuilder.tsx` - Template-based conditions
- `client/src/components/campaigns/BenefitCards.tsx` - Selectable benefit type cards
- `client/src/components/campaigns/CampaignForm.tsx` - Shared form for edit page
- `client/src/components/ui/StatsCard.tsx` - Reusable stats display
- `client/src/hooks/useToast.ts` - Toast notification hook
- `client/src/hooks/useDirtyForm.ts` - Unsaved changes detection

## Modified Files
- `client/src/app/page.tsx` - Complete redesign
- `client/src/app/campaigns/page.tsx` - Add tabs, search, sort
- `client/src/app/campaigns/campaigns-list.tsx` - Complete redesign
- `client/src/app/campaigns/new/page.tsx` - Replace with wizard
- `client/src/app/campaigns/[id]/page.tsx` - Two-column layout with save bar
- `client/src/app/providers.tsx` - Add toast context
- `client/src/components/campaigns/index.ts` - Export new components
