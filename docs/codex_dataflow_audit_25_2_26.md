# Recipe Data Flow Audit

Date: February 25, 2026

## Scope
Trace `Recipe` flow from:
API -> network layer -> storage -> state -> UI

## End-to-End Data Flow (Current)

1. API ingress (import path)
- `app/add/AddFromURL.tsx:35-45` calls `fetch(...)` directly from UI and parses `response.json()` with no typed contract.
- `app/add/AddFromURL.tsx:57-72` maps response fields into `newRecipe`.

2. Network layer
- There is no dedicated network layer for recipe import.
- Request, response handling, validation assumptions, and error UX all live in `AddFromURL` screen (`app/add/AddFromURL.tsx:23-121`).

3. Storage (file + persistent state)
- Optional image is downloaded to local filesystem in `utils/downloadAndStoreImage.ts:3-25`.
- Recipe objects are persisted via Zustand `persist` + `AsyncStorage` in `stores/useRecipeStore.ts:44-110`.

4. State
- `addRecipe` writes directly into the global array (`stores/useRecipeStore.ts:52-53`).
- Reads happen via selectors/getters (`stores/useRecipeStore.ts:55`, then consumed in screens).

5. UI consumption
- List screen reads `recipes` and derives sorted/filtered lists (`app/recipes/index.tsx:17-63`).
- Card components render fields (`components/RecipeCard.tsx:52-175`).
- Detail screen renders full object and performs deletes/share (`app/recipes/[id].tsx:21-277`).

6. Non-API creation path
- `RecipeForm` builds a `Recipe` object from local inputs and sends through `onSubmit` (`components/RecipeForm.tsx:79-117`).
- `AddBlankRecipe` writes it with `addRecipe` (`app/add/AddBlankRecipe.tsx:11-21`).

## Findings

### Critical

1. No runtime validation barrier before persisting `Recipe`
- `response.json()` is treated as trusted object (`app/add/AddFromURL.tsx:45`).
- `newRecipe` is constructed from untyped `data` and immediately persisted (`app/add/AddFromURL.tsx:57-75`).
- Result: malformed data can enter persisted storage and survive app restarts.

2. No schema validation on rehydrated persisted state
- Zustand persistence has no `version`, `migrate`, or schema gate (`stores/useRecipeStore.ts:107-110`).
- Result: older/corrupt `recipe-storage` payloads can crash UI paths that assume string fields.

### High

3. Unsafe assumptions on field types in UI render paths
- `source.replace(...)` assumes `source` is string (`components/RecipeCard.tsx:114`).
- `imageUrl.startsWith(...)` assumes `imageUrl` is string (`components/RecipeCard.tsx:59`, `app/recipes/[id].tsx:94`).
- `id.split(...)` assumes `id` is string (`app/recipes/index.tsx:69-72`).
- If persisted data contains wrong types, these can throw runtime errors.

4. Validation logic can accept wrong shapes
- Gate checks `data.ingredients?.length` and `data.instructions?.length` (`app/add/AddFromURL.tsx:47`) but only later uses arrays.
- A string like `"abc"` passes length check, then becomes `[]` due `Array.isArray(...)` mapping (`app/add/AddFromURL.tsx:61-62`).
- Result: false-positive “valid import” with silently broken recipe content.

5. TypeScript safety is bypassed in key points
- `response.json()` is effectively `any` (`app/add/AddFromURL.tsx:45`).
- `catch (err: any)` in critical flow (`app/add/AddFromURL.tsx:116`).
- Sorting function uses `any[]` (`app/recipes/index.tsx:27`).
- `allowJs: true` weakens strictness guarantees (`tsconfig.json:6`).

### Medium

6. Duplicate image storage utilities with different contracts
- `utils/downloadAndStoreImage.ts` returns `string | null` with existence check.
- `stores/downloadAndStoreImage.ts` returns `string` and no dedupe.
- Divergent behavior increases future bugs when reused.

7. ID strategy is overloaded for sorting
- Sorting assumes ID suffix is timestamp (`app/recipes/index.tsx:69-73`).
- This creates hidden coupling between identity and ordering format.

8. Store write actions have no guardrails
- `addRecipe` and `updateRecipe` trust caller payload (`stores/useRecipeStore.ts:52-53`, `67-72`).
- No normalization (trim, coercion) or required-field assertions at boundary.

## Potential Runtime Crash Examples

1. Corrupt `source` from persisted state (e.g., object) -> `source.replace` throws in card rendering (`components/RecipeCard.tsx:114`).
2. Corrupt `id` (non-string) -> `id.split` throws in recipe list sort (`app/recipes/index.tsx:69-72`).
3. Corrupt `imageUrl` (non-string) -> `startsWith` throws in delete/image checks (`app/recipes/[id].tsx:94`, `components/RecipeCard.tsx:59`).

## Improvements For Robustness + Future-Proofing

1. Add strict runtime schemas at boundaries
- Use `zod`/`valibot` for:
  - API response schema (`RecipeApiResponse`)
  - persisted recipe schema (`RecipePersisted`)
- Validate before calling `addRecipe`.
- Reject + surface import error when schema fails.

2. Introduce a real recipe import network/service layer
- Move import flow out of screen into `services/recipeImportService.ts`.
- Service responsibilities:
  - URL validation
  - fetch with timeout (`AbortController`)
  - schema validation + normalization
  - image download orchestration
  - typed `Result` return

3. Harden persisted state lifecycle
- Add Zustand `version` + `migrate` for schema changes.
- On hydration, sanitize recipe array:
  - ensure all string fields are strings
  - coerce arrays to `string[]`
  - drop invalid records with telemetry

4. Strengthen TypeScript contracts
- Replace `any` with explicit types and `unknown` + narrows.
- Remove `any[]` in list sort: use `Recipe[]`.
- Prefer `catch (err: unknown)` with typed error utility.
- Consider disabling `allowJs` unless required.

5. Normalize at a single write boundary
- Create `normalizeRecipe(input): Recipe` and use it in all writes:
  - API import
  - form create
  - form edit
  - migrations
- Keep `id` and `createdAt` separate; stop deriving time from `id`.

6. Add defensive UI helpers (cheap protection)
- Use safe formatters in UI:
  - `safeString(value)`
  - `safeDomain(value)`
  - `safeImageUri(value)`
- This prevents single corrupt records from taking down list/detail screens.

7. Consolidate duplicate image utilities
- Keep one `downloadAndStoreImage` in `utils/` with one return contract and consistent fallback behavior.

## Priority Refactor Order

1. Add runtime schema validation + normalized write boundary.
2. Add persist migration + hydration sanitizer.
3. Extract `recipeImportService` from `AddFromURL`.
4. Replace `any`/`any[]` and remove risky string method assumptions in render code.
5. Split `id` from ordering (`createdAt` field).

## Bottom Line
Current flow works in happy-path conditions, but it is fragile at trust boundaries. The highest risk is unvalidated data entering persistent state and then being rendered with string-only assumptions. Add a validation/normalization barrier first; that gives the biggest reliability gain immediately.
