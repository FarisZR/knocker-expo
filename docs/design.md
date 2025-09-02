# Knocker App: Design & UI/UX

## 1. Design Philosophy

The Knocker app prioritizes a fast, low-friction workflow for performing a single primary action: "knock" to whitelist the current IP. The UI is intentionally minimal — reduce taps, surface only essential controls, and make configuration inline and discoverable.

Key goals:
- Single, focused Home screen where the user can knock and configure settings inline.
- High contrast and accessible text, especially for error states (dark & light themes).
- Predictable behavior for background tasks and platform-specific controls.

## 2. Color, Typography & Accessibility

- Use the project's cross-platform color tokens (see [`constants/Colors.ts`](constants/Colors.ts:1)) and the system font for consistency.
- Error and status text must meet contrast requirements:
  - In light mode use the designated error token (`Colors.light.error`).
  - In dark mode prefer light-on-dark error text (e.g., white) to ensure readability.
- Support useColorScheme() to switch styles automatically.

## 3. Single-Page HomeScreen

The app is now a single cohesive page, exported from [`app/index.tsx`](app/index.tsx:1), combining the previous `MainScreen` and `SetupScreen`:

- Primary focus: a prominent "Knock" button with an animated status pill below it.
- Settings are an inline, collapsible panel directly beneath the action (no separate navigation):
  - Fields: Endpoint (server URL), API token (secure), TTL (optional), IP (optional).
  - Background service toggle (Switch) is rendered only on native platforms; hidden on web (`Platform.OS === 'web'`).
  - The settings panel defaults to open when required credentials (endpoint or token) are missing, otherwise it defaults to collapsed.
  - The collapse state is persisted with the `settings-open` storage key.

Save behavior:
- Persist values to storage keys (see Storage Keys section).
- Register/unregister background task only when not on web.
- If endpoint & token are present after save, an immediate knock is triggered and the settings panel is auto-collapsed on success.

UX & animations:
- Collapse/expand uses LayoutAnimation for smooth layout changes; status pill uses Animated opacity for transient results.
- Error messages use theme-aware colors for accessibility.

## 4. Components & Patterns

- StyledButton / StyledCard / StyledTextInput (re-usable UI primitives).
- Inline Settings form (single-card layout).
- Animated status pill for knock results.
- Utilities:
  - `src/services/knockOptions.ts` — normalizes TTL & IP into options for `knock()`.
  - `src/services/storage.ts` — small wrapper around SecureStore/local storage.

## 5. Storage Keys

Persistent keys used by the app:
- `knocker-endpoint` — server URL
- `knocker-token` — API token
- `knocker-ttl` — optional TTL value
- `knocker-ip` — optional IP override
- `background-service-enabled` — boolean for background registration
- `settings-open` — boolean for persisted settings collapse state

## 6. Migration Notes

- During migration from a multi-screen (tabs) layout to a single HomeScreen, the repository keeps harmless re-export placeholder files for `src/screens/MainScreen.tsx` and `src/screens/SetupScreen.tsx` to avoid breaking imports/tests. These are safe to remove later once callers/imports are cleaned up.
- Tests were updated to be resilient to animation-driven transient UI states (prefer asserting mock calls to `knock()` rather than relying on exact layout text during animations).

## 7. Visual Verification

Checklist for manual verification:
- Settings panel opens automatically when credentials missing.
- Background service toggle is hidden on web builds.
- Save persists values and triggers auto-knock when credentials are present.
- Error text is readable in both dark and light color schemes.
