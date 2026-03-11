# Product Requirements Document: TypeScript Migration & Tech Stack Modernization

## Introduction/Overview

This document outlines the requirements for migrating the Buy Button JS application from JavaScript to TypeScript and modernizing the entire tech stack. The primary driver for the TypeScript migration is to enable a safe and confident future refactoring from the `shopify-buy` SDK to Shopify's Storefront API Client. The tech stack modernization ensures the executor works with modern, well-supported tools throughout the migration and eliminates severe technical debt in the build/test/lint toolchain.

**Important:** This migration will NOT add any dependencies on `@types/shopify-buy`. Instead, we will create our own type definitions for the shopify-buy SDK usage, using the community types only as a reference guide. This approach ensures we're not adding dependencies we plan to remove and gives us full control over the types as we prepare for the API client migration.

**Current version:** 3.0.6. This migration includes a **major version bump to 4.0.0** due to dropping IE 11 browser support (a breaking change for any consumer still targeting IE 11). The version bump is managed via [Changesets](https://github.com/changesets/changesets) (`pnpm changeset`) — do NOT edit `package.json` version directly.

### Status

- **Phases 1-2 (Infrastructure + Type Definitions):** Complete. PRs [#926](https://github.com/Shopify/buy-button-js/pull/926) and [#927](https://github.com/Shopify/buy-button-js/pull/927) merged.
- **Phase 3 (Tooling Modernization):** Not started.
- **Phase 4 (Source File Conversion):** Not started. 49 JS files remain in `src/`.
- **Phase 5 (Test File Conversion):** Not started. 30 test JS files remain.

### Known Issues from Phases 1-2

1. **Wrong test framework types:** Task 2.2 installed `@types/jest` but the project uses Mocha + Testem + Chai + Sinon. `@types/jest` creates conflicting global declarations (`describe`/`it`) with `@types/mocha`. This will be resolved by removing `@types/jest` entirely when Vitest is adopted (PR 7a), since Vitest provides its own types.

2. **Remaining `any` debt in type definitions:** Despite the claim that all `[key: string]: any` patterns were eliminated, `src/types/index.ts` still contains 11 instances of `Record<string, any>` (lines ~94, 113, 129, 146, 162, 185, 197, 491, 545, 571) plus a `Function` type (line ~492). These are scheduled for cleanup in PR 20.

3. **CSS class types defined as `string[]` but runtime uses `string`:** All 7 CSS class interfaces (`ProductClasses`, `CartClasses`, `ModalClasses`, `ProductSetClasses`, `ToggleClasses`, `OptionClasses`, `LineItemClasses`) define every property as `string[]`, but runtime defaults in `defaults/components.js` use plain `string` values (e.g., `wrapper: 'shopify-buy__product-wrapper'`). Fix in PR 10.

### Pre-Existing Bugs (discovered during review)

These are NOT introduced by the migration but should be fixed as Tier 1 improvements during the relevant file conversions:

1. **`destroyComponent` operator precedence bug** (`src/ui.js:99`): `!component.model.id === id` — the `!` operator binds tighter than `===`, so this evaluates as `(!component.model.id) === id`, which is always `false` when `id` is a number. The intended logic was `component.model.id !== id`. Fix during PR 19 (ui.js conversion).

2. **`postMessage` handler with no origin validation** (`src/ui.js:316`): The `_bindPostMessage` handler parses JSON from `msg.data` and calls `location.reload()` without checking `msg.origin`. Any cross-origin page could trigger a reload. Add origin validation during PR 19.

## Goals

1. **Enable Safe API Client Migration:** Provide full type safety to support the future migration from `shopify-buy` to Shopify's Storefront API Client with 100% confidence.
2. **Achieve Complete Type Safety:** Convert all JavaScript files to TypeScript with no `any` types or unsafe operations.
3. **Modernize the Toolchain:** Replace severely outdated build, test, lint, and package management tools with modern equivalents that natively support TypeScript and ESM.
4. **Reduce Bundle Size:** Eliminate ~30-50KB of polyfills and transforms by dropping legacy browser targets.
5. **Keep PRs Reviewable:** Structure the migration in PRs of ~500 lines or less for effective code review.
6. **Ensure Continuous Shippability:** Maintain a working application at every stage of the migration.

## User Stories

1. **As a developer**, I want to refactor from `shopify-buy` to Storefront API Client with confidence that type checking will catch all breaking changes, so that I can safely modernize the codebase.

2. **As a developer**, I want to work in a fully typed codebase with modern tooling (Vite, Vitest, ESLint 9), so that I can iterate quickly with fast builds and native TypeScript support.

3. **As a code reviewer**, I want to review small, focused PRs, so that I can provide thorough feedback without being overwhelmed.

4. **As a library user**, I want the migration to be transparent with no breaking changes beyond the documented browser support drop, so that my existing integrations continue to work without modification on modern browsers.

## Scope

### In Scope

- Full TypeScript conversion of all 49 `src/*.js` files and all 30 `test/*.js` files
- Package manager migration: Yarn v1 → pnpm
- Build system migration: Rollup 1 + Babel 7 + UglifyJS → Vite library mode
- Test framework migration: Mocha 6 + Testem 2 + Chai 4 + Sinon 7 + Browserify → Vitest + happy-dom
- Linting migration: ESLint 3.3.1 + eslint-plugin-shopify → ESLint 9 flat config + @typescript-eslint
- Browser target modernization: Drop IE 11, Safari 8, iOS 8, Android 4.4
- Dependency modernization: aws-sdk v2 → @aws-sdk/client-s3 v3 (for CDN deploy script)
- Dead dependency removal: webdriverio, misplaced runtime deps

### Out of Scope (Non-Goals)

1. **Test Coverage Improvements:** Adding new tests or increasing coverage.
2. **API Changes:** Any modifications to the public API surface (beyond the browser support drop).
3. **Documentation Updates:** Changes to README, API docs, or examples.
4. **Feature Development:** Any new functionality or bug fixes unrelated to the migration.
5. **shopify-buy SDK Migration:** The actual migration to Storefront API Client is a separate future project.

## Functional Requirements

### Phase 1: TypeScript Infrastructure Setup (COMPLETE)

1. The system must add TypeScript as a development dependency.
2. The system must create a `tsconfig.json` with strict mode enabled.
3. The system must configure the build system to handle both `.js` and `.ts` files during the migration period.
4. The system must add type checking to the CI pipeline as a non-blocking check initially.
5. The system must support importing JavaScript files from TypeScript files during migration.

### Phase 2: Type Definitions (COMPLETE)

6. The system must install `@types/*` packages for existing dependencies (excluding shopify-buy).
7. The system must reference `@types/shopify-buy` as a guide but NOT add it as a dependency.
8. The system must create custom type definitions for `shopify-buy` usage in `src/types/shopify-buy.d.ts`.
9. The system must define core interfaces and types in a dedicated `src/types/` directory.

**Note:** Task 2.2 incorrectly installed `@types/jest`. This will be removed when Vitest is adopted (PR 7a).

### Phase 3: Tooling Modernization (NEW — PRs 3-8)

10. The system must migrate the package manager from Yarn v1 to pnpm, updating all CI workflows and package.json scripts.
11. The system must drop legacy browser targets (IE 11, Safari 8, iOS 8, Android 4.4) and adopt rolling browserslist targeting modern browsers aligned with Shopify Online Store theme requirements. This is a **breaking change** requiring a major version bump to 4.0.0.
12. The system must migrate from ESLint 3.3.1 to ESLint 9 flat config with @typescript-eslint, enabling the following rules:
    - `@typescript-eslint/no-explicit-any` (error)
    - `@typescript-eslint/no-unsafe-assignment` (error)
    - `@typescript-eslint/no-unsafe-member-access` (error)
    - `@typescript-eslint/no-unsafe-call` (error)
    - `@typescript-eslint/no-unsafe-return` (error)
    - `@typescript-eslint/no-unsafe-argument` (error)
    - `@typescript-eslint/explicit-function-return-type` (warn — error after Phase 4)
    - `@typescript-eslint/strict-boolean-expressions` (warn)
    - `@typescript-eslint/no-floating-promises` (error)
    - `@typescript-eslint/no-misused-promises` (error)
    - `@typescript-eslint/await-thenable` (error)
    - `@typescript-eslint/no-unnecessary-type-assertion` (error)
    - Note: `no-unsafe-*` rules only apply to `.ts` files. During migration, `.js` files are excluded from TS-specific rules.
13. The system must migrate the build system from Rollup 1 + Babel 7 + UglifyJS to Vite library mode, producing UMD, ESM, and CJS outputs. Output bundles must be functionally equivalent to pre-Vite builds (same exports, same UMD global, similar size).
14. The system must migrate the test framework from Mocha + Testem + Browserify to Vitest + happy-dom, in two steps: runner swap (PR 7a) and Sinon → vi migration (PR 7b).
15. The system must modernize aws-sdk v2 to @aws-sdk/client-s3 v3 in the CDN deploy script (`script/deploy.js`), replacing `@shopify/js-uploader` entirely (incompatible with v3's API).
16. The system must remove dead dependencies (webdriverio, `@types/jest`) and move misplaced dependencies to devDependencies.

### Phase 4: TypeScript File Conversion (PRs 9-21)

17. The system must convert all 49 `src/*.js` files to TypeScript following a strict dependency-tier ordering (leaf utilities first, entry points last).
18. The system must convert the base `Template`, `View`, `Updater`, and `Component` classes before their derived classes.
19. The system must ensure all functions have explicit input and return types.
20. The system must fix the CSS class type mismatch: change types from `string[]` to `string` to match runtime defaults in `defaults/components.js`.
21. The system must use the `satisfies` operator for `defaults/components.js` to validate against `ComponentOptions` while preserving literal types.
22. The system must resolve all 11 `Record<string, any>` instances and the `Function` type in `src/types/index.ts`.
23. The system must handle `checkout.js` as a standalone redirect handler (it does NOT extend Component).
24. The system must handle the cross-tier dependency where `updaters/modal.js` imports `components/product.js` by converting modal updater after Product component.
25. The system must remove `allowJs` from tsconfig and make type-check blocking in CI as the final step.

### Phase 5: Test File Conversion (PRs 22-26)

26. The system must convert all 30 test JS files to TypeScript with proper type annotations.
27. The system must ensure tests continue to pass without modifying test logic.
28. The system must add type checking for test files in CI.
29. The system must remove all remaining JS allowances in the final PR.

## Design Considerations

### Migration Strategy

- Use a strict dependency-tier ordering: convert leaf nodes first, entry points last
- Maintain a working application at every commit
- Group related files in single PRs when they're tightly coupled
- Modernize tooling BEFORE file conversion so the executor benefits from modern tools throughout

### Type Safety Guidelines

- Enable TypeScript strict mode from the start
- Use explicit types rather than relying on inference for public APIs
- Define shared types in centralized location (`src/types/`)
- Prefer interfaces over type aliases for object shapes
- Use `satisfies` operator for config objects to preserve literal types
- Use const assertions for literal types where appropriate
- CSS class properties are `string` (not `string[]`) — matches runtime defaults. All 7 interfaces affected: `ProductClasses`, `CartClasses`, `ModalClasses`, `ProductSetClasses`, `ToggleClasses`, `OptionClasses`, `LineItemClasses`
- Use `satisfies` operator not just for `defaults/components.js` but also for any other config/defaults objects that benefit from type validation while preserving literal types

### Dependency Tier Ordering

All 49 source files are categorized by dependency depth. Each tier must be converted before the next:

| Tier | Category | File Count |
|------|----------|------------|
| 0 | Pure leaf utilities + template.js | 13 |
| 1 | Utilities with internal deps (money, log-not-found, throttle) | 3 |
| 2 | Templates + styles + defaults | 12 |
| 3 | Base classes with internal deps (updater.js, iframe.js) | 2 |
| 4 | Core base classes (view.js, component.js) | 2 |
| 5 | Derived views (5 files) | 5 |
| 6 | Derived updaters, excluding modal (3 files) | 3 |
| 7 | Components + modal updater (7 files) | 7 |
| 8 | Entry points (ui.js, buybutton.js) | 2 |

**Cross-tier dependency note:** `updaters/modal.js` imports `components/product.js`, violating the normal tier ordering. This is handled by moving modal updater to PR 17 (with Cart/Modal components), after Product component is converted in PR 16.

### Special Cases

- **`src/components/checkout.js`**: Does NOT extend `Component` — it's a standalone redirect handler. Convert normally but do not assume component base class patterns.
- **`src/template.js`**: Base Template class (distinct from `src/templates/` directory of template strings). Only imports external `mustache`.
- **`src/styles/host/host.js`**: Single-line string export (2,826 bytes) containing ~135 lines of CSS when formatted (modals, carts, toggles, product frames) — substantive, not trivial.
- **`src/styles/embeds/conditional.js`** (189 bytes) and **`src/styles/host/conditional.js`** (129 bytes): Single-line string exports. Small but contain real CSS rules. Not dead code — convert all normally.
- **`src/defaults/components.js`**: 336 lines, the largest config file. Use `satisfies ComponentOptions` for type-safe validation while preserving literal types.

## Technical Considerations

### Tech Stack Modernization Decisions

| Area | Current | Target | Rationale |
|------|---------|--------|-----------|
| Package manager | Yarn v1 (1.x) | pnpm | Faster, stricter dependency resolution, better monorepo support, actively maintained |
| Browser targets | IE 11, Safari 8, iOS 8, Android 4.4 | Rolling modern targets | Eliminates 16 Babel transform plugins + all polyfills (~30-50KB bundle savings). Major version bump required. |
| Build system | Rollup 1.18.0 + Babel 7.5 + UglifyJS | Vite library mode | Native TS support, ESM-first, tree-shaking, faster builds. UglifyJS can't parse ES2015+ (blocks IE 11 drop). |
| Test framework | Mocha 6.2 + Testem 2.17 + Chai 4.2 + Sinon 7.4 + Browserify | Vitest + happy-dom | Native TS support, ESM-first, fast, built-in coverage, compatible assertion API. Eliminates Browserify test pipeline. |
| Linting | ESLint 3.3.1 + eslint-plugin-shopify | ESLint 9 flat config + @typescript-eslint | Modern TS rules, enforces `no-explicit-any`, replaces unmaintained Shopify plugin |
| AWS SDK | aws-sdk v2 (2.6.8, ~80MB) | @aws-sdk/client-s3 v3 (~3MB) | Modular, actively maintained, v2 is in maintenance mode |

### Browser Target Changes

**New browserslist config** (aligned with Shopify Online Store theme requirements, Safari/iOS extended to "last 3" for emerging market coverage):

```json
"browserslist": [
  "last 3 Chrome versions",
  "last 3 Firefox versions",
  "last 3 Safari versions",
  "last 2 Edge versions",
  "last 3 ChromeAndroid versions",
  "last 3 iOS versions",
  "last 2 Samsung versions",
  "not dead"
]
```

**Rationale:** Buy-button-js is embedded on merchant storefronts — the same browser environment as the theme itself. If the theme works, the buy button must work. Auto-advancing rolling targets mean zero maintenance.

Dropping legacy browsers enables:
1. Remove 16 Babel transform plugins (all target ES5 output)
2. Replace UglifyJS with terser as interim minifier (UglifyJS can't parse ES2015+ — blocking the Vite migration). Terser is removed once Vite handles minification.
3. Remove 7 polyfill imports from `buybutton.js` (`whatwg-fetch` + 6 `core-js` modules)
4. Native ES2015+ output — classes, arrow functions, template literals, destructuring
5. ~30-50KB bundle size reduction from eliminated polyfills and transforms

### CDN Deploy Script

`aws-sdk` IS actively used for CDN deployment and CANNOT be removed:

- `script/deploy.js` imports `aws-sdk` and `@shopify/js-uploader` to upload built files to S3
- AWS credentials stored in encrypted `config.ejson`
- CDN deployment is a separate manual Shipit step (not part of GitHub Actions CI)
- **Resolution:** Modernize `aws-sdk` v2 → `@aws-sdk/client-s3` v3. Replace `@shopify/js-uploader` entirely — it uses v2's `s3.putObject({...}).promise()` API which is incompatible with v3's `send(new PutObjectCommand({...}))`. The uploader's actual upload logic is ~20 lines; inline the S3 calls directly in `script/deploy.js`.

### Build Configuration (Post-Vite)

- Vite library mode: UMD (`ShopifyBuy` global) + ESM + CJS outputs
- `"module"` and `"exports"` fields added to package.json
- **Sass pipeline**: The Sass compilation for embed/host styles (`script/embed-styles` and `script/host-styles`) is independent of the JS build pipeline. It survives the Vite migration as-is (uses the `sass` and `postcss` packages directly). Evaluate whether Vite's CSS handling can replace these scripts; if not, keep them.
- **Bundle equivalence gate** after Vite migration (PR 6): Before the PR is merged, verify:
  1. UMD bundle exposes the same `window.ShopifyBuy` global with identical public API surface
  2. ESM bundle exports match: `ShopifyBuy` default export, `buildClient` named export
  3. UMD bundle size is within ±15% of pre-Vite build (account for minifier differences; terser vs UglifyJS may produce slightly different output)
  4. Load UMD bundle in a `<script>` tag and verify `window.ShopifyBuy.buildClient()` is callable

### CI/CD Pipeline

- CI workflows affected: `ci.yml`, `npm-release.yml`, `snapit.yml` (not `cla.yml` — it's GitHub-managed)
- `pnpm run type-check` (`tsc --noEmit`) becomes blocking once migration is complete
- `pnpm run lint` enforces TypeScript rules via ESLint 9 + @typescript-eslint

### Dependencies (Post-Migration)

- **Runtime:** morphdom, mustache, shopify-buy (unchanged)
- **Dev:** pnpm, TypeScript 5.x, Vite, Vitest, happy-dom, ESLint 9, @typescript-eslint, @changesets/cli
- **Deploy:** @aws-sdk/client-s3 v3
- **Removed:** Yarn v1, Rollup 1, all Babel transform plugins, UglifyJS, Mocha, Testem, Chai, Sinon, Browserify, Babelify, Watchify, webdriverio, eslint-plugin-shopify, aws-sdk v2, @shopify/js-uploader, @types/jest, core-js, whatwg-fetch

### Shopify-Buy Types Strategy

- **Reference only:** Review `@types/shopify-buy` from npm as a reference guide
- **Do NOT install** `@types/shopify-buy` as a dependency
- Custom type definitions in `src/types/shopify-buy.d.ts` based on actual usage patterns
- This approach ensures no dependency on shopify-buy types when migrating to Storefront API Client

## Known `any` Debt in src/types/index.ts

The following `Record<string, any>` and unsafe type patterns remain from Phase 2 and must be resolved in PR 20:

| Location | Pattern | Notes |
|----------|---------|-------|
| ~line 94 | `styles?: Record<string, any>` | ComponentConfig property |
| ~line 113 | `styles?: Record<string, any>` | ComponentConfig property |
| ~line 129 | `styles?: Record<string, any>` | ComponentConfig property |
| ~line 146 | `styles?: Record<string, any>` | ComponentConfig property |
| ~line 162 | `styles?: Record<string, any>` | ComponentConfig property |
| ~line 185 | `styles?: Record<string, any>` | ComponentConfig property |
| ~line 197 | `styles?: Record<string, any>` | ComponentConfig property |
| ~line 491 | `eventProperties?: Record<string, any>` | Event handler type |
| ~line 492 | `fn: Function` + `Record<string, any>` | Line contains both patterns: `trackMethod(fn: Function, event: string, properties?: Record<string, any>): Function` |
| ~line 545 | `options: Record<string, any>` | ComponentInstance.options |
| ~line 571 | `config: Record<string, any>` | UpdaterInstance.updateConfig |

**Total: 11 instances.** The executor should also grep for `any` in `src/types/` at the start of PR 20 to catch any additional instances.

## Smoke Test Milestones

These are key checkpoints where the executor should perform manual verification beyond automated tests:

1. **After PR 3 (pnpm migration):** `pnpm install` resolves cleanly, `pnpm test` passes, CI workflow runs successfully
2. **After PR 4 (browser targets):** Bundle builds without UglifyJS errors, no polyfill references in output
3. **After PR 6 (Vite migration):** Bundle equivalence gate passes (see Build Configuration above). Load the UMD bundle in a browser and verify `window.ShopifyBuy.buildClient()` works
4. **After PR 7a (Vitest swap):** All 29 unit tests pass under Vitest, no test logic changes required
5. **After PR 9 (first TS conversion batch):** Converted files produce correct output, imports from remaining JS files still work
6. **After PR 19 (entry points converted):** Full build from TS entry point, all exports intact
7. **After PR 21 (allowJs removed):** `tsc --noEmit` passes with no JS allowances

## Success Metrics

1. **100% TypeScript Coverage:** All `.js` files in `src/` and `test/` converted to `.ts`
2. **Zero `any` Types:** No explicit or implicit `any` types in the codebase
3. **Zero Type Errors:** All files pass strict TypeScript checking
4. **Maintained Test Coverage:** All existing tests continue to pass
5. **Modern Toolchain:** pnpm, Vite, Vitest, ESLint 9 all operational
6. **Bundle Equivalence:** Post-Vite bundles functionally equivalent to pre-Vite (same `window.ShopifyBuy` global, same public API surface, UMD size within ±15%)
7. **Reduced Bundle Size:** ~30-50KB reduction from polyfill/transform elimination
8. **No Breaking Changes Beyond Browser Support:** Public API remains identical; only breaking change is IE 11 drop

## Migration Phases Summary

| Phase | Description | PRs | Status |
|-------|-------------|-----|--------|
| 1 | TypeScript Infrastructure Setup | 1 (PR 1) | Complete |
| 2 | Type Definitions | 1 (PR 2) | Complete |
| 3 | Tooling Modernization | 7 (PRs 3-8, with 7 split into 7a/7b) | Not started |
| 4 | TypeScript File Conversion | 13 (PRs 9-21) | Not started |
| 5 | Test File Conversion | 6 (PRs 22-26, with 25 split into 25a/25b) | Not started |

**Total: ~28 PRs** (2 complete + ~26 remaining)

## Open Questions

1. ~~Should we create custom type definitions for the `shopify-buy` SDK or wait for official types?~~ **Resolved:** Create custom type definitions, using `@types/shopify-buy` only as a reference guide without adding it as a dependency.
2. ~~Should we modernize the build/test/lint toolchain?~~ **Resolved:** Yes, as a new Phase 3 before file conversion.
3. Should we add a type coverage tool (like `type-coverage`) to track progress?
4. Should we consider adding JSDoc comments for public APIs as we migrate?
