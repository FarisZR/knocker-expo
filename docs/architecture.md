# Knocker App: Software Architecture

## 1. Overview

The Knocker app uses a small, modular architecture optimized for testability and rapid iteration. The app centralizes its primary user flow in a single `HomeScreen` (`app/index.tsx`) that consolidates configuration and action into one view, while services in `src/services/` handle external interactions.

## 2. Directory Structure (relevant files)

```
/
├── app/
│   └── index.tsx               # Single HomeScreen combining Main + Setup
├── src/
│   └── services/
│       ├── knocker.ts          # API call logic for whitelisting
│       ├── backgroundKnocker.ts# Background task wrapper & registration helpers
│       ├── knockOptions.ts     # TTL/IP normalization helper used by knock()
│       └── storage.ts          # Small wrapper around secure/local storage
└── docs/
```

## 3. Core Components & Responsibilities

- UI (single page)
  - `app/index.tsx` (HomeScreen)
    - Reads persisted credentials on mount.
    - Shows a prominent "Knock" action and an inline Settings panel.
    - Performs an automatic knock on load if endpoint and token are present.
    - Persists settings and conditionally registers background tasks on Save.
    - Persists settings-open state (`settings-open`) so panel collapse persists across restarts.

- Services
  - `src/services/knocker.ts`
    - Encapsulates HTTP interactions and response/error normalization.
  - `src/services/knockOptions.ts`
    - Centralizes TTL and IP parsing/validation so both UI and background task pass consistent options to `knock()`.
  - `src/services/backgroundKnocker.ts`
    - Contains the task entrypoint used by `expo-task-manager` and helpers to register/unregister background fetch.
    - Guards registration/unregistration and runtime execution to be tolerant of web/test environments and mocked APIs.

## 4. Data Flow

1. Configuration (Save):
   - User edits endpoint/token/ttl/ip/background toggle.
   - Save writes to persistent storage keys.
   - If background enabled and platform is native, register background task; otherwise unregister.

2. Manual / Immediate Knock:
   - User presses "Knock" button.
   - HomeScreen reads current values (or uses in-memory state) and calls `knock()` with options from `knockOptions.ts`.

3. Automatic / Background Knock:
   - On launch, HomeScreen triggers a knock if credentials exist.
   - Background task (if registered) executes `backgroundKnocker` independently; it fetches stored credentials and calls `knock()` (passes options only when TTL/IP are present).

## 5. Persistence & Keys

- `knocker-endpoint`
- `knocker-token`
- `knocker-ttl`
- `knocker-ip`
- `background-service-enabled`
- `settings-open`
- `background-notifications-enabled`
- `background-last-run`

## 6. Background Tasks & Platform Guards

- The app avoids registering background tasks on web builds (`Platform.OS === 'web'`).
- Registration helpers are defensive: they return early when required APIs are missing (useful for CI/test environments).
- When background task runs, it only passes TTL/IP options to the `knock()` call if they are present and valid.
- The Android scheduler has a minimum interval of 15 minutes (900 seconds). If a TTL below this threshold is set, the background service will not run and a warning will be shown to the user.
- Each background execution stores a status payload (`background-last-run`) so the UI can surface stale/failing runs and prompt for corrective action (for example disabling battery optimizations on Android).
- If a run fails or the OS reports restrictions while the app is backgrounded on Android, the HomeScreen exposes a guided CTA that opens the system battery optimization settings via `expo-intent-launcher`.

## 7. Testing & Migration Considerations

- Tests were adjusted to avoid brittle assertions that rely on transient UI animations; prefer verifying calls to `knock()` and storage interactions.
- During migration from tabs/screens to the single HomeScreen, placeholder re-export files were kept for compatibility; schedule a follow-up cleanup to remove them once imports are updated.
- Keep background task registration helpers tolerant to mocked environments to avoid test flakiness.
