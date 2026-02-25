# React Native Performance Audit

Date: February 25, 2026

## Scope
Checked for:
- Unnecessary re-renders
- Improper `useEffect` usage
- Missing memoization
- FlatList inefficiencies
- Large objects passed as props
- Image loading inefficiencies

## Findings (Ranked by Impact)

### P0 - High Impact

1. Derived list state causes extra renders and duplicated work
- File: `app/recipes/index.tsx:20-55`
- `localRecipes` is stored in state and recomputed in `useEffect` from `recipes + selectedFilter`.
- Why it matters: every relevant update causes at least one extra render cycle (compute -> `setLocalRecipes` -> re-render), and logic is split between effect + render.
- Fix: remove `localRecipes` state; use `useMemo` for sorted/filtered arrays.

2. FlatList row rendering is not memoized and recreates closures every render
- File: `app/recipes/index.tsx:240-248`
- `renderItem` is inline and creates per-item callbacks (`onPress`, `onToggleFavourite`) each render.
- `onToggleFavourite` also calls `useRecipeStore.getState()` inside render path.
- Why it matters: visible rows re-render more than needed during typing/search/filter changes.
- Fix: memoize row component (`React.memo`), memoize handlers with `useCallback`, and pass stable action from selector.

3. Whole recipe object is spread into list item component
- File: `app/recipes/index.tsx:241-243`
- `RecipeCard {...item}` passes all fields (including arrays like instructions/ingredients/notes), even though row only needs a subset.
- Why it matters: larger prop surface increases reconciliation cost and invalidation sensitivity.
- Fix: pass minimal scalar props needed by row.

### P1 - Medium Impact

4. FlatList tuning options are missing
- File: `app/recipes/index.tsx:221-249`
- No `initialNumToRender`, `windowSize`, `maxToRenderPerBatch`, `updateCellsBatchingPeriod`, `removeClippedSubviews`, `getItemLayout`.
- Why it matters: can increase JS work and memory usage as recipe count grows.
- Fix: tune virtualization settings based on expected row height and typical dataset size.

5. Animation effect in `FreeTierLimitReached` has no cleanup
- File: `components/FreeTierLimitReached.tsx:17-51`
- Recursive `setTimeout(startWiggle, 2000)` continues without teardown on unmount.
- Why it matters: potential orphan timers/animations and unnecessary background work.
- Fix: store timeout id and cancel in cleanup; stop animation on unmount.

6. `console.log` calls in render paths/effects add avoidable runtime work (especially dev)
- Files: `app/_layout.tsx:19,24,85,95,104,119,123,133`, `app/add/AddFromURL.tsx:21`, plus utility logs.
- Why it matters: noisy logging can degrade interactivity during development and mask real profiling signals.
- Fix: guard logs behind dev flag and remove render-time logs.

7. `useEffect` in list screen is used for pure derivation
- File: `app/recipes/index.tsx:52-55`
- This is a pure compute use-case; effect is unnecessary.
- Why it matters: effect scheduling + state update adds latency and complexity.
- Fix: compute via `useMemo` directly from state/inputs.

### P2 - Lower Impact (but worthwhile)

8. `filters` array and icon elements recreated every render in filter drawer
- File: `components/FilterDrawer.tsx:31-36`
- Why it matters: minor repeated allocations.
- Fix: hoist constant outside component or memoize.

9. Inline style/object/function allocations across hot components
- Files: `app/recipes/index.tsx` (multiple inline styles/functions), drawers and cards.
- Why it matters: small but frequent allocation churn; more noticeable on low-end devices.
- Fix: hoist static style objects and memoize callbacks in hot paths.

## Image Loading Inefficiencies

1. No explicit image caching/priority strategy
- Files: `components/RecipeCard.tsx:68-79`, `app/recipes/[id].tsx:156`, `components/RecipeForm.tsx:215-223`
- Why it matters: repeated image decode/network work can cause scroll jank and slower screen transitions.
- Fix: use an optimized image component/caching strategy (`expo-image` with cache policies, thumbnails for list).

2. Imported images are stored without resize/compression pipeline
- File: `utils/downloadAndStoreImage.ts:3-21`
- Why it matters: large files increase storage, decode cost, and memory pressure.
- Fix: normalize imported images to capped dimensions/quality before storage.

3. Detail screen may render full-size images immediately
- File: `app/recipes/[id].tsx:156`
- Why it matters: larger decode cost during initial paint.
- Fix: use progressive loading / placeholder / prefetch for navigation path.

## Improper or Risky `useEffect` Patterns

1. Derived-state effect in list screen (should be memo, not effect)
- `app/recipes/index.tsx:52-55`

2. Uncleaned recursive timer/animation effect
- `components/FreeTierLimitReached.tsx:17-51`

3. Startup effects in layout are heavy and all mount-time coupled
- `app/_layout.tsx:42-140`
- Why it matters: startup work contention can affect time-to-interactive.
- Fix: split critical vs non-critical startup tasks and defer non-essential work.

## Recommended Fix Order

1. Remove `localRecipes` effect state; replace with memoized selectors in `app/recipes/index.tsx`.
2. Optimize FlatList rows: memoized row component + stable handlers + minimal props (no spread).
3. Add FlatList virtualization tuning (`initialNumToRender`, `windowSize`, `removeClippedSubviews`, etc.).
4. Add cleanup to `FreeTierLimitReached` animation loop.
5. Introduce better image pipeline (`expo-image` caching + resize/compress before persist).
6. Reduce render/effect logging and hoist constants/inline allocations in hot screens.

## Bottom Line
Primary performance risk is on the recipes list screen: derived-state effects, unstable row props/handlers, and untuned FlatList behavior. Fixing that path first will deliver the biggest UI smoothness gain. Image pipeline improvements are next biggest win as the recipe library grows.
