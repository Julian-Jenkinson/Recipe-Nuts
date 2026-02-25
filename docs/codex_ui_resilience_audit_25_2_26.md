# UI Resilience Audit

Date: February 25, 2026

## Assumptions Tested
- `image` may be `null`
- `description` may be missing
- `ingredients` may be long strings
- `instructions` may be very long
- network may fail

## Findings: Where UI Can Break or Crash

### Critical

1. Potential runtime crash in recipe cards when `source` is non-string
- File: `components/RecipeCard.tsx:114`
- Code uses `source.replace(...)` without string guard.
- If API/persisted data sets `source` to object/number/null-ish non-string, this can throw and break list rendering.

2. Potential runtime crash in list sorting when `id` is malformed
- File: `app/recipes/index.tsx:69-72`
- `id.split('-')` assumes string.
- If bad data enters store, recipes screen can crash before rendering.

### High

3. Detail image fallback depends on remote placeholder URL
- File: `app/recipes/[id].tsx:34,156`
- Fallback image is `https://via.placeholder.com/400` (network-dependent).
- In offline/network-failure state, fallback may fail and show blank/broken image area.

4. Network failure UX is modal-only, not persistent UI state
- File: `app/add/AddFromURL.tsx:35-43,116-121`
- Failures are surfaced via `Alert.alert`, then dismissed.
- No inline error block, retry CTA, or retained failure reason in screen state.
- This is resilient functionally, but weak visually and user can get stuck without context.

5. Very long ingredient/instruction content can create visual overflow pressure
- File: `app/recipes/[id].tsx:334-371` (`ingredientText`, `instructionParagraph`)
- No explicit `flexShrink: 1` / constrained text container in row HStacks.
- Extremely long unbroken strings can push layout awkwardly or clip/truncate unexpectedly.

### Medium

6. Very large instructions/ingredients lists render in `ScrollView` (no virtualization)
- File: `app/recipes/[id].tsx:144-275`
- Large content is fully rendered at once.
- For very long recipes, UI can stutter/freeze on lower-end devices.

7. “Description missing” has no dedicated fallback model
- Current model has `source`, not `description`.
- Missing text fields usually render empty, but the UI doesn’t present explicit placeholders like “No description available.”
- This can make cards/details feel broken or incomplete even if not crashing.

8. Edit screen image handling lacks robust invalid-URI fallback
- File: `app/recipes/EditRecipe.tsx:194-202`
- It renders `<Image source={{ uri: draftRecipe.imageUrl }}>` whenever non-empty; no `onError` to recover to placeholder.

## What Already Holds Up

1. Card-level image fallback exists for null/invalid-ish `imageUrl`
- `components/RecipeCard.tsx:58-62` falls back to local `error.png`.

2. Form screen has defensive image URL validation
- `components/RecipeForm.tsx:38-41,215-231` uses `isValidImageUrl` and placeholder box.

3. Empty list/search states are explicitly designed
- `app/recipes/index.tsx:187-219` has clear empty-state UI.

## Defensive UI Patterns To Add

1. Add safe formatting helpers before rendering risky fields
- `safeText(value, fallback)`
- `safeDomain(value)`
- `safeId(value)`
- Use them in card/list/detail so bad persisted data never crashes rendering.

2. Add resilient image component wrapper
- Create shared `AppImage` with:
  - local fallback asset
  - `onError` swap to fallback
  - optional loading placeholder/skeleton
  - offline-safe fallback (local, not remote URL)

3. Replace alert-only network errors with persistent inline error state
- On import failure, show an in-screen error panel with:
  - reason summary
  - retry button
  - keep URL input intact

4. Harden long-text layout
- In ingredient/instruction text styles add `flexShrink: 1`.
- Consider `lineBreakStrategyIOS`, `ellipsizeMode` where appropriate.
- Optionally chunk/expand very long single items (“Show more”).

5. Virtualize long recipe content
- For detail screen sections, prefer `FlatList`/`SectionList` for ingredients/instructions when arrays are large.
- This prevents rendering everything at once.

6. Add explicit fallbacks for missing optional fields
- Show placeholders like:
  - “Unknown source”
  - “No description available” (if you add description field)
  - “No notes yet”

## Priority Fix Order

1. Guard `source.replace` and `id.split` with safe coercion utilities (crash prevention).
2. Replace remote placeholder fallback with local asset fallback in detail image.
3. Add inline network error UI + retry for `AddFromURL`.
4. Add `flexShrink` and long-text safeguards for ingredient/instruction rows.
5. Virtualize large detail content sections.

## Bottom Line
Main resilience risks are crash-prone string assumptions and network-dependent fallback visuals. The app mostly handles empty/null data paths, but it needs stronger safe-render helpers and offline-safe image/error UI to avoid hard failures and broken-looking states.
