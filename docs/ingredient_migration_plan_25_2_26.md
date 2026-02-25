# Ingredient Migration Plan (25-02-2026)

1. Define the target shape
- Use `IngredientDetail[]` as the single format in app state and UI.
- Keep `raw` required for user-editable ingredient text.

2. Keep migration in one utility layer
- Use domain utilities for parsing/migration (not in screens/components).
- Input can be `string | IngredientDetail | unknown`, output must be safe `IngredientDetail`.

3. Normalize on read boundaries
- When loading from API/storage, convert legacy `ingredients: string[]` to `ingredientDetails`.
- After normalization, pass only `IngredientDetail[]` through the app.

4. Update create flow
- User inputs write to `raw`.
- Parse on blur/save to populate structured fields.
- Persist canonical `ingredientDetails`.

5. Update edit flow
- Load recipe into normalized `IngredientDetail[]`.
- Editing updates `raw`; re-parse on blur/save.
- Save only canonical `ingredientDetails`.

6. Temporary compatibility strategy
- Read both old (`ingredients`) and new (`ingredientDetails`) during migration.
- Write only new format (or dual-write briefly if required by backend).

7. Add guardrails
- Invalid/null ingredient rows should never crash UI.
- If parsing fails, preserve `raw` and use safe defaults.
- Log parse/migration fallbacks for visibility.

8. Backfill and cleanup
- Quietly migrate old recipes during load/save.
- Remove legacy `string[]` handling after migration coverage is high.

## Backward Compatibility (Existing Users)

1. Dual-read support during migration window
- Read both `ingredients: string[]` (legacy) and `ingredientDetails: IngredientDetail[]` (new).

2. Normalize immediately after read
- Convert legacy string ingredients to `IngredientDetail[]` before sending data into state/UI.

3. Single-write canonical strategy
- Write/save `ingredientDetails` as the primary format.
- Optionally dual-write derived `ingredients` temporarily for older app versions.

4. Schema version marker
- Store a lightweight `schemaVersion` on recipe records to identify migrated vs legacy data.

5. Lazy silent migration
- When a legacy recipe is opened/edited/saved, migrate and persist in the background.

6. Rollback-safe compatibility window
- Keep legacy parsing active until older app versions are no longer in active use.

7. Decommission legacy path only with evidence
- Remove `string[]` handling only after migration coverage and app-version usage metrics are safe.
