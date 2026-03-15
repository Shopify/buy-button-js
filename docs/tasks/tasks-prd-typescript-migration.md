# Task List: TypeScript Migration & Tech Stack Modernization

## Overview

This migration is structured across ~28 PRs in 5 phases. Phases 1-2 are complete. This task list covers the remaining ~26 PRs (Phases 3-5).

**Exit criteria for every PR:** `pnpm test` passes, `pnpm run build` produces correct bundles, `pnpm run type-check` passes, `pnpm run lint` passes.

**Note on package manager commands:** All commands in this document use `pnpm`, which is the active package manager since PR 3.

## Source File Inventory (49 files)

All JS files in `src/` categorized by dependency tier:

### Tier 0 — Pure Leaf Utilities + Template Base (13 files)

These files have no internal dependencies (only external or none).

| File | Lines | Notes |
|------|-------|-------|
| `src/utils/is-function.js` | ~5 | Type guard utility |
| `src/utils/window-utils.js` | ~10 | Window/document detection |
| `src/utils/element-class.js` | ~15 | DOM class manipulation |
| `src/utils/logger.js` | ~15 | Console logging wrapper |
| `src/utils/frame-utils.js` | ~30 | iframe/frame helpers |
| `src/utils/focus.js` | ~90 | Focus trap management |
| `src/utils/detect-features.js` | ~25 | Browser feature detection |
| `src/utils/merge.js` | ~60 | Deep object merge |
| `src/utils/normalize-config.js` | ~50 | Config normalization |
| `src/defaults/money-format.js` | ~10 | Default money format string |
| `src/utils/unit-price.js` | ~25 | Unit price calculation |
| `src/utils/track.js` | ~75 | Analytics tracking |
| `src/template.js` | ~27 | Base Template class (only imports external `mustache`) |

### Tier 1 — Utilities with Internal Dependencies (3 files)

| File | Lines | Depends On |
|------|-------|------------|
| `src/utils/money.js` | ~60 | money-format (Tier 0) |
| `src/utils/log-not-found.js` | ~10 | logger (Tier 0) |
| `src/utils/throttle.js` | ~15 | frame-utils (Tier 0) |

### Tier 2 — Templates + Styles + Defaults (12 files)

| File | Lines | Notes |
|------|-------|-------|
| `src/templates/product.js` | ~130 | Mustache template string |
| `src/templates/cart.js` | ~150 | Mustache template string |
| `src/templates/modal.js` | ~20 | Mustache template string |
| `src/templates/option.js` | ~15 | Mustache template string |
| `src/templates/line-item.js` | ~50 | Mustache template string |
| `src/templates/toggle.js` | ~30 | Mustache template string |
| `src/templates/styles.js` | ~10 | Style template string |
| `src/styles/embeds/all.js` | ~20 | CSS-in-JS embed styles |
| `src/styles/embeds/conditional.js` | 1 (189 bytes) | Single-line string export of conditional embed CSS rules |
| `src/styles/host/host.js` | 1 (2,826 bytes) | Single-line string export containing **~135 lines of CSS** when formatted (modals, carts, toggles, frames) |
| `src/styles/host/conditional.js` | 1 (129 bytes) | Single-line string export of conditional host CSS rules |
| `src/defaults/components.js` | ~336 | **Largest config file.** Imports templates. Use `satisfies` operator. |

### Tier 3 — Base Classes with Internal Dependencies (2 files)

| File | Lines | Depends On |
|------|-------|------------|
| `src/updater.js` | ~80 | merge, template |
| `src/iframe.js` | ~200 | templates/styles, element-class |

### Tier 4 — Core Base Classes (2 files)

| File | Lines | Depends On |
|------|-------|------------|
| `src/view.js` | ~300 | template, iframe, styles, element-class, focus |
| `src/component.js` | ~400 | merge, is-function, defaults, log-not-found, logger, money-format, view, updater |

### Tier 5 — Derived Views (5 files)

| File | Lines | Depends On |
|------|-------|------------|
| `src/views/product.js` | ~150 | view |
| `src/views/cart.js` | ~200 | view |
| `src/views/modal.js` | ~80 | view |
| `src/views/toggle.js` | ~50 | view |
| `src/views/product-set.js` | ~50 | view |

### Tier 6 — Derived Updaters (excluding modal) (3 files)

| File | Lines | Depends On |
|------|-------|------------|
| `src/updaters/product.js` | ~100 | updater |
| `src/updaters/cart.js` | ~80 | updater |
| `src/updaters/product-set.js` | ~40 | updater |

### Tier 7 — Components + Modal Updater (7 files)

| File | Lines | Depends On | Notes |
|------|-------|------------|-------|
| `src/components/checkout.js` | ~60 | (standalone) | Does NOT extend Component — standalone redirect handler |
| `src/components/toggle.js` | ~100 | component, views/toggle | |
| `src/components/product.js` | ~861 | component, views/product, updaters/product | **Largest source file** |
| `src/updaters/modal.js` | ~40 | updater, **components/product** | Cross-tier dep — must convert after Product |
| `src/components/cart.js` | ~400 | component, toggle, checkout, views/cart, updaters/cart | |
| `src/components/modal.js` | ~200 | component, product, views/modal, **updaters/modal** | |
| `src/components/product-set.js` | ~150 | component, product, views/product-set, updaters/product-set | |

### Tier 8 — Entry Points (2 files)

| File | Lines | Depends On |
|------|-------|------------|
| `src/ui.js` | ~200 | all components, track, styles, throttle, detect-features |
| `src/buybutton.js` | ~30 | ui, templates/product |

**Total: 49 files**

## Test File Inventory (30 files)

| File | Lines | Tests For | Assigned PR |
|------|-------|-----------|-------------|
| test/fixtures/product-fixture.js | 153 | Shared fixture | 22 |
| test/fixtures/shop-info.js | 11 | Shared fixture | 22 |
| test/test.js | 35 | Entry point | 22 |
| test/unit/merge.js | 122 | src/utils/merge.js | 23 |
| test/unit/money.js | 38 | src/utils/money.js | 23 |
| test/unit/normalize-config.js | 64 | src/utils/normalize-config.js | 23 |
| test/unit/detect-features.js | 63 | src/utils/detect-features.js | 23 |
| test/unit/unit-price.js | 23 | src/utils/unit-price.js | 23 |
| test/unit/focus.js | 191 | src/utils/focus.js | 23 |
| test/unit/template.js | 63 | src/template.js | 23 |
| test/unit/updater.js | 67 | src/updater.js | 23 |
| test/unit/checkout.js | 55 | src/components/checkout.js | 23 |
| test/unit/tracker.js | 106 | src/utils/track.js | 23 |
| test/unit/component.js | 459 | src/component.js | 24 |
| test/unit/view.js | 930 | src/view.js | 24 |
| test/unit/iframe.js | 523 | src/iframe.js | 24 |
| test/unit/ui.js | 1016 | src/ui.js | 24 |
| test/unit/buybutton.js | 64 | src/buybutton.js | 24 |
| test/unit/product/product-component.js | 2568 | src/components/product.js | 25a |
| test/unit/product/product-updater.js | 256 | src/updaters/product.js | 25a |
| test/unit/product/product-view.js | 271 | src/views/product.js | 25a |
| test/unit/cart/cart.js | 1633 | src/components/cart.js | 25b |
| test/unit/cart/cart-view.js | 277 | src/views/cart.js | 25b |
| test/unit/modal/modal-component.js | 250 | src/components/modal.js | 25b |
| test/unit/modal/modal-updater.js | 52 | src/updaters/modal.js | 25b |
| test/unit/modal/modal-view.js | 304 | src/views/modal.js | 25b |
| test/unit/toggle/toggle-component.js | 149 | src/components/toggle.js | 25b |
| test/unit/toggle/toggle-view.js | 288 | src/views/toggle.js | 25b |
| test/unit/product-set.js | 453 | src/components/product-set.js | 25b |
| test/build/test.js | 72,678 | **Generated Browserify bundle** (NOT hand-written — created by `pretest` script) | 22 (likely remove — Vite replaces Browserify) |

**Total: 30 test files (~10,500 lines)**

## Version Control with Graphite

Use Graphite (gt) commands for managing stacked branches:

### Key Commands
- **Create branch:** `gt create <branch-name>` with NO unstaged changes
- **Stage files:** `gt add <file1> <file2>` (never use `.` or `--all`)
- **Commit changes:** `gt modify --message "commit message"`
- **Submit PR:** `gt submit` for single PR or `gt submit --stack` for stack
- **Navigate stack:** `gt up` and `gt down` to move between branches
- **Rebase stack:** `gt get` to pull latest and rebase (never use `gt sync`)
- **Check status:** `gt log` or `gt ls` to view stack structure

### Workflow
1. Create branch FIRST: `gt create typescript-migration-part-3`
2. Make changes for the task
3. Stage specific files: `gt add tsconfig.json package.json`
4. Commit: `gt modify --message "feat: add TypeScript infrastructure"`
5. Submit: `gt submit`
6. Next PR: `gt create typescript-migration-part-4`

## Completed Tasks

- [x] 0. Initial Setup
  - [x] 0.1. Create feature branch using `gt create typescript-migration-part-1`

- [x] 1. TypeScript Infrastructure Setup (PR 1) — [PR #926](https://github.com/Shopify/buy-button-js/pull/926)
  - [x] 1.1. Install TypeScript, create tsconfig.json, configure Rollup, add type-check script, add CI check

- [x] 2. Type Definitions Setup (PR 2) — [PR #927](https://github.com/Shopify/buy-button-js/pull/927)
  - [x] 2.1. Install @types packages, create src/types/ directory, create custom shopify-buy types, create core interfaces
  - **Known issue:** `@types/jest` was incorrectly installed (project uses Mocha, not Jest). Will be removed in PR 7a when Vitest is adopted.
  - **Known issue:** 11 `Record<string, any>` instances and 1 `Function` type remain in `src/types/index.ts`. Scheduled for cleanup in PR 20.

---

## Phase 3: Tooling Modernization (PRs 3-8)

### Ordering Rationale

1. **pnpm first** — package manager swap is independent of everything else
2. **Browser targets second** — removes Babel transforms, which must happen before UglifyJS removal
3. **ESLint third** — independent of build/test, benefits from TS support
4. **Vite fourth** — replaces Rollup + Babel build pipeline (depends on browser targets removing UglifyJS)
5. **Vitest fifth** (split into 7a + 7b) — replaces Mocha + Testem + Browserify test pipeline (depends on Vite)
6. **Dep cleanup last** — aws-sdk v3 + dead dep removal (independent but logically last)

---

- [x] 3. Migrate Yarn v1 → pnpm (PR 3) — [PR #942](https://github.com/Shopify/buy-button-js/pull/942)

  - [x] 3.1. Create new branch using `gt create typescript-migration-part-3`

  - [x] 3.2. Install pnpm and initialize `pnpm-lock.yaml`; delete `yarn.lock`

  - [x] 3.3. Update `package.json` scripts: replace all `yarn run` with `pnpm run`, replace `yarn` with `pnpm`. Fix `pretest` script which uses `npm run` → `pnpm run`

  - [x] 3.4. Update `.github/workflows/ci.yml`: replace `npm install`/`npm run`/`npm test` with pnpm equivalents. Add pnpm setup step.

  - [x] 3.5. ~~Update `.github/workflows/npm-release.yml`~~ — Superseded: npm-release.yml was rewritten for the changesets release PR pattern.

  - [x] 3.6. Update `.github/workflows/snapit.yml`: same pattern — replace yarn/npm with pnpm equivalents. Add pnpm setup step.

  - [x] 3.7. Verify: `pnpm test` passes, `pnpm run build` produces correct output, `pnpm run type-check` passes

  - [x] 3.8. **[PR BOUNDARY]** Submit PR 3 using `gt submit`

- [x] 4. Drop IE 11 + Modernize Browser Targets — MAJOR VERSION BUMP (PR 4) — PR 4a: [PR #945](https://github.com/Shopify/buy-button-js/pull/945), PR 4b: [PR #946](https://github.com/Shopify/buy-button-js/pull/946)

  - [x] 4.1. Create new branch using `gt create typescript-migration-part-4`

  - [x] 4.2. Update `package.json` and create changeset:
    - Create a major changeset via `pnpm changeset` (select `major` bump) with description: "Drop IE 11, Safari 8, iOS 8, Android 4.4 browser support. Minimum browser targets are now rolling modern versions aligned with Shopify Online Store themes." Do NOT edit `version` in package.json directly — changesets manages this.
    - Replace `browserslist` with modern rolling targets (union of `@shopify/browserslist-config` + Theme Store requirements)

  - [x] 4.3. Update `.babelrc`: remove 15 ES5 transform plugins; retain `@babel/plugin-transform-modules-commonjs` in development env for Browserify test pipeline (removed in PR 7a)

  - [x] 4.4. Remove polyfill imports from `src/buybutton.js` (7 imports: `whatwg-fetch` + 6 `core-js` modules)

  - [x] 4.5. Remove polyfill dependencies from `package.json`: `core-js`, `whatwg-fetch`

  - [x] 4.6. Replace UglifyJS with terser in `script/build.js`: Install `terser` as devDep, replace `uglify-js` calls with terser equivalents. Terser supports ES2015+ syntax (unlike UglifyJS) and serves as the interim minifier until Vite replaces the build pipeline in PR 6.

  - [x] 4.7. Remove UglifyJS from dependencies: `uglify-js`

  - [x] 4.8. CHANGELOG breaking change is documented via major changeset (automatic CHANGELOG generation enabled in PR 4a)

  - [x] 4.9. Verify: `pnpm test` passes, `pnpm run build` produces correct output, `pnpm run type-check` passes

  - [x] 4.10. **[PR BOUNDARY]** Submit PR 4 using `gt submit`

- [x] 5. ESLint 3.3.1 → ESLint 9 Flat Config + @typescript-eslint (PR 5) — [PR #950](https://github.com/Shopify/buy-button-js/pull/950)

  - [x] 5.1. Create new branch using `gt create typescript-migration-part-5`

  - [x] 5.2. Remove `eslint` 3.3.1 and `eslint-plugin-shopify` 13.0 from devDependencies

  - [x] 5.3. Install `eslint` 9.x, `typescript-eslint` v8 (unified package), `@eslint/js` 9.x, and `globals`

  - [x] 5.4. Create `eslint.config.mjs` (flat config format) with TypeScript rules, JS/TS file scoping, and `src/types/` override for known `any`/`Function` debt. See `eslint.config.mjs` for the authoritative rule list.

  - [x] 5.5. Delete `.eslintrc`, `test/.eslintrc`, and `.eslintignore`

  - [x] 5.6. Update `package.json`: lint script (remove `-c .eslintrc`, use `src/` for recursive linting), test script (remove redundant `pnpm run lint` — CI runs lint separately)

  - [x] 5.7. Fix lint errors in newly-linted files: `hasOwnProperty` → `Object.hasOwn()`, removed unused `isObject` function, removed unused `element` param, underscore-prefixed unused `err` binding, cleaned up stale eslint-disable directives

  - [x] 5.8. Verify: `pnpm run lint` passes (0 errors, 0 warnings), `pnpm run testem` passes (794/794), `pnpm run type-check` passes, `pnpm run build` passes

  - [x] 5.9. **[PR BOUNDARY]** Submit PR 5 using `gt submit`

- [ ] 6. Rollup 1 + Babel → Vite Library Mode (PR 6)

  > **Deferred from PR 4b review:**
  > - **Update `caniuse-lite`** before this PR. The current version (1.0.30000989, circa 2019) resolves `"last 3 Chrome versions"` to Chrome 73-75 instead of current versions. This had no impact in PR 4b (no Babel transform plugins consume targets), but Vite's `build.target` will consume browserslist — stale data would produce incorrect output.
  > - **Source maps for minification** were not added in PR 4b (terser replaced UglifyJS without source map config, matching the original behavior). Vite's library mode handles source maps natively, so this resolves itself when terser is removed.

  - [ ] 6.1. Create new branch using `gt create typescript-migration-part-6`

  - [ ] 6.2. Install `vite` and configure `vite.config.ts` for library mode:
    - UMD output with `ShopifyBuy` global name
    - ESM output
    - CJS output

  - [ ] 6.3. Delete `script/build.js` (Rollup build script)

  - [ ] 6.4. Update `package.json`:
    - Replace build scripts to use Vite
    - Add `"module"` and `"exports"` fields
    - Remove rollup, rollup-plugin-babel, rollup-plugin-commonjs, rollup-plugin-node-resolve from deps
    - Remove all `@babel/plugin-transform-*` plugins (keep `@babel/preset-typescript` temporarily for test pipeline if needed)
    - Remove `.babelrc` production env (or entire file if only production env remains)

  - [ ] 6.5. Update `src:watch` script for Vite dev server

  - [ ] 6.6. Update build entry point references: `script/build.js` and `src:watch` both hardcode `src/buybutton.js` — Vite config should reference this

  - [ ] 6.7. **Sass pipeline evaluation:** The Sass compilation scripts (`script/embed-styles`, `script/host-styles`) use `sass` and `postcss` directly, independent of the JS build pipeline. Evaluate whether Vite's CSS handling can replace these scripts. If not, keep them as-is — they are not blocked by the Vite migration.

  - [ ] 6.8. **Bundle equivalence gate:** Before merging, verify:
    1. UMD bundle exposes `window.ShopifyBuy` global with identical public API surface
    2. ESM bundle exports match pre-Vite: `ShopifyBuy` default export, `buildClient` named export
    3. UMD bundle size is within ±15% of pre-Vite build (terser vs Vite's built-in minification may differ slightly)
    4. Load UMD bundle in a `<script>` tag and verify `window.ShopifyBuy.buildClient()` is callable

  - [ ] 6.9. Verify: `pnpm run build` produces UMD/ESM/CJS bundles, `pnpm test` passes, `pnpm run type-check` passes

  - [ ] 6.10. **[PR BOUNDARY]** Submit PR 6 using `gt submit`

- [ ] 7a. Mocha + Testem + Browserify → Vitest + happy-dom (Runner Swap) (PR 7a)

  - [ ] 7a.1. Create new branch using `gt create typescript-migration-part-7a`

  - [ ] 7a.2. Install `vitest`, `happy-dom`

  - [ ] 7a.3. Create `vitest.config.ts` with happy-dom environment

  - [ ] 7a.4. Delete `testem.json`

  - [ ] 7a.5. Update `package.json`:
    - Replace test scripts to use Vitest
    - Remove browserify, babelify, testem, mocha from devDeps
    - Remove test-mocha:build, test-mocha:watch, pretest scripts
    - Remove `@types/jest` (Vitest provides its own types)

  - [ ] 7a.6. Vitest uses Chai internally, so `expect(x).to.equal(y)` syntax may work as-is. Focus on getting all 29 unit tests passing under Vitest with minimal assertion changes.

  - [ ] 7a.7. Keep chai and sinon temporarily — they will be cleaned up in PR 7b

  - [ ] 7a.8. Verify: `pnpm test` passes (all 29 unit tests), `pnpm run build` still works

  - [ ] 7a.9. **[PR BOUNDARY]** Submit PR 7a using `gt submit`

- [ ] 7b. Sinon → vi Migration (PR 7b)

  - [ ] 7b.1. Create new branch using `gt create typescript-migration-part-7b`

  - [ ] 7b.2. Replace Sinon patterns across all test files:

    **Sinon → vi API mapping:**
    | Sinon | Vitest |
    |-------|--------|
    | `sinon.stub()` | `vi.fn()` |
    | `sinon.stub(obj, 'method')` | `vi.spyOn(obj, 'method')` |
    | `sinon.spy()` | `vi.fn()` |
    | `sinon.spy(obj, 'method')` | `vi.spyOn(obj, 'method')` |
    | `stub.returns(value)` | `mock.mockReturnValue(value)` |
    | `stub.callsFake(fn)` | `mock.mockImplementation(fn)` |
    | `stub.resolves(value)` | `mock.mockResolvedValue(value)` |
    | `stub.rejects(err)` | `mock.mockRejectedValue(err)` |
    | `stub.calledOnce` | `expect(mock).toHaveBeenCalledOnce()` |
    | `stub.calledWith(args)` | `expect(mock).toHaveBeenCalledWith(args)` |
    | `sinon.sandbox.create()` | Not needed — Vitest auto-restores |
    | `sandbox.restore()` | `vi.restoreAllMocks()` in afterEach |

  - [ ] 7b.3. Remove `sinon` and `chai` from devDependencies (if Chai assertions were replaced by Vitest's `expect` in 7a, otherwise keep chai)

  - [ ] 7b.4. Verify: `pnpm test` passes (all 29 unit tests)

  - [ ] 7b.5. **[PR BOUNDARY]** Submit PR 7b using `gt submit`

- [ ] 8. Dependency Cleanup + aws-sdk v2 → v3 (PR 8)

  - [ ] 8.1. Create new branch using `gt create typescript-migration-part-8`

  - [ ] 8.2. Remove `webdriverio` from devDependencies (dead — no E2E tests found)

  - [ ] 8.3. Migrate `aws-sdk` v2 → `@aws-sdk/client-s3` v3 in `script/deploy.js`:
    - Replace `new AWS.S3()` with `new S3Client()`
    - Replace `s3.putObject({...}).promise()` with `send(new PutObjectCommand({...}))`

  - [ ] 8.4. **Replace `@shopify/js-uploader` entirely** — it uses v2's `s3.putObject().promise()` API which is incompatible with v3. The uploader's actual upload logic is ~20 lines; inline the S3 calls directly in `script/deploy.js`.

  - [ ] 8.5. Move misplaced dependencies to devDependencies or remove:
    - `browserify` — remove (replaced by Vite)
    - `sass` — move to devDependencies (it IS still used by `script/embed-styles` and `script/host-styles` for Sass compilation, which is independent of the JS build pipeline per PR 6 evaluation)
    - `@babel/runtime` — remove if no longer needed post-Vite

  - [ ] 8.6. Verify CDN deploy still works (if possible in dev environment)

  - [ ] 8.7. Verify: `pnpm test` passes, `pnpm run build` works

  - [ ] 8.8. **[PR BOUNDARY]** Submit PR 8 using `gt submit`

**Phase 3 exit criteria:** `pnpm test` passes, `pnpm run build` produces UMD/ESM/CJS bundles, `pnpm run type-check` passes, `pnpm run lint` passes with TS rules enforced. Bundle equivalence verified against pre-Vite builds.

**Phase 3 smoke test checkpoints:**
- After PR 3: `pnpm install` resolves cleanly, CI workflows pass
- After PR 4: Bundle builds without UglifyJS errors, no polyfill references in output
- After PR 6: Bundle equivalence gate passes, `window.ShopifyBuy.buildClient()` callable from UMD `<script>` tag
- After PR 7a: All 29 unit tests pass under Vitest

---

## Phase 4: TypeScript File Conversion (PRs 9-21)

### Key Decisions

- **Each PR must pass** `pnpm test`, `pnpm run build`, `pnpm run type-check`, and `pnpm run lint`
- **CSS class types: change from `string[]` to `string`** in PR 10 to match runtime defaults in `defaults/components.js`
- **Use `satisfies` operator** for `defaults/components.js` (PR 10)
- **Modal updater moves to PR 17** due to cross-tier dependency on Product component
- **Checkout is standalone** — does not extend Component

---

- [ ] 9. Convert Leaf Utilities + template.js (Tiers 0-1, 16 files) (PR 9)

  **Note:** 16 files is a large PR. Most of these are tiny leaf utilities (5-30 lines) so the total diff should be manageable (~500-800 lines). If the PR exceeds ~800 lines, consider splitting Tier 0 and Tier 1 into separate PRs.

  - [ ] 9.1. Create new branch using `gt create typescript-migration-part-9`

  - [ ] 9.2. Convert all Tier 0 files (13 files):
    - `src/utils/is-function.js`
    - `src/utils/window-utils.js`
    - `src/utils/element-class.js`
    - `src/utils/logger.js`
    - `src/utils/frame-utils.js`
    - `src/utils/focus.js`
    - `src/utils/detect-features.js`
    - `src/utils/merge.js`
    - `src/utils/normalize-config.js`
    - `src/defaults/money-format.js`
    - `src/utils/unit-price.js`
    - `src/utils/track.js`
    - `src/template.js`

  - [ ] 9.3. Convert all Tier 1 files (3 files):
    - `src/utils/money.js` (imports money-format)
    - `src/utils/log-not-found.js` (imports logger)
    - `src/utils/throttle.js` (imports frame-utils)

  - [ ] 9.4. Ensure all utility functions have explicit input and return types

  - [ ] 9.5. Update any imports in other files that reference these utilities (Rollup/Vite resolves `.ts` extensions)

  - [ ] 9.6. Verify: `pnpm test` passes, `pnpm run build` works, `pnpm run type-check` passes, `pnpm run lint` passes

  - [ ] 9.7. **[PR BOUNDARY]** Submit PR 9 using `gt submit`

- [ ] 10. Convert Templates, Styles, Defaults (Tier 2, 12 files) (PR 10)

  - [ ] 10.1. Create new branch using `gt create typescript-migration-part-10`

  - [ ] 10.2. Convert 7 template files:
    - `src/templates/product.js`
    - `src/templates/cart.js`
    - `src/templates/modal.js`
    - `src/templates/option.js`
    - `src/templates/line-item.js`
    - `src/templates/toggle.js`
    - `src/templates/styles.js`

  - [ ] 10.3. Convert 4 style files:
    - `src/styles/embeds/all.js`
    - `src/styles/embeds/conditional.js` (189 bytes — small but real CSS rules, not dead code)
    - `src/styles/host/host.js` (~135 lines of substantive CSS when formatted)
    - `src/styles/host/conditional.js` (129 bytes — small but real CSS rules, not dead code)

  - [ ] 10.4. Convert `src/defaults/components.js` (336 lines):
    - **Fix CSS class type mismatch:** Types define CSS class properties as `string[]` but runtime defaults use plain `string` values (e.g., `wrapper: 'shopify-buy__product-wrapper'`). Change ALL properties in these 7 interfaces from `string[]` to `string` in `src/types/index.ts`:
      1. `ProductClasses` (lines ~306-319): wrapper, product, button, img, imgWrapper, carousel, title, price, options, quantity, description, hasImage
      2. `CartClasses` (lines ~321-330): wrapper, cart, lineItem, footer, title, note, button, subtotal
      3. `ModalClasses` (lines ~332-342): wrapper, modal, overlay, contents, close, footer, product, img, imgWithCarousel
      4. `ProductSetClasses` (lines ~344-350): wrapper, products, product, title, pagination
      5. `ToggleClasses` (lines ~352-357): wrapper, toggle, icon, count
      6. `OptionClasses` (lines ~359-368): option, wrapper, select, label, optionDisabled, optionSelected, selectIcon, hiddenLabel
      7. `LineItemClasses` (lines ~370-380): image, title, variantTitle, price, priceWithDiscounts, quantity, quantityButton, quantityInput, remove
    - **Use `satisfies` operator:** `export default { ... } satisfies ComponentOptions` to validate against the type while preserving literal types. Also evaluate other config/defaults objects in the codebase for `satisfies` opportunities (e.g., `defaults/money-format.js` if it exports a typed config object).

  - [ ] 10.5. Verify: `pnpm test` passes, `pnpm run build` works, `pnpm run type-check` passes, `pnpm run lint` passes

  - [ ] 10.6. **[PR BOUNDARY]** Submit PR 10 using `gt submit`

- [ ] 11. Convert Base Classes: updater.js, iframe.js (Tier 3, 2 files) (PR 11)

  - [ ] 11.1. Create new branch using `gt create typescript-migration-part-11`

  - [ ] 11.2. Convert `src/updater.js` — base Updater class (imports merge, template)

  - [ ] 11.3. Convert `src/iframe.js` — base IFrame class (imports templates/styles, element-class)

  - [ ] 11.4. Verify: `pnpm test` passes, `pnpm run type-check` passes, `pnpm run lint` passes

  - [ ] 11.5. **[PR BOUNDARY]** Submit PR 11 using `gt submit`

- [ ] 12. Convert Base View + Base Component (Tier 4, 2 files) (PR 12)

  - [ ] 12.1. Create new branch using `gt create typescript-migration-part-12`

  - [ ] 12.2. Convert `src/view.js` — base View class (imports template, iframe, styles, element-class, focus)

  - [ ] 12.3. Convert `src/component.js` — base Component class (imports merge, is-function, defaults, log-not-found, logger, money-format, view, updater)

  - [ ] 12.4. Verify: `pnpm test` passes, `pnpm run type-check` passes, `pnpm run lint` passes

  - [ ] 12.5. **[PR BOUNDARY]** Submit PR 12 using `gt submit`

- [ ] 13. Convert All Derived Views (Tier 5, 5 files) (PR 13)

  - [ ] 13.1. Create new branch using `gt create typescript-migration-part-13`

  - [ ] 13.2. Convert all 5 derived view files:
    - `src/views/product.js`
    - `src/views/cart.js`
    - `src/views/modal.js`
    - `src/views/toggle.js`
    - `src/views/product-set.js`

  - [ ] 13.3. Ensure all view render methods have proper return types and event handler signatures

  - [ ] 13.4. Verify: `pnpm test` passes, `pnpm run type-check` passes, `pnpm run lint` passes

  - [ ] 13.5. **[PR BOUNDARY]** Submit PR 13 using `gt submit`

- [ ] 14. Convert Derived Updaters, Excluding Modal (Tier 6, 3 files) (PR 14)

  - [ ] 14.1. Create new branch using `gt create typescript-migration-part-14`

  - [ ] 14.2. Convert 3 updater files:
    - `src/updaters/product.js`
    - `src/updaters/cart.js`
    - `src/updaters/product-set.js`

  - [ ] 14.3. **Do NOT convert `src/updaters/modal.js` here** — it imports `components/product.js` which hasn't been converted yet. Modal updater moves to PR 17.

  - [ ] 14.4. Verify: `pnpm test` passes, `pnpm run type-check` passes, `pnpm run lint` passes

  - [ ] 14.5. **[PR BOUNDARY]** Submit PR 14 using `gt submit`

- [ ] 15. Convert Checkout + Toggle Components (Tier 7 — simpler components, 2 files) (PR 15)

  - [ ] 15.1. Create new branch using `gt create typescript-migration-part-15`

  - [ ] 15.2. Convert `src/components/checkout.js` — **Note:** This does NOT extend Component. It is a standalone redirect handler. Do not assume component base class patterns.

  - [ ] 15.3. Convert `src/components/toggle.js` — extends Component, uses views/toggle

  - [ ] 15.4. Verify: `pnpm test` passes, `pnpm run type-check` passes, `pnpm run lint` passes

  - [ ] 15.5. **[PR BOUNDARY]** Submit PR 15 using `gt submit`

- [ ] 16. Convert Product Component (Tier 7 — largest file, 1 file) (PR 16)

  - [ ] 16.1. Create new branch using `gt create typescript-migration-part-16`

  - [ ] 16.2. Convert `src/components/product.js` (~861 lines — the largest source file)

  - [ ] 16.3. Ensure all product-specific methods, event handlers, and variant selection logic are properly typed

  - [ ] 16.4. Verify: `pnpm test` passes, `pnpm run type-check` passes, `pnpm run lint` passes

  - [ ] 16.5. **[PR BOUNDARY]** Submit PR 16 using `gt submit`

- [ ] 17. Convert Cart + Modal Components + Modal Updater (Tier 7, 3 files) (PR 17)

  - [ ] 17.1. Create new branch using `gt create typescript-migration-part-17`

  - [ ] 17.2. Convert `src/updaters/modal.js` — **Now safe:** Product component was converted in PR 16, so the `import Product from '../components/product'` has types available.

  - [ ] 17.3. Convert `src/components/cart.js` (~400 lines — depends on toggle, checkout, views/cart, updaters/cart)

  - [ ] 17.4. Convert `src/components/modal.js` (~200 lines — depends on product, views/modal, updaters/modal)

  - [ ] 17.5. Verify: `pnpm test` passes, `pnpm run type-check` passes, `pnpm run lint` passes

  - [ ] 17.6. **[PR BOUNDARY]** Submit PR 17 using `gt submit`

- [ ] 18. Convert ProductSet Component (Tier 7, 1 file) (PR 18)

  - [ ] 18.1. Create new branch using `gt create typescript-migration-part-18`

  - [ ] 18.2. Convert `src/components/product-set.js` (~150 lines — depends on product, views/product-set, updaters/product-set)

  - [ ] 18.3. Verify: `pnpm test` passes, `pnpm run type-check` passes, `pnpm run lint` passes

  - [ ] 18.4. **[PR BOUNDARY]** Submit PR 18 using `gt submit`

- [ ] 19. Convert Entry Points (Tier 8, 2 files) (PR 19)

  - [ ] 19.1. Create new branch using `gt create typescript-migration-part-19`

  - [ ] 19.2. Convert `src/ui.js` — imports all components, track, styles, throttle, detect-features
    - **Fix pre-existing bug (Tier 1):** `destroyComponent` at line 99 has operator precedence bug: `!component.model.id === id` evaluates as `(!component.model.id) === id`. Fix to `component.model.id !== id`. Additionally, the function mutates the array during `forEach` + `splice`, which can skip elements — consider using `filter` instead. (In a separate commit.)
    - **Fix pre-existing bug (Tier 1):** `_bindPostMessage` at line 316 has no `msg.origin` validation — any cross-origin page can trigger `location.reload()`. Add origin check against the expected Shopify checkout domain (in a separate commit).

  - [ ] 19.3. Convert `src/buybutton.js` — main entry point, imports ui and templates/product

  - [ ] 19.4. Update build entry point reference in `vite.config.ts` from `.js` to `.ts`

  - [ ] 19.5. Verify: `pnpm run build` produces correct bundles, `pnpm test` passes, `pnpm run type-check` passes, `pnpm run lint` passes

  - [ ] 19.6. **[PR BOUNDARY]** Submit PR 19 using `gt submit`

- [ ] 20. Type Refinement: Fix Remaining `any` Debt (PR 20)

  - [ ] 20.1. Create new branch using `gt create typescript-migration-part-20`

  - [ ] 20.2. **First:** grep for `any` in `src/types/` to catch any instances not listed below

  - [ ] 20.3. Fix all 11 known `Record<string, any>` instances in `src/types/index.ts`:
    - Lines ~94, 113, 129, 146, 162, 185, 197: `styles?: Record<string, any>` — replace with proper CSS style type
    - Line ~491: `eventProperties?: Record<string, any>` — replace with specific event property type
    - Line ~545: `options: Record<string, any>` — replace with proper ComponentOptions type
    - Line ~571: `config: Record<string, any>` — replace with proper config type

  - [ ] 20.4. Fix the `Function` type at line ~492: replace with a specific function signature

  - [ ] 20.5. Verify: `pnpm run type-check` passes, `pnpm test` passes, `pnpm run lint` passes (especially `no-explicit-any`)

  - [ ] 20.6. **[PR BOUNDARY]** Submit PR 20 using `gt submit`

- [ ] 21. Final Source Lockdown: Remove allowJs, Make Type-Check Blocking (PR 21)

  - [ ] 21.1. Create new branch using `gt create typescript-migration-part-21`

  - [ ] 21.2. Remove `allowJs: true` from `tsconfig.json`

  - [ ] 21.3. Update `.github/workflows/ci.yml`: remove `continue-on-error: true` from type-check step (make it blocking)

  - [ ] 21.4. Verify: `pnpm run type-check` passes with `allowJs: false`, `pnpm test` passes, `pnpm run build` works

  - [ ] 21.5. **[PR BOUNDARY]** Submit PR 21 using `gt submit`

**Phase 4 exit criteria:** All 49 `src/*.js` files converted to `.ts`. Zero `any` types in source. `pnpm run type-check` passes. `pnpm test` passes. `allowJs: false` in tsconfig.

**Phase 4 smoke test checkpoints:**
- After PR 9: First converted batch produces correct output, imports from remaining JS files still work
- After PR 19: Full build from TS entry point, all exports intact
- After PR 21: `tsc --noEmit` passes with `allowJs: false`

---

## Phase 5: Test File Conversion (PRs 22-26)

Since Vitest natively handles both `.js` and `.ts` test files, test conversion is straightforward — primarily adding type annotations. No test logic changes.

---

- [ ] 22. Convert Test Fixtures + Entry Point (PR 22)

  - [ ] 22.1. Create new branch using `gt create typescript-migration-part-22`

  - [ ] 22.2. Convert `test/fixtures/product-fixture.js` (153 lines)

  - [ ] 22.3. Convert `test/fixtures/shop-info.js` (11 lines)

  - [ ] 22.4. Convert `test/test.js` (35 lines — test entry point)

  - [ ] 22.5. Evaluate `test/build/test.js`: This is a **72,678-line generated Browserify bundle** (created by the `pretest` script: `browserify test/test.js -t babelify --outfile test/build/test.js`). Do NOT attempt to convert this file. It should be removed entirely since Vitest (PR 7a) eliminates the Browserify test pipeline. Verify the `pretest` script was already removed in PR 7a; if not, remove it here. Add `test/build/` to `.gitignore` if not already present.

  - [ ] 22.6. Verify: `pnpm test` passes

  - [ ] 22.7. **[PR BOUNDARY]** Submit PR 22 using `gt submit`

- [ ] 23. Convert Utility + Small Unit Tests (~10 files) (PR 23)

  - [ ] 23.1. Create new branch using `gt create typescript-migration-part-23`

  - [ ] 23.2. Convert 10 test files:
    - `test/unit/merge.js` (122 lines)
    - `test/unit/money.js` (38 lines)
    - `test/unit/normalize-config.js` (64 lines)
    - `test/unit/detect-features.js` (63 lines)
    - `test/unit/unit-price.js` (23 lines)
    - `test/unit/focus.js` (191 lines)
    - `test/unit/template.js` (63 lines)
    - `test/unit/updater.js` (67 lines)
    - `test/unit/checkout.js` (55 lines)
    - `test/unit/tracker.js` (106 lines)

  - [ ] 23.3. Add type annotations to test assertions and mocks

  - [ ] 23.4. Verify: `pnpm test` passes

  - [ ] 23.5. **[PR BOUNDARY]** Submit PR 23 using `gt submit`

- [ ] 24. Convert Base Class + UI Tests (5 files) (PR 24)

  - [ ] 24.1. Create new branch using `gt create typescript-migration-part-24`

  - [ ] 24.2. Convert 5 test files:
    - `test/unit/component.js` (459 lines)
    - `test/unit/view.js` (930 lines)
    - `test/unit/iframe.js` (523 lines)
    - `test/unit/ui.js` (1016 lines)
    - `test/unit/buybutton.js` (64 lines)

  - [ ] 24.3. Add type annotations for component mocks and view test helpers

  - [ ] 24.4. Verify: `pnpm test` passes

  - [ ] 24.5. **[PR BOUNDARY]** Submit PR 24 using `gt submit`

- [ ] 25a. Convert Product Tests (3 files) (PR 25a)

  - [ ] 25a.1. Create new branch using `gt create typescript-migration-part-25a`

  - [ ] 25a.2. Convert 3 product test files:
    - `test/unit/product/product-component.js` (2568 lines — largest test file)
    - `test/unit/product/product-updater.js` (256 lines)
    - `test/unit/product/product-view.js` (271 lines)

  - [ ] 25a.3. Add type annotations for product-specific test data and mocks

  - [ ] 25a.4. Verify: `pnpm test` passes

  - [ ] 25a.5. **[PR BOUNDARY]** Submit PR 25a using `gt submit`

- [ ] 25b. Convert Cart + Modal + Toggle + ProductSet Tests (8 files) (PR 25b)

  - [ ] 25b.1. Create new branch using `gt create typescript-migration-part-25b`

  - [ ] 25b.2. Convert 8 test files:
    - `test/unit/cart/cart.js` (1633 lines)
    - `test/unit/cart/cart-view.js` (277 lines)
    - `test/unit/modal/modal-component.js` (250 lines)
    - `test/unit/modal/modal-updater.js` (52 lines)
    - `test/unit/modal/modal-view.js` (304 lines)
    - `test/unit/toggle/toggle-component.js` (149 lines)
    - `test/unit/toggle/toggle-view.js` (288 lines)
    - `test/unit/product-set.js` (453 lines)

  - [ ] 25b.3. Add type annotations for cart/modal/toggle/product-set test data and mocks

  - [ ] 25b.4. Verify: `pnpm test` passes

  - [ ] 25b.5. **[PR BOUNDARY]** Submit PR 25b using `gt submit`

- [ ] 26. Final Lockdown: Remove All JS Allowances (PR 26)

  - [ ] 26.1. Create new branch using `gt create typescript-migration-part-26`

  - [ ] 26.2. Verify no `.js` files remain in `src/` or `test/` (except any intentional config files)

  - [ ] 26.3. Update tsconfig to include test files in type checking if not already

  - [ ] 26.4. Verify: `pnpm test` passes, `pnpm run type-check` passes, `pnpm run build` works, `pnpm run lint` passes

  - [ ] 26.5. **[PR BOUNDARY]** Submit PR 26 using `gt submit --stack` (submit entire remaining stack)

**Phase 5 exit criteria:** All 30 test `.js` files converted to `.ts`. Zero `.js` files in `src/` or `test/` (except config files). Full TypeScript strictness enforced across codebase. All CI checks passing and blocking.

---

## Important Learnings from Initial Setup

### Package Manager
This project uses **pnpm** (migrated from Yarn v1 in PR 3).

### Build System Architecture
- Currently: Rollup with Babel for builds (migrates to Vite in PR 6)
- Babel handles TypeScript transpilation via `@babel/preset-typescript`
- Build script is at `script/build.js` — hardcodes `src/buybutton.js` as entry point
- `src:watch` in package.json also hardcodes `src/buybutton.js`
- Both must be updated when Vite replaces Rollup (PR 6) and when entry point becomes `.ts` (PR 19)

### Git Workflow with Worktrees
- This repository uses **git worktrees** — the main branch may be checked out in another worktree
- Use `gt get` instead of `gt sync` for fetching and rebasing
- When creating branches, errors about branches being used by other worktrees are normal

### TypeScript Configuration
- `"isolatedModules": true` in tsconfig.json for Babel compatibility
- Use `export type { TypeName }` syntax to avoid TS1205 errors
- `allowJs: true` and `checkJs: false` during migration; `allowJs: false` set in final PR 21

### CI/CD
- GitHub Actions workflows in `.github/workflows/`: `ci.yml`, `npm-release.yml`, `snapit.yml`, `cla.yml`
- `cla.yml` is GitHub-managed and not modified during migration
- Type checking starts non-blocking (`continue-on-error: true`), becomes blocking in PR 21

### Testing
- Currently: Mocha + Testem + Chai + Sinon + Browserify (migrates to Vitest in PR 7a/7b)
- `@types/jest` was incorrectly installed in Phase 2 — removed in PR 7a
- Build verification test at `test/build/test.js` may need removal after Vite migration
