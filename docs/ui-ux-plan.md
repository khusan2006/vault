# UI/UX Improvement Plan — The Vault

## Critical Issues Found

### Broken
1. Home page won't build — uses `CircleTickMinor` which doesn't exist in polaris-icons
2. Theme App Embed toggle is fake (local state only) — misleading

### Poor UX Patterns
3. Home page: 5 full-width cards stacked vertically — too long, "Quick Actions" is redundant
4. Stats use wrong icons (PersonIcon for campaigns, GiftCardIcon for drafts)
5. Campaigns list: no status filter tabs, no search
6. Bulk delete has no confirmation dialog
7. Create/Edit pages: single column layout, no sidebar — doesn't follow Shopify form conventions
8. Edit page loading shows "Loading..." as page title instead of skeleton
9. Status selector on create page is confusing — new campaigns should always be draft
10. No unsaved changes detection or contextual save bar
11. No toast notifications after save/delete — user gets silently redirected
12. Selected products show only count ("3 selected") — no way to see which ones
13. Create and Edit pages are 90% duplicate code

---

## Phase 1: Fix Broken & Misleading UI

### 1a. Fix home page build error
- **File**: `app/page.tsx`
- Remove `CircleTickMinor` import (doesn't exist)
- Remove unused `StatusIcon` import
- Use `CheckCircleIcon` (already imported) and `CircleAlertMajor` or similar existing icons

### 1b. Clean up home page layout
- **File**: `app/page.tsx`
- Remove the "Quick Actions" card entirely (redundant with nav + overview card)
- Remove fake Theme App Embed section (misleading, not functional)
- Combine welcome message into the page header (use Page `subtitle` prop)
- Consolidate to 2 cards: **Overview stats** and **Setup guide**
- Fix stat icons: TargetIcon (active), HashtagIcon (total), EditIcon (drafts)
- Add loading skeleton using `SkeletonBodyText` instead of showing "-"

---

## Phase 2: Improve Campaign List UX

### 2a. Add status filter tabs
- **File**: `app/campaigns/campaigns-list.tsx`
- Add `Tabs` component above the IndexTable with: All, Active, Draft, Paused, Archived
- Track selected tab in state, pass `status` param to `campaignsApi.list()`
- Show count badge on each tab

### 2b. Add search
- **File**: `app/campaigns/campaigns-list.tsx`
- Add `Filters` or a simple `TextField` with search icon above the table
- Client-side filter on campaign name (data is already loaded)

### 2c. Better date display
- Show relative time for recent dates ("2 hours ago", "Yesterday")
- Fall back to formatted date for older ones

### 2d. Bulk delete confirmation
- Add a confirmation modal before bulk delete (same pattern as edit page delete modal)

---

## Phase 3: Redesign Campaign Form (Create + Edit)

### 3a. Unify create/edit into a shared form component
- **New file**: `components/campaigns/CampaignForm.tsx`
- Accepts `campaign?: Campaign` prop (undefined = create mode, defined = edit mode)
- Accepts `onSave`, `onDelete`, `onDuplicate` callbacks
- Both `new/page.tsx` and `[id]/page.tsx` become thin wrappers

### 3b. Proper Shopify form layout with sidebar
- **Main column** (Layout.Section): Campaign details card, Conditions card, Benefits card
- **Sidebar** (Layout.Section variant="oneThird"): Status card, Schedule card (start/end dates), Summary card

### 3c. Status handling
- Create page: no status selector, always creates as "draft"
- Edit page: status in sidebar with clear visual states
- Separate "Activate" / "Pause" / "Archive" actions as explicit buttons — not a dropdown

### 3d. Better loading state for edit page
- Use `SkeletonPage` with `SkeletonBodyText` and `SkeletonDisplayText` instead of spinner with "Loading..." title

### 3e. Contextual save bar
- Track dirty state by comparing current form values to initial values
- Show Polaris `ContextualSaveBar` when there are unsaved changes
- Discard button resets to initial values

### 3f. Toast notifications
- Use `shopify.toast.show()` from App Bridge after successful save/delete/duplicate
- Remove redirect-as-feedback pattern — show toast then redirect

---

## Phase 4: Polish Components

### 4a. Better product selection display in BenefitSelector
- After selecting products, show a mini list of product titles (not just count)
- Use `Tag` components to show selected items with remove capability
- Keep the "Select products" button to add more

### 4b. Condition builder visual improvements
- Add subtle connecting lines or badges between conditions showing AND/OR
- Add inline validation — highlight empty values with error state
- Better labels: "Customer must match ALL/ANY of these rules"

---

## Implementation Order

| Step | Files Changed | Impact |
|------|--------------|--------|
| 1a | `app/page.tsx` | Fixes build |
| 1b | `app/page.tsx` | Cleaner dashboard |
| 2a-2d | `campaigns-list.tsx` | Better list UX |
| 3a | New `CampaignForm.tsx` | Code dedup |
| 3b-3c | `CampaignForm.tsx`, `new/page.tsx`, `[id]/page.tsx` | Proper form layout |
| 3d-3f | `CampaignForm.tsx` | Polish: skeleton, save bar, toasts |
| 4a-4b | `BenefitSelector.tsx`, `ConditionBuilder.tsx` | Component polish |
