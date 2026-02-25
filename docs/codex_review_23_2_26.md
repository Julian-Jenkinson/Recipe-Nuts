**Findings (Ordered by Severity)**

### Critical
1. **Backend/API architecture is not present in this repo, so a “full SaaS API” review is blocked.**  
   Evidence: `README.md` mentions a “Custom built REST Recipe Extractor API”, but server code/config is absent; client calls external API directly in `app/add/AddFromURL.tsx:36`.

2. **Business limits are enforced client-side and can be bypassed.**  
   Free-tier cap (`>=10`) is only checked in UI: `app/add/AddFromURL.tsx:128`, `components/AddRecipeDrawer.tsx:24`.  
   Pro entitlement is also trusted client-side in persisted state: `stores/useRecipeStore.ts:80`, `stores/useRecipeStore.ts:108`.

### High
3. **API call has no auth, timeout, retry, or backoff strategy.**  
   Single `fetch` with no resilience: `app/add/AddFromURL.tsx:35`.  
   At 100k users this risks cascading failures and poor UX under partial outages.

4. **Observability is production-unsafe and fragmented.**  
   Many `console.log/warn/error` in app lifecycle and purchase flows (example: `app/_layout.tsx:24`, `stores/downloadAndStoreImage.ts:5`), no centralized logger, no correlation IDs, no telemetry sink.

5. **No automated tests for app/domain logic.**  
   No tests found under `app`, `components`, `stores`, `utils`. This is high risk for regressions.

6. **Code duplication in core revenue and image flows increases drift risk.**  
   Purchase flow duplicated in `app/menu/index.tsx:41`, `components/AddRecipeDrawer.tsx:159`, `components/QuickTourModal.tsx:85`.  
   Duplicate image downloader in `utils/downloadAndStoreImage.ts:3` and `stores/downloadAndStoreImage.ts:3`.

### Medium
7. **Hardcoded runtime endpoints and placeholders reduce deploy safety.**  
   API URL hardcoded: `app/add/AddFromURL.tsx:36`.  
   Placeholder IDs remain: `app/menu/index.tsx:80`, `app/menu/index.tsx:124`.

8. **Type safety weakened in several hot paths.**  
   `any` usage in purchasing/network handling: `utils/revenueCat.ts:19`, `app/add/AddFromURL.tsx:116`, `app/menu/index.tsx:54`.  
   `allowJs: true` also relaxes TS guardrails: `tsconfig.json`.

9. **Dependency/version reproducibility risk.**  
   `@react-native-community/cli` pinned to `"latest"` in `package.json` can cause non-deterministic builds.

10. **Separation of concerns is mixed.**  
   UI components contain orchestration/business logic (network, purchase, storage decisions), e.g. `app/add/AddFromURL.tsx`, `app/menu/index.tsx`, `components/QuickTourModal.tsx`.

### Low
11. **Naming consistency drift and route conventions are mixed.**  
   Mixed casing and semantics (`AddBlankRecipe`, `AddFromURL`, `EditRecipe`, `source` displayed as “Author” in `components/RecipeForm.tsx:252`).

---

**Category Assessment (for 100k users)**

- **Folder structure:** Functional but flat; lacks domain/service layering for API-scale complexity.  
- **Separation of concerns:** Weak; business logic embedded in screens/components.  
- **Error handling:** Basic `try/catch + Alert`; no typed/domain errors or retry policies.  
- **Logging:** Ad hoc console logging; no structured logging/monitoring pipeline.  
- **Scalability:** Current repo is client-centric; no backend architecture shown for 100k scale.  
- **Performance:** Local filtering/sorting is fine for small datasets, but no pagination/indexed storage strategy.  
- **Security risks:** Client-only entitlement gating; unauthenticated extractor call pattern; potential abuse surface.  
- **Maintainability:** Duplication + missing tests + placeholders increases long-term cost.  
- **Naming consistency:** Inconsistent naming and path conventions.

---

**What to do next (highest impact)**
1. Split a backend repo/module and define API architecture (auth, rate limits, queues, storage, observability, SLOs).  
2. Move entitlement and free-tier enforcement server-side.  
3. Introduce an API client layer with timeout/retry/circuit breaker and typed responses.  
4. Consolidate duplicated purchase/image logic into shared services.  
5. Add test baseline (unit for store/services + integration for import flow).