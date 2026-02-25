# Security & Stability Audit

Date: February 25, 2026

## Scope
Checked for:
- API keys in frontend
- Unsafe storage
- Insecure HTTP usage
- Missing error handling
- Unhandled promise rejections
- Excessive logging

Assumption: app will scale to thousands of users.

## Findings (Ordered by Severity)

### Critical

1. Environment key is present in frontend and tracked in git
- `.env:1` contains `EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=...`
- `app/_layout.tsx:50-52` injects `process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY` into runtime.
- `git ls-files .env` shows `.env` is tracked.
- Why it matters: even if RevenueCat SDK key is intended as client-side, committing live keys trains unsafe key hygiene and can leak other sensitive env values over time.
- Fix:
  - Remove `.env` from git history and rotate exposed key.
  - Add `.env` to `.gitignore` (currently only `.env*.local` is ignored at `.gitignore:36-38`).
  - Use `.env.example` for non-secret placeholders.

### High

2. Sensitive-ish app state stored unencrypted in AsyncStorage
- `stores/useRecipeStore.ts:44-110` persists `recipes`, `isPro`, `purchaseDate`, `customerInfo` via AsyncStorage.
- Why it matters: AsyncStorage is not encrypted-at-rest; rooted/jailbroken/device-backup access can expose or tamper with data.
- Fix:
  - Store only minimal entitlement flags needed for UX caching.
  - Move sensitive purchase/account identifiers to secure storage (`expo-secure-store`) or avoid persisting them.
  - Add integrity checks/schema validation on hydration.

3. Missing request hardening for external API calls
- `app/add/AddFromURL.tsx:35-37` uses bare `fetch(...)` with no timeout/retry/backoff.
- Why it matters at scale: hanging requests and transient failures degrade reliability and increase duplicate retries/user frustration.
- Fix:
  - Add `AbortController` timeout.
  - Add retry policy for transient 5xx/network errors.
  - Centralize API client error mapping.

4. Unhandled promise risk in store-review fallback links
- `app/menu/index.tsx:90-101` fallback calls `Linking.openURL(...)` without `await`/`catch`.
- Why it matters: if fallback URL open fails, promise rejection can be unhandled and noisy/crashy depending on runtime handlers.
- Fix:
  - `await` fallback `Linking.openURL(...)` inside nested `try/catch`.

### Medium

5. Excessive console logging in production paths
- Heavy logs in startup and store/util flows:
  - `app/_layout.tsx:19,24,85,95,104,119,123,133,143`
  - `app/add/AddFromURL.tsx:21,117,149`
  - `stores/downloadAndStoreImage.ts:5,11,15,19`
- Why it matters: log noise can leak internal state/URLs, increase debugging surface area, and impact runtime overhead.
- Fix:
  - Introduce log wrapper with level control (`__DEV__` gating + production redaction).
  - Avoid logging raw error objects that may include URLs/request metadata.

6. Error handling is mostly alert-based and not structured
- Example paths rely on `Alert.alert(...)` + `console.*` with limited recovery context:
  - `app/add/AddFromURL.tsx:39-43,116-121`
  - `app/menu/index.tsx:104-115`
- Why it matters: difficult incident triage at scale; weak observability and inconsistent UX.
- Fix:
  - Add typed domain errors and centralized reporter.
  - Preserve failure reason in UI state for retry and support diagnostics.

7. RevenueCat error typing is weak (`any`)
- `app/menu/index.tsx:54`, `components/AddRecipeDrawer.tsx:172`, `components/QuickTourModal.tsx:98`, `utils/revenueCat.ts:19`
- Why it matters: unsafe assumptions around `userCancelled` and message shape can mis-handle edge cases.
- Fix:
  - Replace `any` with typed error narrowing.

### Low

8. Insecure HTTP transport not detected
- Search found no `http://` endpoints in app code.
- Current network URLs are HTTPS (`app/add/AddFromURL.tsx:36`, `app/menu/index.tsx:94,98,121,124,255,259`).
- Note: `market://` and `itms-apps://` are platform store deep-link schemes, not HTTP transport.

## Stability Gaps To Address Early (for thousands of users)

1. Add global async safety net
- Configure global error boundary + unhandled rejection handler and forward to crash reporting.

2. Harden persisted store lifecycle
- Add versioned migrations + validation for `recipe-storage` to avoid crashes from malformed stale payloads.

3. Centralize network layer
- Shared client for timeout, retries, consistent errors, and telemetry.

## Priority Remediation Plan

1. Rotate/remove committed `.env` secrets and enforce env-file hygiene.
2. Minimize/secure persisted purchase data (AsyncStorage -> secure/minimal model).
3. Add fetch timeout/retry/error mapping for recipe import endpoint.
4. Fix unhandled promise path in `openStoreReview` fallback links.
5. Replace ad-hoc logging with structured, redacted, environment-gated logs.
6. Add crash/error telemetry and typed error handling.

## Bottom Line
Biggest immediate risk is key hygiene (`.env` committed) plus unencrypted persistence of purchase-related state. Reliability at scale will be limited by bare fetch/error handling and unstructured async/logging patterns unless centralized soon.
