# React Native Architecture Audit

Date: February 25, 2026

## Scope
Audit focus:
- Separation of concerns (UI vs business logic vs API layer)
- State management patterns
- Reusability of components
- Folder structure quality
- Scalability concerns
- Tight coupling / anti-patterns

## 1. What Is Well Structured

1. Zustand persistence is a solid baseline for local-first behavior.
- `stores/useRecipeStore.ts` keeps recipe CRUD and persistence centralized (`persist` + `AsyncStorage`), which is good for an offline-first app.
- Basic domain shape (`Recipe`) is explicit and reused across screens.

2. Routing and screen boundaries are understandable.
- Route layout under `app/` is simple and discoverable (`app/recipes`, `app/add`, `app/menu`).
- `app/index.tsx` redirects cleanly to the main feature entry.

3. There is an attempt to make forms reusable.
- `components/RecipeForm.tsx` is a good direction: shared create/edit form with draft conversion logic.

4. UI decomposition is started.
- Shared pieces like `RecipeCard`, `AddRecipeButton`, `FilterDrawer`, `QuickTourModal` reduce duplication in list/detail screens.

## 2. What Is Risky

### Critical
1. Business logic and infra concerns are embedded directly in UI components.
- API calling, parsing, data mapping, local file storage, and review prompting all live in `app/add/AddFromURL.tsx:23-151`.
- RevenueCat purchase orchestration is duplicated across `app/menu/index.tsx:41-59`, `components/AddRecipeDrawer.tsx:159-177`, and `components/QuickTourModal.tsx:85-103`.
- Global app bootstrap (`app/_layout.tsx`) mixes font loading, splash orchestration, purchase setup, local flags, and nav bar behavior in one component.

2. Store layer is acting as both domain state and external service boundary.
- `stores/useRecipeStore.ts:82-105` performs RevenueCat I/O inside state store actions.
- This tightly couples state container choice (Zustand) to vendor API behavior.

### High
3. Feature logic is duplicated across screens/components.
- Edit/create transformation logic appears in both `components/RecipeForm.tsx` and `app/recipes/EditRecipe.tsx`.
- Image downloading exists twice with different contracts:
  - `utils/downloadAndStoreImage.ts:3-25` returns `string | null` with dedupe check.
  - `stores/downloadAndStoreImage.ts:3-23` returns `string` and logs heavily.

4. Folder structure is layer-based but too flat for feature growth.
- `components/`, `stores/`, `utils/` become shared dumping grounds as features increase.
- There is no feature module boundary (e.g., `features/recipes`, `features/subscription`) and no explicit domain/service split.

5. Data derivation is managed in local component state instead of selectors/services.
- `app/recipes/index.tsx:20-79` keeps `localRecipes` plus sort/filter/search orchestration in screen state, increasing re-render complexity and drift.

6. Store access bypasses React subscription model in places.
- `useRecipeStore.getState().toggleFavourite(...)` inside UI render paths (`app/recipes/index.tsx:244-246`) creates tighter coupling and makes testability harder than action hooks/selectors.

### Medium
7. Dead/unused artifacts indicate architecture drift.
- `NoRippleButton` is defined but unused in `app/_layout.tsx:18-21`.
- `handleCreateBlank` unused in `app/add/AddFromURL.tsx:124-126`.
- `components/HorizontalScroll.tsx`, `components/FilterPill.tsx`, and `components/RecipeCardTile.tsx` appear orphaned and inconsistent with current active flow.

8. Inconsistent naming and semantics leak into architecture.
- `source` is modeled as source URL/domain but surfaced as “Author” in forms (`components/RecipeForm.tsx:252`).
- Mixed route casing (`EditRecipe`) and naming conventions reduce predictability.

## 3. What Should Be Refactored First

1. Introduce a proper service layer and remove network/purchase/file logic from UI.
- Create `services/recipeImportService.ts` for URL import + parse + map + image store.
- Create `services/subscriptionService.ts` for RevenueCat configure/sync/purchase/restore.
- Screens should call service functions and only handle view-state + navigation.

2. Split store responsibilities.
- Keep `useRecipeStore` focused on in-memory state transitions and persistence.
- Move RevenueCat I/O out of `stores/useRecipeStore.ts` and into services/hooks (`useSubscription`).

3. Remove duplicated flows and standardize contracts.
- Keep a single image download helper (one return type, one error policy).
- Keep one recipe draft <-> domain mapper (shared by create/edit).
- Keep one purchase flow entry-point reused by menu/drawers/quick-tour.

4. Reorganize by feature modules.
- Example:
  - `features/recipes/{screens,components,services,store,types}`
  - `features/subscription/{components,services,store}`
  - `shared/{ui,lib,theme}`
- This will reduce cross-feature coupling and make ownership clearer.

## 4. What Will Cause Problems As The App Grows

1. Change amplification.
- A subscription behavior change currently requires edits in 3+ files across `app/` and `components/`.

2. Regression rate will climb.
- Duplicated create/edit/import mapping logic will drift and produce inconsistent recipe data normalization.

3. Performance and complexity debt in list screens.
- As recipe count grows, ad-hoc sorting/filtering/search in `app/recipes/index.tsx` will become harder to optimize without memoized selectors or indexed querying.

4. Team scaling friction.
- Flat shared folders encourage accidental coupling and make code ownership unclear.
- New contributors will keep adding “just one more util” instead of extending a feature module.

5. Testing difficulty.
- UI components currently own side effects (network, purchase, file system, alerts), making unit tests brittle and integration tests expensive.

## Bottom Line
The app is workable and ships, but architecture is currently UI-driven rather than domain/service-driven. The biggest scalability risk is not raw performance yet; it is change risk from duplicated business logic and tight coupling between screens, store, and vendor APIs.
