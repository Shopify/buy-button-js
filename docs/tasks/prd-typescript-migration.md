# Product Requirements Document: TypeScript Migration

## Introduction/Overview

This document outlines the requirements for migrating the Buy Button JS application from JavaScript to TypeScript. The primary driver for this migration is to enable a safe and confident future refactoring from the `shopify-buy` SDK to Shopify's Storefront API Client. This migration will be executed through a series of small, reviewable pull requests, each containing a maximum of ~500 lines of code changes.

**Important:** This migration will NOT add any dependencies on `@types/shopify-buy`. Instead, we will create our own type definitions for the shopify-buy SDK usage, using the community types only as a reference guide. This approach ensures we're not adding dependencies we plan to remove and gives us full control over the types as we prepare for the API client migration.

## Goals

1. **Enable Safe API Client Migration:** Provide full type safety to support the future migration from `shopify-buy` to Shopify's Storefront API Client with 100% confidence.
2. **Achieve Complete Type Safety:** Convert all JavaScript files to TypeScript with no `any` types or unsafe operations.
3. **Maintain Backward Compatibility:** Preserve the exact same public API surface with zero breaking changes for users.
4. **Keep PRs Reviewable:** Structure the migration in PRs of ~500 lines or less for effective code review.
5. **Ensure Continuous Shippability:** Maintain a working application at every stage of the migration.

## User Stories

1. **As a developer**, I want to refactor from `shopify-buy` to Storefront API Client with confidence that type checking will catch all breaking changes, so that I can safely modernize the codebase.

2. **As a developer**, I want to work in a fully typed codebase, so that I can refactor code safely and catch errors at compile time rather than runtime.

3. **As a code reviewer**, I want to review small, focused PRs, so that I can provide thorough feedback without being overwhelmed.

4. **As a library user**, I want the migration to be transparent with no breaking changes, so that my existing integrations continue to work without modification.

## Functional Requirements

### Phase 1: TypeScript Infrastructure Setup
1. The system must add TypeScript as a development dependency.
2. The system must create a `tsconfig.json` with strict mode enabled.
3. The system must configure the build system to handle both `.js` and `.ts` files during the migration period.
4. The system must add type checking to the CI pipeline as a non-blocking check initially.
5. The system must support importing JavaScript files from TypeScript files during migration.

### Phase 2: Type Definitions
6. The system must install `@types/*` packages for all existing dependencies (excluding shopify-buy).
7. The system must reference `@types/shopify-buy` as a guide but NOT add it as a dependency.
8. The system must create custom type definitions for `shopify-buy` usage in `src/types/shopify-buy.d.ts`.
9. The system must define core interfaces and types in a dedicated `src/types/` directory.

### Phase 3: Utility Files Migration
10. The system must convert all files in `src/utils/` to TypeScript.
11. The system must ensure all utility functions have explicit input and return types.
12. The system must convert corresponding test files to TypeScript without changing test logic.

### Phase 4: Component Migration (Bottom-up)
13. The system must convert view components before their parent components.
14. The system must convert updater components after views but before main components.
15. The system must convert each component with full type definitions for props, state, and methods.
16. The system must maintain the existing class/function signatures for public APIs.

### Phase 5: Entry Points and Core Files
17. The system must convert main entry files (`buybutton.js`, `ui.js`, etc.) to TypeScript.
18. The system must update build outputs to properly export TypeScript transpiled code.
19. The system must ensure the UMD bundle continues to work identically.

### Phase 6: Test Migration
20. The system must convert all test files from `.js` to `.ts` extension.
21. The system must ensure tests continue to pass without modifying test logic.
22. The system must add type checking for test files in CI.

### Phase 7: Strict Type Enforcement
23. The system must eliminate all temporary type assertions added during migration.
24. The system must ensure zero `any` types remain in the codebase.
25. The system must prohibit use of non-null assertions (`!`) and type assertions (`as`).
26. The system must make type checking a blocking CI check once migration is complete.

## Non-Goals (Out of Scope)

1. **Build System Modernization:** Moving to Vite or other modern build tools (future consideration).
2. **Test Coverage Improvements:** Adding new tests or increasing coverage.
3. **API Changes:** Any modifications to the public API surface.
4. **Documentation Updates:** Changes to README, API docs, or examples.
5. **Feature Development:** Any new functionality or bug fixes unrelated to TypeScript migration.
6. **Dependency Updates:** Upgrading existing dependencies beyond what's needed for TypeScript.

## Design Considerations

### Migration Strategy
- Use a gradual, bottom-up approach starting with leaf components
- Maintain a working application at every commit
- Group related files in single PRs when they're tightly coupled
- Use type assertions only at JS/TS boundaries during migration

### Type Safety Guidelines
- Enable TypeScript strict mode from the start
- Use explicit types rather than relying on inference for public APIs
- Define shared types in centralized location (`src/types/`)
- Prefer interfaces over type aliases for object shapes
- Use const assertions for literal types where appropriate

## Technical Considerations

### Build Configuration
- Maintain parallel compilation: Babel for JS files, TypeScript compiler for TS files
- Configure Rollup to handle both transpiled outputs
- Use `allowJs: true` and `checkJs: false` during migration
- Set `esModuleInterop: true` for better CommonJS interop

### CI/CD Pipeline
- Add `tsc --noEmit` as a non-blocking check initially
- Run type checking in parallel with existing tests
- Transition to blocking type checks once migration is complete

### Dependencies
- TypeScript 5.x (latest stable)
- Required `@types/*` packages for dependencies (NOT including `@types/shopify-buy`)
- No changes to runtime dependencies
- No new type dependencies for shopify-buy (preparing for its removal)

### Shopify-Buy Types Strategy
- **Reference only:** Review `@types/shopify-buy` from npm as a reference guide
- **Do NOT install** `@types/shopify-buy` as a dependency
- Create custom type definitions in `src/types/shopify-buy.d.ts` based on:
  - Actual usage patterns in the codebase
  - Reference to community types for structure guidance
  - Only the subset of types actually used by Buy Button JS
- This approach ensures no dependency on shopify-buy types when migrating to Storefront API Client

## Success Metrics

1. **100% TypeScript Coverage:** All `.js` files in `src/` converted to `.ts`
2. **Zero `any` Types:** No explicit or implicit `any` types in the codebase
3. **Zero Type Errors:** All files pass strict TypeScript checking
4. **Maintained Test Coverage:** All existing tests continue to pass
5. **No Breaking Changes:** Public API remains identical (verified by unchanged examples/demos)
6. **Type Safety Confidence:** Ability to refactor with confidence that type checking catches all issues

## Open Questions

1. ~~Should we create custom type definitions for the `shopify-buy` SDK or wait for official types?~~ **Resolved:** Create custom type definitions, using `@types/shopify-buy` only as a reference guide without adding it as a dependency.
2. Are there any specific patterns in the codebase that might be challenging to type strictly?
3. Should we add a type coverage tool (like `type-coverage`) to track progress?
4. Would it be beneficial to set up a separate branch for the entire migration or work directly on the main branch?
5. Should we consider adding JSDoc comments for public APIs as we migrate?

## Migration Phases Summary

| Phase | Description | Estimated PRs | Lines per PR |
|-------|-------------|--------------|--------------|
| 1 | TypeScript Infrastructure | 1 | ~200 |
| 2 | Type Definitions | 1 | ~300 |
| 3 | Utility Files | 3-4 | ~400 |
| 4 | Components (Bottom-up) | 8-10 | ~500 |
| 5 | Entry Points | 2-3 | ~400-500 |
| 6 | Test Files | 5-6 | ~400 |
| 7 | Strict Enforcement | 1 | ~100 |

**Total Estimated PRs:** 21-26 PRs
**Total Migration Effort:** ~4-6 weeks for one developer

## Next Steps

1. Create initial TypeScript infrastructure PR
2. Set up type checking in CI (non-blocking)
3. Begin utility files migration
4. Proceed with bottom-up component migration
5. Complete migration with entry points
6. Enforce strict type checking