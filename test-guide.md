# FogGui Test Guide

This guide explains how `.test.ts` files are organized and written in FogGui.

## Purpose

FogGui uses automated tests to validate core behavior in the application layer, especially:

- service helpers in `src/lib/`
- custom hooks in `src/hooks/`
- API route handlers in `src/app/api/`

Most tests are written with Vitest and use mocking to isolate the unit under test.

## Test Stack

- Test runner: Vitest
- DOM environment: `jsdom`
- React helpers: `@testing-library/react`
- DOM matchers: `@testing-library/jest-dom`
- Global test setup: `test/setup.ts`

The test configuration is defined in `vitest.config.ts`.

## File Naming And Location

Keep test files close to the code they verify.

- `src/lib/*.test.ts` for utility and integration-style library tests
- `src/hooks/*.test.ts` for hook tests
- `src/services/*.test.ts` for service-layer tests
- `src/app/api/**/route.test.ts` for API route handlers

Use the same base filename as the implementation when possible. For example, `fogApi.ts` is tested by `fogApi.test.ts`.

## Test Setup

The shared setup file does two important things:

- imports `@testing-library/jest-dom`
- runs `cleanup()` and `vi.restoreAllMocks()` after each test

This keeps React renders isolated and prevents mocks from leaking between tests.

## Common Patterns

### 1. Mock dependencies before importing the module under test

When a module depends on another internal module, mock the dependency first and then import the module being tested.

This pattern is especially important for modules that read environment variables at import time.

Example behavior already used in FogGui:

- mock `fetch` with `vi.stubGlobal("fetch", vi.fn())`
- reset modules with `vi.resetModules()` when import-time behavior matters
- verify errors with `await expect(import("./fogApi")).rejects.toThrow(...)`

### 2. Use `Request` objects for route handlers

API route tests call exported `GET`, `POST`, or `DELETE` handlers directly with a real `Request` instance.

This keeps the tests fast and avoids starting a server.

Example approach:

- create a `Request` with the route URL
- pass JSON in the request body when needed
- assert on `res.status`
- parse `await res.json()` when checking response payloads

### 3. Use `renderHook` for custom hooks

Hook tests usually rely on `renderHook()` and `waitFor()` from `@testing-library/react`.

Typical assertions include:

- loading state transitions
- returned data from mocked service calls
- error handling when a mocked dependency rejects

### 4. Mock services instead of network or database calls

Most tests isolate logic by mocking the lowest practical dependency:

- service functions such as `getGroups()` or `getHosts()`
- database access helpers such as `openDb()`
- external requests via `fetch`
- auth or hashing libraries such as `bcryptjs`

## Writing Good `.test.ts` Files

Keep each test focused on one behavior. Prefer small assertions that describe the expected contract of the function or route.

Recommended structure:

1. Arrange: set up mocks, inputs, and environment variables
2. Act: call the function, hook, or route handler
3. Assert: check the result, side effects, and important interactions

Use descriptive test names that state the observable behavior, not the implementation detail.

Good examples:

- `throws at import time when base URL is missing`
- `POST returns 400 when missing required payload`
- `useHosts exposes service errors`

## Environment Notes

Some tests depend on environment variables. When a test changes `process.env`, save the original values and restore them in `afterEach()`.

If a test mutates global behavior, clean it up with one of the following:

- `vi.restoreAllMocks()`
- `vi.clearAllMocks()`
- `vi.resetModules()`
- `vi.stubGlobal()` paired with cleanup

## Running Tests

Use the npm scripts defined in `package.json`:

- Run the full suite: `npm run test`
- Watch mode: `npm run test:watch`
- Vitest UI: `npm run test:ui`
- Coverage: `npm run test:coverage`

The coverage report is generated under the project’s coverage output directory.

## Practical Checklist

Before you commit a new or updated test, confirm the following:

- the test file follows the local naming convention
- mocks are declared before importing the module under test when needed
- async behavior is awaited explicitly
- environment changes are restored after the test
- the test passes with `npm run test`

## Quick Reference

- Shared setup: `test/setup.ts`
- Vitest config: `vitest.config.ts`
- Existing test patterns: `src/lib/`, `src/hooks/`, and `src/app/api/`
