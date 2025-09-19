# Task List: TypeScript Migration

## PR Breakdown

This migration will be implemented across multiple small PRs (~200-500 lines each):

**PR 1: TypeScript Infrastructure Setup** (~200 lines)
- TypeScript configuration and build setup
- CI pipeline configuration
- Initial type checking setup

**PR 2: Type Definitions Setup** (~300 lines)
- Install @types packages for dependencies
- Create custom shopify-buy type definitions
- Set up core interfaces and types directory

**PR 3-6: Utility Files Migration** (~400 lines each, 4 PRs)
- Convert utility functions to TypeScript
- Add explicit types for all utilities
- Convert utility test files

**PR 7-16: Components Migration (Bottom-up)** (~500 lines each, 10 PRs)
- Convert views components
- Convert updaters components  
- Convert main components
- Maintain class/function signatures

**PR 17-19: Entry Points Migration** (~400-500 lines each, 3 PRs)
- Convert main entry files
- Update build outputs
- Ensure UMD bundle compatibility

**PR 20-25: Test Files Migration** (~400 lines each, 6 PRs)
- Convert all test files to TypeScript
- Ensure tests continue to pass
- Add type checking for tests

**PR 26: Strict Type Enforcement** (~100 lines)
- Remove temporary type assertions
- Enable strict type checking
- Make CI type checks blocking

## Relevant Files

- `test/unit/**/*.test.js` - Unit tests to be converted (TDD - update as we migrate)
- `tsconfig.json` - TypeScript configuration (create first)
- `src/types/shopify-buy.d.ts` - Custom type definitions for shopify-buy SDK
- `src/types/index.ts` - Core interfaces and shared types
- `src/utils/*.js` - Utility functions to migrate
- `src/views/*.js` - View components (migrate first in component phase)
- `src/updaters/*.js` - Updater components (migrate second)
- `src/components/*.js` - Main components (migrate third)
- `src/buybutton.js` - Main entry point
- `src/ui.js` - UI entry point
- `src/iframe.js` - IFrame entry point
- `package.json` - Dependencies and scripts updates
- `.github/workflows/*.yml` - CI configuration updates

### Notes

- Follow TDD: Tests should continue to pass throughout migration
- Use `npm test` to run the test suite
- Use `npm run type-check` (to be added) for TypeScript type checking
- All TypeScript files must use strict mode from the start
- Custom shopify-buy types only - do NOT install @types/shopify-buy
- Reference @types/shopify-buy from npm for guidance only
- Maintain backward compatibility - no breaking API changes
- Each PR should be independently reviewable and shippable
- Use type assertions only at JS/TS boundaries during migration
- Prefer interfaces over type aliases for object shapes
- Keep PRs under 500 lines for effective review

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
1. Create branch FIRST: `gt create typescript-migration-part-1`
2. Make changes for the task
3. Stage specific files: `gt add tsconfig.json package.json`
4. Commit: `gt modify --message "feat: add TypeScript infrastructure"`
5. Submit: `gt submit`
6. Next PR: `gt create typescript-migration-part-2`

## Tasks

- [ ] 0. Initial Setup

  - [ ] 0.1. Create feature branch using `gt create typescript-migration-part-1` (from main branch)

- [ ] 1. TypeScript Infrastructure Setup (PR 1)

  - [ ] 1.1. Install TypeScript as a development dependency using `npm install --save-dev typescript@^5.0.0`

  - [ ] 1.2. Create `tsconfig.json` with strict mode enabled and appropriate compiler options for gradual migration

  - [ ] 1.3. Update `.gitignore` to exclude TypeScript build artifacts (*.tsbuildinfo, dist-types/)

  - [ ] 1.4. Configure Rollup build system to handle both `.js` and `.ts` files during migration

  - [ ] 1.5. Add `type-check` script to package.json: `"type-check": "tsc --noEmit"`

  - [ ] 1.6. Add TypeScript checking to CI pipeline as a non-blocking check initially

  - [ ] 1.7. Verify setup by creating a test TypeScript file and running `npm run type-check`

  - [ ] 1.8. Clean up test file and verify build still works with `npm run build`

  - [ ] 1.9. **[PR BOUNDARY]** Submit PR 1 using `gt submit`

- [ ] 2. Type Definitions Setup (PR 2)

  - [ ] 2.1. Create new branch using `gt create typescript-migration-part-2` (stacks on current branch)

  - [ ] 2.2. Install @types packages for existing dependencies (NOT @types/shopify-buy): `npm install --save-dev @types/node @types/jest`

  - [ ] 2.3. Create `src/types/` directory for centralized type definitions

  - [ ] 2.4. Review @types/shopify-buy from npm (without installing) to understand type structure

  - [ ] 2.5. Create `src/types/shopify-buy.d.ts` with custom type definitions based on actual usage in codebase

  - [ ] 2.6. Create `src/types/index.ts` for shared interfaces and core types used across components

  - [ ] 2.7. Add common utility types (DeepPartial, Nullable, etc.) to `src/types/utils.ts`

  - [ ] 2.8. Verify type definitions compile correctly with `npm run type-check`

  - [ ] 2.9. **[PR BOUNDARY]** Submit PR 2 using `gt submit`

- [ ] 3. Utility Files Migration - Part 1 (PR 3)

  - [ ] 3.1. Create new branch using `gt create typescript-migration-part-3` (stacks on current branch)

  - [ ] 3.2. Convert `src/utils/is-function.js` to TypeScript with explicit type annotations

  - [ ] 3.3. Convert `src/utils/throttle.js` to TypeScript with proper function type signatures

  - [ ] 3.4. Convert `src/utils/merge.js` to TypeScript with generic type parameters

  - [ ] 3.5. Convert `src/utils/detect-features.js` to TypeScript with proper return types

  - [ ] 3.6. Update any imports in other files that reference these utilities

  - [ ] 3.7. Run tests to ensure utilities work correctly: `npm test`

  - [ ] 3.8. Run type checking to verify no type errors: `npm run type-check`

  - [ ] 3.9. **[PR BOUNDARY]** Submit PR 3 using `gt submit`

- [ ] 4. Utility Files Migration - Part 2 (PR 4)

  - [ ] 4.1. Create new branch using `gt create typescript-migration-part-4` (stacks on current branch)

  - [ ] 4.2. Convert `src/utils/money.js` to TypeScript with proper number formatting types

  - [ ] 4.3. Convert `src/utils/unit-price.js` to TypeScript with price calculation types

  - [ ] 4.4. Convert `src/utils/logger.js` to TypeScript with log level enums

  - [ ] 4.5. Convert `src/utils/track.js` to TypeScript with event tracking types

  - [ ] 4.6. Update imports and ensure compatibility with existing JavaScript files

  - [ ] 4.7. Run tests to verify functionality: `npm test`

  - [ ] 4.8. Run type checking: `npm run type-check`

  - [ ] 4.9. **[PR BOUNDARY]** Submit PR 4 using `gt submit`

- [ ] 5. Utility Files Migration - Part 3 (PR 5)

  - [ ] 5.1. Create new branch using `gt create typescript-migration-part-5` (stacks on current branch)

  - [ ] 5.2. Convert `src/utils/frame-utils.js` to TypeScript with DOM element types

  - [ ] 5.3. Convert `src/utils/window-utils.js` to TypeScript with Window interface types

  - [ ] 5.4. Convert `src/utils/element-class.js` to TypeScript with HTMLElement types

  - [ ] 5.5. Convert `src/utils/focus.js` to TypeScript with focus management types

  - [ ] 5.6. Ensure all DOM manipulation utilities have proper type safety

  - [ ] 5.7. Run tests: `npm test`

  - [ ] 5.8. Run type checking: `npm run type-check`

  - [ ] 5.9. **[PR BOUNDARY]** Submit PR 5 using `gt submit`

- [ ] 6. Utility Files Migration - Part 4 (PR 6)

  - [ ] 6.1. Create new branch using `gt create typescript-migration-part-6` (stacks on current branch)

  - [ ] 6.2. Convert `src/utils/normalize-config.js` to TypeScript with config interface types

  - [ ] 6.3. Convert `src/utils/log-not-found.js` to TypeScript with proper error types

  - [ ] 6.4. Convert `src/defaults/money-format.js` to TypeScript with format configuration types

  - [ ] 6.5. Convert any remaining utility files to TypeScript

  - [ ] 6.6. Create utility type exports in `src/utils/index.ts` for centralized imports

  - [ ] 6.7. Run full test suite: `npm test`

  - [ ] 6.8. Run type checking on all utilities: `npm run type-check`

  - [ ] 6.9. **[PR BOUNDARY]** Submit PR 6 using `gt submit`

- [ ] 7. View Components Migration - Part 1 (PR 7)

  - [ ] 7.1. Create new branch using `gt create typescript-migration-part-7` (stacks on current branch)

  - [ ] 7.2. Convert `src/views/toggle.js` to TypeScript with view interface types

  - [ ] 7.3. Convert `src/views/product.js` to TypeScript with product view types

  - [ ] 7.4. Define base view interface in `src/types/views.ts` for common view properties

  - [ ] 7.5. Ensure view render methods have proper return types

  - [ ] 7.6. Update any component imports that reference these views

  - [ ] 7.7. Run tests for affected components: `npm test`

  - [ ] 7.8. Run type checking: `npm run type-check`

  - [ ] 7.9. **[PR BOUNDARY]** Submit PR 7 using `gt submit`

- [ ] 8. View Components Migration - Part 2 (PR 8)

  - [ ] 8.1. Create new branch using `gt create typescript-migration-part-8` (stacks on current branch)

  - [ ] 8.2. Convert `src/views/cart.js` to TypeScript with cart item types

  - [ ] 8.3. Convert `src/views/modal.js` to TypeScript with modal state types

  - [ ] 8.4. Convert `src/views/product-set.js` to TypeScript with product collection types

  - [ ] 8.5. Ensure all view event handlers have proper type signatures

  - [ ] 8.6. Add type exports to `src/views/index.ts` for centralized imports

  - [ ] 8.7. Run component tests: `npm test`

  - [ ] 8.8. Run type checking: `npm run type-check`

  - [ ] 8.9. **[PR BOUNDARY]** Submit PR 8 using `gt submit`

- [ ] 9. Updater Components Migration - Part 1 (PR 9)

  - [ ] 9.1. Create new branch using `gt create typescript-migration-part-9` (stacks on current branch)

  - [ ] 9.2. Convert `src/updaters/product.js` to TypeScript with updater interface

  - [ ] 9.3. Convert `src/updaters/cart.js` to TypeScript with cart update types

  - [ ] 9.4. Define base updater interface in `src/types/updaters.ts`

  - [ ] 9.5. Ensure updater methods maintain compatibility with views

  - [ ] 9.6. Update component imports that use these updaters

  - [ ] 9.7. Run integration tests: `npm test`

  - [ ] 9.8. Run type checking: `npm run type-check`

  - [ ] 9.9. **[PR BOUNDARY]** Submit PR 9 using `gt submit`

- [ ] 10. Updater Components Migration - Part 2 (PR 10)

  - [ ] 10.1. Create new branch using `gt create typescript-migration-part-10` (stacks on current branch)

  - [ ] 10.2. Convert `src/updaters/modal.js` to TypeScript with modal updater types

  - [ ] 10.3. Convert `src/updaters/product-set.js` to TypeScript with collection updater types

  - [ ] 10.4. Ensure all updater state transitions are type-safe

  - [ ] 10.5. Add type exports to `src/updaters/index.ts`

  - [ ] 10.6. Verify updater-view integration with proper types

  - [ ] 10.7. Run full test suite: `npm test`

  - [ ] 10.8. Run type checking: `npm run type-check`

  - [ ] 10.9. **[PR BOUNDARY]** Submit PR 10 using `gt submit`

- [ ] 11. Main Components Migration - Part 1 (PR 11)

  - [ ] 11.1. Create new branch using `gt create typescript-migration-part-11` (stacks on current branch)

  - [ ] 11.2. Convert `src/component.js` base class to TypeScript with generic type parameters

  - [ ] 11.3. Define component lifecycle interface in `src/types/component.ts`

  - [ ] 11.4. Convert `src/components/toggle.js` to TypeScript extending base component

  - [ ] 11.5. Ensure component props and state are properly typed

  - [ ] 11.6. Update any files importing these components

  - [ ] 11.7. Run component tests: `npm test`

  - [ ] 11.8. Run type checking: `npm run type-check`

  - [ ] 11.9. **[PR BOUNDARY]** Submit PR 11 using `gt submit`

- [ ] 12. Main Components Migration - Part 2 (PR 12)

  - [ ] 12.1. Create new branch using `gt create typescript-migration-part-12` (stacks on current branch)

  - [ ] 12.2. Convert `src/components/product.js` to TypeScript with product component types

  - [ ] 12.3. Convert `src/components/cart.js` to TypeScript with cart component types

  - [ ] 12.4. Ensure component methods maintain public API compatibility

  - [ ] 12.5. Add proper types for component event handlers

  - [ ] 12.6. Verify component integration with views and updaters

  - [ ] 12.7. Run integration tests: `npm test`

  - [ ] 12.8. Run type checking: `npm run type-check`

  - [ ] 12.9. **[PR BOUNDARY]** Submit PR 12 using `gt submit`

- [ ] 13. Main Components Migration - Part 3 (PR 13)

  - [ ] 13.1. Create new branch using `gt create typescript-migration-part-13` (stacks on current branch)

  - [ ] 13.2. Convert `src/components/modal.js` to TypeScript with modal component types

  - [ ] 13.3. Convert `src/components/product-set.js` to TypeScript with collection types

  - [ ] 13.4. Convert `src/components/checkout.js` to TypeScript with checkout types

  - [ ] 13.5. Ensure all component lifecycle methods are properly typed

  - [ ] 13.6. Add component type exports to `src/components/index.ts`

  - [ ] 13.7. Run full component test suite: `npm test`

  - [ ] 13.8. Run type checking: `npm run type-check`

  - [ ] 13.9. **[PR BOUNDARY]** Submit PR 13 using `gt submit`

- [ ] 14. Component Dependencies Migration (PR 14)

  - [ ] 14.1. Create new branch using `gt create typescript-migration-part-14` (stacks on current branch)

  - [ ] 14.2. Convert any component helper files to TypeScript

  - [ ] 14.3. Convert component factory functions to TypeScript with proper return types

  - [ ] 14.4. Ensure all component dependencies have type definitions

  - [ ] 14.5. Update component imports to use TypeScript versions

  - [ ] 14.6. Verify no circular dependencies with type checking

  - [ ] 14.7. Run tests: `npm test`

  - [ ] 14.8. Run type checking: `npm run type-check`

  - [ ] 14.9. **[PR BOUNDARY]** Submit PR 14 using `gt submit`

- [ ] 15. Component Helpers Migration (PR 15)

  - [ ] 15.1. Create new branch using `gt create typescript-migration-part-15` (stacks on current branch)

  - [ ] 15.2. Convert component initialization helpers to TypeScript

  - [ ] 15.3. Convert component configuration helpers to TypeScript

  - [ ] 15.4. Add types for component options and configuration objects

  - [ ] 15.5. Ensure helper functions maintain backward compatibility

  - [ ] 15.6. Update all references to use typed helpers

  - [ ] 15.7. Run integration tests: `npm test`

  - [ ] 15.8. Run type checking: `npm run type-check`

  - [ ] 15.9. **[PR BOUNDARY]** Submit PR 15 using `gt submit`

- [ ] 16. Component Integration Migration (PR 16)

  - [ ] 16.1. Create new branch using `gt create typescript-migration-part-16` (stacks on current branch)

  - [ ] 16.2. Convert component communication interfaces to TypeScript

  - [ ] 16.3. Add types for inter-component messaging

  - [ ] 16.4. Ensure all component integrations are type-safe

  - [ ] 16.5. Convert any remaining component-related files to TypeScript

  - [ ] 16.6. Verify end-to-end component functionality

  - [ ] 16.7. Run full test suite: `npm test`

  - [ ] 16.8. Run type checking: `npm run type-check`

  - [ ] 16.9. **[PR BOUNDARY]** Submit PR 16 using `gt submit`

- [ ] 17. Entry Points Migration - Part 1 (PR 17)

  - [ ] 17.1. Create new branch using `gt create typescript-migration-part-17` (stacks on current branch)

  - [ ] 17.2. Convert `src/iframe.js` to TypeScript with iframe communication types

  - [ ] 17.3. Define iframe message types in `src/types/iframe.ts`

  - [ ] 17.4. Ensure iframe postMessage handlers are type-safe

  - [ ] 17.5. Update build configuration to handle TypeScript entry point

  - [ ] 17.6. Verify iframe functionality still works correctly

  - [ ] 17.7. Run integration tests: `npm test`

  - [ ] 17.8. Run type checking: `npm run type-check`

  - [ ] 17.9. **[PR BOUNDARY]** Submit PR 17 using `gt submit`

- [ ] 18. Entry Points Migration - Part 2 (PR 18)

  - [ ] 18.1. Create new branch using `gt create typescript-migration-part-18` (stacks on current branch)

  - [ ] 18.2. Convert `src/ui.js` to TypeScript with UI initialization types

  - [ ] 18.3. Define UI configuration interface in `src/types/ui.ts`

  - [ ] 18.4. Ensure UI factory functions have proper return types

  - [ ] 18.5. Update build outputs for TypeScript UI module

  - [ ] 18.6. Verify UI initialization works with existing integrations

  - [ ] 18.7. Run UI tests: `npm test`

  - [ ] 18.8. Run type checking: `npm run type-check`

  - [ ] 18.9. **[PR BOUNDARY]** Submit PR 18 using `gt submit`

- [ ] 19. Entry Points Migration - Part 3 (PR 19)

  - [ ] 19.1. Create new branch using `gt create typescript-migration-part-19` (stacks on current branch)

  - [ ] 19.2. Convert `src/buybutton.js` main entry to TypeScript

  - [ ] 19.3. Convert `src/updater.js` to TypeScript with updater registry types

  - [ ] 19.4. Define main library interface in `src/types/buybutton.ts`

  - [ ] 19.5. Ensure public API maintains exact same interface

  - [ ] 19.6. Update build to generate proper UMD bundle from TypeScript

  - [ ] 19.7. Verify examples and demos still work correctly

  - [ ] 19.8. Run full test suite: `npm test`

  - [ ] 19.9. Run type checking: `npm run type-check`

  - [ ] 19.10. **[PR BOUNDARY]** Submit PR 19 using `gt submit`

- [ ] 20. Test Files Migration - Part 1 (PR 20)

  - [ ] 20.1. Create new branch using `gt create typescript-migration-part-20` (stacks on current branch)

  - [ ] 20.2. Update Jest configuration to handle TypeScript test files

  - [ ] 20.3. Convert utility test files in `test/unit/utils/` to TypeScript

  - [ ] 20.4. Add @types/jest if not already installed

  - [ ] 20.5. Ensure test assertions have proper types

  - [ ] 20.6. Verify tests still pass: `npm test`

  - [ ] 20.7. Run type checking on test files: `npm run type-check`

  - [ ] 20.8. **[PR BOUNDARY]** Submit PR 20 using `gt submit`

- [ ] 21. Test Files Migration - Part 2 (PR 21)

  - [ ] 21.1. Create new branch using `gt create typescript-migration-part-21` (stacks on current branch)

  - [ ] 21.2. Convert view component test files to TypeScript

  - [ ] 21.3. Convert updater component test files to TypeScript

  - [ ] 21.4. Ensure test mocks have proper types

  - [ ] 21.5. Verify test coverage remains the same

  - [ ] 21.6. Run view and updater tests: `npm test`

  - [ ] 21.7. Run type checking: `npm run type-check`

  - [ ] 21.8. **[PR BOUNDARY]** Submit PR 21 using `gt submit`

- [ ] 22. Test Files Migration - Part 3 (PR 22)

  - [ ] 22.1. Create new branch using `gt create typescript-migration-part-22` (stacks on current branch)

  - [ ] 22.2. Convert main component test files to TypeScript

  - [ ] 22.3. Add types for test fixtures and helpers

  - [ ] 22.4. Ensure component mocks are properly typed

  - [ ] 22.5. Verify all component tests pass

  - [ ] 22.6. Run component tests: `npm test`

  - [ ] 22.7. Run type checking: `npm run type-check`

  - [ ] 22.8. **[PR BOUNDARY]** Submit PR 22 using `gt submit`

- [ ] 23. Test Files Migration - Part 4 (PR 23)

  - [ ] 23.1. Create new branch using `gt create typescript-migration-part-23` (stacks on current branch)

  - [ ] 23.2. Convert integration test files to TypeScript

  - [ ] 23.3. Add types for integration test scenarios

  - [ ] 23.4. Ensure end-to-end test flows are type-safe

  - [ ] 23.5. Verify integration tests pass

  - [ ] 23.6. Run integration tests: `npm test`

  - [ ] 23.7. Run type checking: `npm run type-check`

  - [ ] 23.8. **[PR BOUNDARY]** Submit PR 23 using `gt submit`

- [ ] 24. Test Files Migration - Part 5 (PR 24)

  - [ ] 24.1. Create new branch using `gt create typescript-migration-part-24` (stacks on current branch)

  - [ ] 24.2. Convert entry point test files to TypeScript

  - [ ] 24.3. Convert iframe test files to TypeScript

  - [ ] 24.4. Add types for test environment setup

  - [ ] 24.5. Verify entry point tests pass

  - [ ] 24.6. Run tests: `npm test`

  - [ ] 24.7. Run type checking: `npm run type-check`

  - [ ] 24.8. **[PR BOUNDARY]** Submit PR 24 using `gt submit`

- [ ] 25. Test Files Migration - Part 6 (PR 25)

  - [ ] 25.1. Create new branch using `gt create typescript-migration-part-25` (stacks on current branch)

  - [ ] 25.2. Convert any remaining test files to TypeScript

  - [ ] 25.3. Convert test helper utilities to TypeScript

  - [ ] 25.4. Add type checking for test files to CI pipeline

  - [ ] 25.5. Ensure 100% of tests are in TypeScript

  - [ ] 25.6. Run full test suite: `npm test`

  - [ ] 25.7. Run type checking on all tests: `npm run type-check`

  - [ ] 25.8. **[PR BOUNDARY]** Submit PR 25 using `gt submit`

- [ ] 26. Strict Type Enforcement and Cleanup (PR 26)

  - [ ] 26.1. Create new branch using `gt create typescript-migration-part-26` (stacks on current branch)

  - [ ] 26.2. Remove all temporary type assertions (as Type) used during migration

  - [ ] 26.3. Eliminate any remaining `any` types in the codebase

  - [ ] 26.4. Remove `allowJs: true` from tsconfig.json

  - [ ] 26.5. Enable additional strict checks if not already enabled (strictNullChecks, noImplicitAny, etc.)

  - [ ] 26.6. Make TypeScript type checking a blocking CI check

  - [ ] 26.7. Update documentation to reflect TypeScript usage

  - [ ] 26.8. Run final verification: `npm test && npm run type-check && npm run build`

  - [ ] 26.9. **[PR BOUNDARY]** Submit PR 26 using `gt submit --stack` to submit entire stack