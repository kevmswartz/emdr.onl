# High-Level Overview
- `src/App.vue` drives the SPA by toggling a `currentView` string instead of using Vue Router; it renders the home screen, journaling steps, session canvas, history dashboard, or feedback form based on that flag while persisting user settings via localStorage.
- `src/components/SessionView.vue` owns the fullscreen experience (canvas animation, audio pan, haptics, countdown, controls, wake lock, fullscreen, keyboard shortcuts) and coordinates lower-level composables such as `useAudio`, `useMovementPattern`, `useWakeLock`, and `useHaptics`.
- IndexedDB persistence lives in `src/composables/useSessionStorage.ts`, which exposes reactive `sessions`, CRUD helpers, computed statistics, and JSON/CSV export helpers that the history view consumes.
- Journaling (`PreSessionJournal.vue`, `PostSessionJournal.vue`), feedback (`FeedbackView.vue`), and notifications (`Toast.vue`) are mostly presentational, but `App.vue` orchestrates their flow directly, assuming modern Web APIs (AudioContext, Fullscreen, Wake Lock, crypto.randomUUID, IndexedDB) are always available.
- PWA support is attempted both via a manually-authored `public/sw.js` and the `vite-plugin-pwa` config, yet there is no router/state awareness of URLs, deep links, or degraded UX when those browser capabilities are missing.

## Correctness / Bugs
- `src/components/SessionView.vue:74-78` renders the timer text with a literal `aria-label="`Time remaining: ${timeRemaining}`"`, so assistive tech never hears the actual countdown value; bind the attribute (`:aria-label=``Time remaining: ${timeRemaining}```) so screen-reader users receive updates.
- `src/components/SessionView.vue:381-405` creates the countdown interval inside `startCountdown()` but never stores/clears it when the session is canceled or the component unmounts, so the callback (and device vibrations/audio init) continue after the user has exited; store the interval id in a ref and clear it inside `stopSession()` and `onUnmounted()`.
- `src/App.vue:303-339` shows a “Session saved!” toast after writing to IndexedDB, but `finishSession()` immediately overrides it with “Session complete!”, making it impossible for users to know whether persistence worked; delay the completion toast or queue toasts so the success message is visible.
- `src/components/Toast.vue:23-34` watches `props.message`, but Vue won’t re-run the watcher when the same string is assigned twice, so repeated deletions/error states that reuse identical copy never display; wrap the message with a monotonically increasing id or clear the ref before setting it so identical messages retrigger the animation.
- `src/App.vue:318-325` calls `crypto.randomUUID()` with no fallback; older browsers and embedded WebViews still lack that API and will throw, preventing journaling-enabled sessions from saving at all; guard the call with `crypto?.randomUUID?.()` and fall back to a deterministic helper (e.g., nanoid or timestamp + random suffix).

## Edge Cases & Error Handling
- `src/components/FeedbackView.vue:146-157` treats any resolved `fetch('/')` as success without checking `response.ok`, so Netlify form errors (400/500) still show the thank-you screen; inspect the response status/body and surface failures to the user.
- `src/App.vue:379-392` awaits `loadSessions()` without try/catch, so IndexedDB failures (private browsing, quota exceeded) become unhandled rejections and the UI never surfaces the friendly `useSessionStorage.error` message; wrap the call and display an inline alert/toast.
- `src/composables/useWakeLock.ts:6-34` never listens for `visibilitychange`/`release` events, so when the OS pauses the wake lock (common on mobile when the screen dims) it is never re-requested and the screen can sleep mid-session; attach handlers that re-acquire on visibility gain or sentinel `release`.
- `src/components/SessionView.vue:441-447` only attempts `element.requestFullscreen()`; iOS Safari still requires the `webkitRequestFullscreen` prefix, so fullscreen silently fails on many mobile devices; detect prefixed APIs and provide fallbacks or degrade gracefully.
- `src/App.vue:368-377` writes to localStorage without guarding for `QuotaExceededError` or disabled storage, meaning privacy-mode browsers can throw and break slider interactions; wrap the write in try/catch and disable persistence in unsupported contexts.

## Security & Privacy
- `src/composables/useSessionStorage.ts:156-170` exports CSV rows verbatim (even when notes start with `=`, `+`, `-`, `@`), enabling CSV injection when therapists open the file in Excel/Sheets; strip leading formula characters or prefix cells with `'` before quoting them.
- `src/composables/useSessionStorage.ts:1-194` stores highly sensitive journal data in plaintext IndexedDB with no optional passcode or encryption despite marketing the app as “privacy-focused”; at minimum offer an opt-in encryption key or clear messaging plus a quick-wipe option so another browser user cannot simply inspect DevTools to read trauma notes.
- `src/components/FeedbackView.vue:40-43` implements the Netlify honeypot as a `type="hidden"` field, which bots never fill, leaving the form wide open to spam/abuse; replace it with a visually-hidden text input (e.g., CSS-hidden label/input) so automated submissions can be filtered server-side.

## Performance
- `src/components/SessionView.vue:240-375` resets `canvas.width/height = window.innerWidth/Height` every animation frame, forcing reallocation and clearing the drawing context 60 times per second; only resize when the viewport actually changes (listen to `resize`/`orientationchange`) and keep per-frame work to drawing operations.
- `src/composables/useSessionStorage.ts:70-100` calls `loadSessions()` (which `getAll()`s and sorts the entire store) after every insert/delete, so the history list re-reads all records on each save and delete; update the local `sessions` array incrementally or use cursors to avoid O(n) work per mutation as the history grows.
- `src/App.vue:367-377` deep-watches the entire settings object and serializes it to JSON on every slider move, even though most sliders change a single primitive; persist only the specific field that changed or throttle writes more aggressively (e.g., requestIdleCallback) to avoid jank on low-end devices.

## Architecture & Design
- `src/App.vue:163-205` emulates navigation with manual `currentView` toggles, so there is no URL state, deep-linking, or browser history integration; move to Vue Router so “History”, “Feedback”, and journaling flows can be addressed directly and work with the back button.
- `src/components/SessionView.vue` mixes rendering, animation timing, accessibility announcements, audio setup, haptics, keyboard shortcuts, fullscreen, and wake lock management in one 450+ line component, making future changes error-prone; split responsibilities into smaller components/composables with clear boundaries.
- Both `vite.config.ts` (via `VitePWA`) and `public/sw.js` attempt to define a service worker, creating conflicting caching strategies and making it unclear which script actually registers; pick one approach, ensure it registers (via `virtual:pwa-register` or manual code), and delete the redundant SW to avoid double caching bugs.
- `src/App.vue:223-225` calls `useTheme()` purely for side effects yet never consumes the returned `prefersReducedMotion` or `isDarkMode` refs, so claimed accessibility hooks have no user-facing impact; either wire the values into components (e.g., disable haptics/animations when reduced motion is requested) or remove the dead code to avoid a false sense of compliance.

## Code Quality & Maintainability
- `src/components/FeedbackView.vue:146-154` grabs the DOM form via `document.querySelector`, which will break once another form is added and makes the component harder to test; use a Vue `ref` tied to the form element instead.
- `src/components/HistoryView.vue:62-74` hardcodes `toLocaleString('en-US', …)` and English copy, preventing localization or even respecting the user’s locale; derive locale from `navigator.language` or inject an i18n layer.
- `src/composables/useSessionStorage.ts:182-193` exposes an `error` ref, yet no component renders it, so debugging IndexedDB failures requires DevTools; surface the error in `HistoryView` or a global alert.
- User-facing copy (labels, error strings, emoji) is sprinkled across every component (`App.vue`, history, journaling, feedback) with no central source of truth, making consistent rewording or localization tedious; consolidate strings or introduce an i18n/messages module.

## Testing & DX
- `src/tests/composables/useAudio.test.ts` never imports `useAudio`; it merely asserts hard-coded numeric ranges, so regressions in oscillator creation, gain handling, or pan logic would pass unnoticed—replace it with tests that instantiate the composable and assert behavior.
- `src/tests/types/index.test.ts` recreates the type definitions it is “testing”, offering no protection against real bugs; delete it or replace it with runtime tests that exercise serialization/deserialization of sessions.
- There are zero tests covering the main flows (starting/stopping sessions, journaling persistence, IndexedDB failure handling, CSV/JSON export, Feedback submissions), so any regression in those areas will ship unnoticed; add component tests or Cypress-style integration coverage for the core journeys.
- The Netlify feedback form can’t be validated locally because `fetch('/')` simply returns the dev index.html, yet the UI still claims success; provide an environment flag to short-circuit submissions in dev or point to a mock endpoint so developers can verify failures.

## Top 5 Changes to Make First
1. Fix the session countdown/timer issues (bind the timer `aria-label`, clear the countdown interval on stop/unmount, and ensure toasts accurately reflect persistence) so core sessions behave reliably for all users.
2. Add real error handling where data is saved or loaded (catch IndexedDB failures, guard `crypto.randomUUID`, surface `useSessionStorage.error`, and make the feedback form check `response.ok`) to avoid silent data loss.
3. Sanitize and better protect exported/stored therapy data (neutralize CSV formula injection, provide optional encryption/passcode or at least stronger user warnings, and ensure the honeypot actually mitigates spam).
4. Resolve architectural inconsistencies by choosing a single service-worker/PWA strategy and introducing Vue Router so navigation, offline behavior, and installability work as documented.
5. Invest in meaningful automated tests around `useSessionStorage`, `SessionView`, and the feedback/journaling flows so regressions in animation, persistence, or exports are caught before release.
