# Pre-Release Strict Engineering Audit

Date: February 25, 2026

## Summary
This app is not release-ready by typical company standards for reliability and long-term maintainability. It can ship as an MVP, but it carries high regression and scale risk due to architectural coupling, weak typing boundaries, and missing validation/testing discipline.

## Findings (Prioritized by Severity)

### Critical

1. State layer is overloaded with external billing I/O
- Files: `stores/useRecipeStore.ts:82-105`, `app/_layout.tsx:55-69`
- Category: `Technical debt`, `Scalability risk`, `Maintainability risk`
- Why this is a blocker:
  - Store is both domain state and integration layer (RevenueCat calls in store + direct global store mutation in layout).
  - Side effects are split between store and root layout, making behavior hard to reason about and easy to break.

2. No runtime schema validation on persisted/hydrated recipe data
- Files: `stores/useRecipeStore.ts:44-110`, `app/recipes/index.tsx:69-72`, `components/RecipeCard.tsx:114`
- Category: `Stability risk`, `Scalability risk`
- Why this is a blocker:
  - Persisted data is trusted blindly.
  - Multiple render paths assume string methods (`id.split`, `source.replace`) and can crash on malformed records.

3. Import flow is untyped and directly mapped from remote JSON to app model
- File: `app/add/AddFromURL.tsx:45-75`
- Category: `Code smell`, `Stability risk`, `Technical debt`
- Why this is a blocker:
  - Remote payload contract is not validated.
  - Invalid data can be persisted and poison subsequent screens.

### High

4. Core feature logic duplicated across screens/components
- Files:
  - Purchase flow duplicated: `app/menu/index.tsx:41-59`, `components/AddRecipeDrawer.tsx:159-177`, `components/QuickTourModal.tsx:85-103`
  - Image download duplicated: `utils/downloadAndStoreImage.ts:3-25`, `stores/downloadAndStoreImage.ts:3-23`
- Category: `Technical debt`, `Maintainability risk`
- Why this matters:
  - Increases drift and bug-fix cost.
  - Same business change requires multi-file edits and re-testing.

5. List screen has anti-patterns that will degrade under scale
- File: `app/recipes/index.tsx:20-79,221-248`
- Category: `Code smell`, `Scalability risk`
- Why this matters:
  - Derived state stored in component state (`localRecipes`) with effect-driven recomputation.
  - Inline `renderItem` closures and full-object prop spread (`{...item}`) increase unnecessary rerenders.
  - Uses `any[]` in hot path.

6. No automated tests for critical user flows
- Evidence: no `*.test.*`, `*.spec.*`, `__tests__` in repo.
- Category: `Stability risk`, `Maintainability risk`
- Why this matters:
  - High chance of regressions in import/edit/purchase flows.
  - No safety net for refactors needed before scale.

7. Startup path is overloaded and noisy
- File: `app/_layout.tsx:42-140`
- Category: `Code smell`, `Stability risk`
- Why this matters:
  - Multiple unrelated startup concerns (billing init, splash control, nav bar, quick tour flags) in one component.
  - Heavy logging and direct store mutation from root complicate incident debugging.

### Medium

8. TypeScript rigor is weakened in production code
- Files: `tsconfig.json:6`, `app/add/AddFromURL.tsx:116`, `app/recipes/index.tsx:27`, `app/menu/index.tsx:54`
- Category: `Technical debt`, `Maintainability risk`
- Why this matters:
  - `allowJs: true` plus `any` in key paths reduces compile-time guarantees.
  - Weak typing around external SDK errors and network payloads.

9. ID design is coupled to sorting behavior
- File: `app/recipes/index.tsx:69-73`
- Category: `Code smell`, `Scalability risk`
- Why this matters:
  - Sorting depends on timestamp embedded in `id` format.
  - Identity and ordering should be separate (`id` vs `createdAt`).

10. Stale/dead code and unused artifacts
- Files:
  - `app/_layout.tsx:18-21` (`NoRippleButton` unused)
  - `app/add/AddFromURL.tsx:124-126` (`handleCreateBlank` unused)
  - Orphan/legacy components (e.g., `components/RecipeCardTile.tsx`, `components/HorizontalScroll.tsx`) suggest drift
- Category: `Code smell`, `Maintainability risk`
- Why this matters:
  - Increases cognitive load and onboarding cost.

11. Dependency management inconsistency
- File: `package.json`
- Category: `Technical debt`, `Stability risk`
- Why this matters:
  - `@react-native-community/cli` pinned to `latest` (non-deterministic risk).
  - `zustand` declared as `^5.0.5` while `resolutions` forces `4.3.7` (upgrade ambiguity and hidden break risk).

### Low

12. UX fallback and error strategy is alert-heavy and fragmented
- Files: `app/add/AddFromURL.tsx:39-43,116-121`, `app/menu/index.tsx:33-38,104-115`
- Category: `Code smell`
- Why this matters:
  - Poor observability and limited recoverability from transient failures.

## What Would Concern Me in a Real Company Review

1. Lack of a clear architecture boundary (UI vs domain vs service).
2. Missing test coverage on revenue and import paths.
3. Side-effectful root layout and global mutable state writes.
4. Data integrity risks from unvalidated persisted/remote payloads.
5. Inconsistent dependency and typing discipline.

## Release Recommendation

- Recommendation: `Do not approve for full production release` without a hardening sprint.

## Minimum Hardening Before Release

1. Introduce validated service layer for recipe import + billing orchestration.
2. Add runtime schema validation + store hydration guards/migrations.
3. Remove `any` in critical paths; tighten TS settings where feasible.
4. Refactor recipes list rendering for memoized, scalable behavior.
5. Add baseline tests (store reducers, import mapping, purchase state transitions).
6. Resolve dependency version/resolution conflicts and pin deterministic versions.
