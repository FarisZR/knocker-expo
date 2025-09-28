# AGENTS.md

This file provides guidance to agents when working with code in this repository.

- Tests: run npm test at repo root. To run a single file use npm test <path/to/file.test.ts> (example: npm test src/services/knocker.test.ts).
- Jest setup: preset is jest-expo and [`jest-setup.js`](jest-setup.js:1) mocks `expo-task-manager` — keep that mock when adding tests that touch TaskManager.
- Jest transform: `transformIgnorePatterns` is customized in [`jest.config.js`](jest.config.js:4); if a native dependency fails tests, update this list.
- Storage: [`src/services/storage.ts`](src/services/storage.ts:1) uses localStorage on web and `expo-secure-store` on native — tests assert SecureStore mocks; do not replace behavior without updating tests.
- Background task: task id is `background-knocker-task`; registration is defensive, uses a 15-minute interval, and swallows unsupported-platform errors. See [`src/services/backgroundKnocker.ts`](src/services/backgroundKnocker.ts:9).
- Knock API: POST to `${endpoint}/knock` with header `X-Api-Key`. Error messages and the special-case 403 wording are asserted in tests — changing those strings will break tests. See [`src/services/knocker.ts`](src/services/knocker.ts:21).
- Option normalization: TTL/IP parsing is centralized in [`src/services/knockOptions.ts`](src/services/knockOptions.ts:11); background task only forwards options when valid.
- Reset script: `npm run reset-project` may move/delete app/, components/, hooks/, constants/, scripts/ into `/app-example`. Inspect [`scripts/reset-project.js`](scripts/reset-project.js:13) before running.
- TypeScript: extends `expo/tsconfig.base`, "strict": true, and uses path alias `"@/*": ["./*"]` — update tsconfig if adding new path aliases. See [`tsconfig.json`](tsconfig.json:2).
- Lint: uses Expo's flat ESLint config and ignores `dist/*` in [`eslint.config.js`](eslint.config.js:5).
- Network tests: service tests use axios-mock-adapter (e.g. [`src/services/knocker.test.ts`](src/services/knocker.test.ts:16)). Prefer axios mocks for network behavior to avoid flaky tests.
- Test stability: many tests rely on exact error/message strings and mocked platform APIs (SecureStore, TaskManager). When refactoring behavior or messages, update affected tests.
