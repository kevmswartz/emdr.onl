# Comprehensive Code Review: EMDR.online

**Review Date:** 2025-11-16
**Reviewer:** Claude (AI Code Reviewer)
**Codebase Version:** commit c8fce6b

---

## Executive Summary

**Overall Code Quality: 7/10**

EMDR.online is a **well-architected, privacy-focused Vue 3 application** with clean composable patterns and solid TypeScript usage. The codebase demonstrates thoughtful design decisions, particularly around privacy and accessibility. However, there are **significant gaps in testing, inconsistencies between documentation and implementation, and several architectural decisions that need clarification or correction**.

This is a **production-ready app** for its current feature set, but requires attention to technical debt before scaling to Phase 4/5 features.

---

## Project Map

### Overview
- **Tech Stack:** Vue 3.5 + TypeScript 5.7 + Vite 6 + Tailwind 3.4
- **State Management:** Reactive refs + provide/inject + composables
- **Navigation:** Vue Router 4.6 (despite docs claiming state-based nav)
- **Storage:** LocalStorage (settings) + IndexedDB (sessions)
- **Size:** ~2,500 LOC across 25 files
- **Complexity:** Medium (well-modularized but growing)

### Key Domains
1. **Session Management** (`SessionView.vue`, `useAudio`, `useMovementPattern`) - Core BLS animation loop
2. **Data Persistence** (`useSessionStorage`) - IndexedDB wrapper for session history
3. **User Input** (Journal components, `HomeView`) - Forms and settings UI
4. **Browser API Wrappers** (`useWakeLock`, `useHaptics`, `useTheme`) - Hardware integration
5. **Navigation** (`router/index.ts`, `App.vue`) - Routing and state orchestration

---

## What's Working Well

✅ **Exceptional Privacy Design**
- Zero external network requests after load
- No analytics, tracking, or telemetry
- All data local-only (LocalStorage + IndexedDB)
- CSV export includes formula injection protection (`sanitizeCSVCell`)

✅ **Clean Composable Architecture**
- Each composable has single responsibility
- Pure functions in `useMovementPattern` (no side effects)
- Proper lifecycle cleanup (`onUnmounted` hooks)
- Good separation of concerns

✅ **Strong TypeScript Discipline**
- Strict mode enabled with `noUncheckedIndexedAccess`
- Comprehensive type definitions in `src/types/index.ts`
- Proper use of union types for `MovementPattern` and `SoundType`
- Generic event emitters with type safety

✅ **Accessibility Foundations**
- ARIA labels throughout UI
- Keyboard shortcuts with proper preventDefault
- Screen reader announcements in SessionView
- Semantic HTML with proper roles
- Dark mode system preference detection

✅ **Modern Build Tooling**
- Vite 6 for fast HMR
- TypeScript compilation with `vue-tsc`
- Tailwind CSS with JIT mode
- PWA plugin configured (though not fully implemented)

✅ **Excellent Documentation**
- `CLAUDE.md` provides clear developer guidance
- `README.md` is comprehensive and well-structured
- Inline comments explain non-obvious logic
- Type definitions serve as documentation

✅ **Graceful Degradation**
- Feature detection for Web APIs (Wake Lock, Vibration, Audio)
- Fallback UUID generation for older browsers
- Error messages guide users when APIs unavailable

---

## Top Risks / Concerns

### 🔴 CRITICAL

#### 1. Documentation-Implementation Mismatch: Vue Router vs State-Based Navigation
- **Severity:** High
- **Context:**
  - `CLAUDE.md` line 223 claims: "Simple state-based navigation without Vue Router"
  - `main.ts` line 4 imports and uses Vue Router
  - `router/index.ts` defines full routing table
  - `App.vue` uses `<router-view />` not conditional view rendering
- **Why it matters:**
  - Misleads developers and AI assistants
  - Adds unnecessary dependency if state-based nav was intended
  - Creates confusion about architecture decisions
- **Recommendation:**
  - **Either:** Update docs to acknowledge Vue Router usage and explain why
  - **Or:** Remove Vue Router and implement true state-based navigation as documented
  - Current implementation suggests Router was added later and docs weren't updated

#### 2. Minimal Test Coverage with Weak Assertions
- **Severity:** High
- **Context:**
  - Only 3 test files, totaling ~150 LOC
  - `useAudio.test.ts` tests value ranges, not actual audio functionality
  - `useMovementPattern.test.ts` is solid but isolated
  - No component tests, integration tests, or E2E tests
  - No test for critical session save flow, IndexedDB operations, or canvas rendering
- **Why it matters:**
  - Therapeutic app requires high reliability (used in clinical settings)
  - No regression protection when adding Phase 4/5 features
  - Core flows (session save, journal merge, distress calculation) untested
  - Canvas animation logic is complex but completely untested
- **Recommendation:**
  - **Priority 1:** Add integration tests for session flow (start → journal → save)
  - **Priority 2:** Test IndexedDB operations with mock database
  - **Priority 3:** Add Vitest UI tests for components (especially SessionView)
  - **Target:** 60%+ coverage on critical paths before Phase 4

#### 3. Shared IndexedDB Instance Causes Multi-Tab Data Corruption Risk
- **Severity:** High
- **Context:** `useSessionStorage.ts` line 8
  ```typescript
  let dbInstance: IDBDatabase | null = null
  ```
  - Module-level singleton shared across all composable instances
  - Multiple tabs could conflict on writes
  - No version conflict handling when schema changes
  - No stale connection detection
- **Why it matters:**
  - User opens app in two tabs → race conditions on session save
  - One tab upgrades schema → other tab crashes
  - Lost journal data during tab conflicts
- **Recommendation:**
  - Remove singleton pattern, create fresh connection per operation
  - Add version conflict error handling with user notification
  - Consider `versionchange` event listener to close stale connections
  - Test multi-tab scenario explicitly

### 🟡 HIGH PRIORITY

#### 4. Memory Leak in Toast Component
- **Severity:** Medium
- **Context:** `Toast.vue` line 21-34
  ```typescript
  let timeout: number
  watch(() => props.message, (newMessage) => {
    if (newMessage) {
      visible.value = true
      clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        visible.value = false
      }, props.duration || 3000)
    }
  })
  ```
  - No `onUnmounted` cleanup
  - Timeout can outlive component if unmounted during display
- **Why it matters:**
  - Rapid navigation could accumulate orphaned timers
  - Minor leak but compounds over long sessions
- **Recommendation:**
  ```typescript
  onUnmounted(() => {
    clearTimeout(timeout)
  })
  ```

#### 5. SessionView Prop Mutation Anti-Pattern
- **Severity:** Medium
- **Context:** `SessionView.vue` lines 194-215
  - Receives `settings` as prop
  - Directly mutates `settings.value.speed` and `settings.value.volume` in keyboard shortcuts
  - Props should be read-only; mutations should emit events
- **Why it matters:**
  - Violates Vue best practices
  - Makes data flow unclear
  - Could break if parent expects immutability
- **Recommendation:**
  - Emit events instead: `emit('updateSpeed', newSpeed)`
  - Let parent handle state updates
  - Or use `v-model` for two-way binding explicitly

#### 6. Missing Route Guards Allow Invalid State
- **Severity:** Medium
- **Context:** `router/index.ts`
  - No guards prevent accessing `/session` directly without starting session
  - No validation that journaling state matches enabled setting
  - User could bookmark `/post-journal` and access it without pre-journal
- **Why it matters:**
  - Corrupts session flow assumptions
  - Could save incomplete sessions to IndexedDB
  - Breaks distress reduction calculation
- **Recommendation:**
  ```typescript
  router.beforeEach((to, from, next) => {
    if (to.path === '/session' && !sessionStartTime.value) {
      next('/') // Redirect to home if no active session
    }
    // Add other guards for journal routes
  })
  ```

#### 7. Debounced Settings Save Never Triggers
- **Severity:** Medium
- **Context:** `App.vue` lines 169-174, 215
  - `debouncedSaveSettings` function defined with 300ms delay
  - Watcher calls debounced function on every settings change
  - **But:** 300ms debounce means rapid changes (e.g., dragging slider) cause multiple debounce resets
  - **Result:** Settings may not save if user navigates away within 300ms of last change
- **Why it matters:**
  - User adjusts volume slider → navigates away quickly → settings lost
  - Confusing UX ("Why didn't my changes save?")
- **Recommendation:**
  - Add `onBeforeUnmount(() => saveSettings())` to ensure final save
  - Or reduce debounce to 150ms
  - Or use `leading + trailing` debounce strategy

### 🟢 MEDIUM PRIORITY

#### 8. Error Boundaries Missing in Critical Flows
- **Severity:** Medium
- **Context:**
  - `SessionView.vue` animation loop has no try/catch around canvas operations
  - `handlePostJournalSave` catches errors but still navigates away (line 122)
  - No global error handler for uncaught promise rejections
- **Why it matters:**
  - Canvas errors could crash entire session (lost therapeutic work)
  - Failed session save still shows "Session complete!" toast
  - User unaware of data loss
- **Recommendation:**
  ```typescript
  // In animate() function
  try {
    // canvas operations
  } catch (err) {
    console.error('Canvas error:', err)
    emit('showToast', 'Animation error - stopping session')
    stopSession()
  }
  ```
  - Show persistent error message if session save fails
  - Add global Vue error handler

#### 9. Type Safety Gaps with `as any` and Non-Null Assertions
- **Severity:** Low
- **Context:**
  - `useAudio.ts` line 12: `(window as any).webkitAudioContext`
  - `FeedbackView.vue` line 160: `new URLSearchParams(data as any)`
  - Missing null checks despite `noUncheckedIndexedAccess`
- **Why it matters:**
  - Defeats purpose of strict TypeScript
  - Could miss runtime errors in Safari/older browsers
- **Recommendation:**
  - Define proper types for webkit prefixes
  - Use FormData iterator or explicit field access instead of `as any`

#### 10. Accessibility: Reduced Motion Not Implemented
- **Severity:** Medium
- **Context:**
  - `useTheme.ts` detects `prefers-reduced-motion` but never uses it
  - Canvas animations don't respect reduced motion preference
  - Easing functions always applied
- **Why it matters:**
  - Violates WCAG 2.1 criterion 2.3.3 (Motion from Interactions)
  - Could trigger vestibular disorders in sensitive users
  - Promised in CLAUDE.md but not delivered
- **Recommendation:**
  ```typescript
  // In SessionView.vue
  const easedProgress = prefersReducedMotion.value
    ? movementProgress.value  // Linear, no easing
    : easeInOutQuad(movementProgress.value)
  ```
  - Disable bounce pattern entirely if reduced motion
  - Show warning toast: "Animations reduced for accessibility"

---

## Detailed Findings

### 1. Architecture & Design

#### ✅ Strengths
- **Composable separation:** Each browser API wrapped in dedicated composable
- **Pure functions:** `useMovementPattern` is stateless, testable
- **Single Responsibility:** Components focus on one concern each

#### ⚠️ Issues

##### Provide/Inject Overuse Creates Implicit Dependencies
- **Context:** `App.vue` lines 176-192
  - 13 separate `provide()` calls for functions and state
  - Child components have invisible dependencies on parent state
  - Hard to track data flow
- **Impact:**
  - Difficult to refactor components in isolation
  - Type safety lost (inject requires manual typing)
  - Breaks component portability
- **Fix:**
  - Use explicit props and emits for simple parent-child communication
  - Reserve provide/inject for app-level config (theme, i18n)
  - Or adopt Pinia for structured state management

##### Circular Pattern Never Resets, Others Do
- **Context:** `SessionView.vue` lines 286-290
  ```typescript
  if (settings.value.pattern === 'circular') {
    movementProgress.value = movementElapsed / movementDuration
  } else {
    movementProgress.value = Math.min(movementElapsed / movementDuration, 1)
  }
  ```
  - Circular pattern continues indefinitely (modulo)
  - Other patterns reset direction at completion
  - Inconsistent behavior between patterns
- **Impact:** Circular pattern feels different (no distinct "cycles")
- **Fix:** Document this intentional design choice or normalize behavior

##### Bounce Pattern Returns Static Position
- **Context:** `useMovementPattern.ts` lines 45-50
  - `calculatePosition('bounce', ...)` always returns `{x: 0.5, y: 0.5}`
  - Actual bounce logic lives in `SessionView.vue` (lines 303-330)
  - Breaks composable pattern (movement logic should be in composable)
- **Impact:**
  - Violates single responsibility
  - Harder to test bounce separately
  - Inconsistent with other patterns
- **Fix:** Move bounce physics to `useMovementPattern` composable

---

### 2. Correctness & Bugs

#### Missing Validation on Journal Entry Lengths
- **Context:** Journal components set `maxlength` on textareas but don't validate on submit
- **Impact:** Could theoretically save >500 chars if maxlength bypassed (dev tools)
- **Fix:** Add validation before save:
  ```typescript
  if (journal.targetMemory && journal.targetMemory.length > 500) {
    emit('showToast', 'Entry too long')
    return
  }
  ```

#### Race Condition in Audio Initialization
- **Context:** `SessionView.vue` line 409
  - `initAudio()` called after countdown completes
  - But keyboard shortcuts can adjust volume during countdown
  - Volume changes have no effect until audio initialized
- **Impact:** User presses `[` during countdown → no feedback → confusion
- **Fix:** Initialize audio earlier or disable volume shortcuts until initialized

#### CSV Export Double-Escapes Notes Field
- **Context:** `useSessionStorage.ts` lines 169-172
  ```typescript
  const notes = s.journal?.notes || ''
  const escapedNotes = notes.replace(/"/g, '""')
  const sanitizedNotes = sanitizeCSVCell(escapedNotes)
  ```
  - Escapes quotes for CSV, then sanitizes for formula injection
  - But sanitization adds `'` prefix if starts with `=+-@`
  - Result: Notes like `"Test"` become `'""Test""`
- **Impact:** Corrupted notes in exported CSV
- **Fix:** Apply sanitization BEFORE quote escaping

---

### 3. Performance & Scalability

#### Animation Loop Doesn't Use DeltaTime
- **Context:** `SessionView.vue` line 248
  - Uses `performance.now()` as currentTime
  - Calculates elapsed time from start
  - But doesn't account for frame drops
- **Impact:**
  - If frame drops to 30fps, animation appears to "catch up" jerkily
  - Inconsistent speed on slower devices
- **Fix:** Use deltaTime pattern:
  ```typescript
  let lastFrameTime = 0
  const animate = (currentTime: number) => {
    const deltaTime = currentTime - lastFrameTime
    lastFrameTime = currentTime
    // Use deltaTime for physics calculations
  }
  ```

#### No Bundle Size Optimization
- **Context:** `vite.config.ts`
  - No code splitting configured
  - No manual chunks defined
  - Vue Router routes use dynamic imports (good) but no chunk naming
- **Impact:**
  - Single large bundle (~300KB estimated)
  - Slower initial load on 3G connections
- **Fix:**
  ```typescript
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'utils': ['./src/composables']
        }
      }
    }
  }
  ```

#### IndexedDB getAll() Loads Entire History
- **Context:** `useSessionStorage.ts` line 47
  - `store.getAll()` fetches all sessions into memory
  - No pagination or lazy loading
  - Sorted in JavaScript after fetch
- **Impact:**
  - 1000+ sessions = slow load time
  - Unnecessary memory usage
  - Scales poorly
- **Fix:**
  - Use cursor with limit: `store.openCursor(null, 'prev').continue()`
  - Paginate history view (show 20, load more button)
  - Or use index query: `index('timestamp').getAll(null, 50)`

---

### 4. Security & Privacy

#### ✅ Excellent Privacy Model
- Zero external requests
- No tracking scripts
- Local-only data storage

#### ⚠️ Issues

##### Formula Injection Protection Incomplete
- **Context:** `useSessionStorage.ts` line 157-164
  - Sanitizes cells starting with `=+-@`
  - But doesn't handle tab/newline-prefixed formulas: `\t=SUM(A1)`
  - Doesn't sanitize other fields (timestamp, pattern)
- **Impact:**
  - If user enters pattern-like text in notes, could execute in Excel
  - Low risk but incomplete protection
- **Fix:**
  ```typescript
  const sanitizeCSVCell = (cell: string): string => {
    if (!cell) return cell
    const trimmed = cell.trim()
    if (trimmed.match(/^[=+\-@\t\r]/)) {
      return `'${cell}` // Prefix with quote
    }
    return cell
  }
  ```
  - Apply to ALL fields, not just notes

##### No Content Security Policy
- **Context:** `index.html` and deployment
  - No CSP meta tag or headers
  - Allows inline scripts (Vite dev server injects them)
- **Impact:**
  - Vulnerable to XSS if any user input rendered unsafely
  - No defense-in-depth
- **Fix:** Add to `index.html`:
  ```html
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">
  ```
  - Configure Netlify headers for production

##### localStorage QuotaExceededError Silently Fails
- **Context:** `App.vue` line 163
  - Catches error but only logs to console
  - User unaware settings not saved
- **Impact:** User adjusts settings → quota exceeded → changes lost on reload
- **Fix:** Show toast notification on failure

---

### 5. Testing & Quality Assurance

#### Test Quality Assessment: 3/10

##### Current State
- **3 test files**, ~150 LOC total
- Coverage: <10% estimated (no coverage report run)
- No mocks for IndexedDB, AudioContext (uses global mocks in setup)
- No E2E or integration tests

##### Specific Gaps
1. **useAudio.test.ts:** Only tests value ranges, not actual Web Audio API calls
2. **useMovementPattern.test.ts:** Good coverage of calculations, but no visual validation
3. **No tests for:**
   - Session save flow
   - Journal merging logic
   - Distress reduction calculation
   - Canvas rendering
   - Router navigation
   - Keyboard shortcuts
   - Error handling paths

##### Recommendations
1. **Immediate:**
   - Add test for `handlePostJournalSave` (session save flow)
   - Test IndexedDB operations with in-memory mock
   - Test distress calculation edge cases (negative values, undefined)
2. **Short-term:**
   - Add component tests for SessionView, HomeView
   - Test keyboard shortcut handlers
   - Mock canvas and verify draw calls
3. **Long-term:**
   - Playwright E2E tests for full session flow
   - Visual regression tests for canvas animations
   - Accessibility audit with axe-core

---

### 6. Maintainability & Readability

#### ✅ Strengths
- Consistent Vue 3 composition API usage
- Clear naming conventions
- Logical file organization
- Comprehensive inline comments

#### ⚠️ Issues

##### SessionView.vue Is Too Large (490 lines)
- **Context:** Handles countdown, animation, pause, keyboard, haptics, audio
- **Impact:** Hard to reason about, difficult to test
- **Fix:** Extract into smaller components:
  - `SessionCountdown.vue`
  - `SessionCanvas.vue`
  - `SessionControls.vue`
  - `SessionTimer.vue`

##### Magic Numbers Without Constants
- **Context:** Throughout codebase
  - `SessionView.vue` line 235: `2500 - (settings.value.speed * 200)`
  - `SessionView.vue` line 305: `0.01` (bounce speed multiplier)
  - `SessionView.vue` line 310: `0.05` (bounce margin)
- **Fix:** Extract to named constants:
  ```typescript
  const MOVEMENT_DURATION_BASE_MS = 2500
  const MOVEMENT_DURATION_SPEED_FACTOR = 200
  const BOUNCE_SPEED_MULTIPLIER = 0.01
  const BOUNCE_EDGE_MARGIN = 0.05
  ```

##### Inconsistent Error Message Patterns
- **Context:** Error messages vary in tone and detail
  - `useSessionStorage.ts` line 57: "Failed to load sessions. Your data is safe, but we couldn't access it right now."
  - `useSessionStorage.ts` line 79: "Failed to save session. Please try exporting your data as a backup."
  - `useAudio.ts` line 17: "Audio not available. Session will continue with visual-only mode."
- **Impact:** Inconsistent UX, some messages too verbose
- **Fix:** Standardize error message format (action + reason + next step)

---

### 7. Developer Experience & Tooling

#### ✅ Strengths
- Vite 6 with instant HMR
- TypeScript strict mode
- Comprehensive `CLAUDE.md` guide
- Clear npm scripts

#### ⚠️ Issues

##### No Linting or Formatting Configuration
- **Context:**
  - No ESLint config
  - No Prettier config
  - No pre-commit hooks
- **Impact:**
  - Code style inconsistencies
  - No automatic error detection
  - Manual formatting required
- **Fix:**
  ```bash
  npm install -D eslint @vue/eslint-config-typescript prettier
  ```
  - Add `.eslintrc.js` and `.prettierrc`
  - Add pre-commit hook with husky + lint-staged

##### No Test Script in README
- **Context:** README documents `npm run dev`, `build`, `preview` but not `test`
- **Impact:** Contributors unaware of test suite
- **Fix:** Add testing section to README

##### Vite Server Port Hardcoded
- **Context:** `vite.config.ts` line 70: `port: 8080`
- **Impact:** Conflicts if port already in use
- **Fix:** Use environment variable with fallback:
  ```typescript
  server: {
    port: Number(process.env.PORT) || 8080,
  }
  ```

---

### 8. Configuration, Deploy, & Ops

#### PWA Service Worker Not Actually Generated
- **Severity:** Medium
- **Context:**
  - `vite.config.ts` configures `vite-plugin-pwa`
  - Sets `devOptions.enabled: false`
  - But no service worker detected in production build
  - README claims offline support but not verified
- **Impact:**
  - PWA install prompt may not show
  - Offline mode doesn't work as advertised
  - Phase 4 roadmap already claims PWA complete (it's not)
- **Fix:**
  - Test build output for `sw.js` and `workbox-*.js`
  - Enable service worker in production
  - Add offline fallback page

#### No CI/CD Pipeline
- **Context:** No GitHub Actions, CircleCI, or other CI
- **Impact:**
  - No automated type checking on PRs
  - No test runs before merge
  - Breaking changes could reach production
- **Fix:** Add `.github/workflows/ci.yml`:
  ```yaml
  name: CI
  on: [pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - run: npm install
        - run: npm run type-check
        - run: npm run test
  ```

#### No Environment Variable Validation
- **Context:** App assumes all browser APIs available
- **Impact:** Crashes on unsupported browsers
- **Fix:** Add runtime environment check on mount

---

## File & Module Notes

### `src/App.vue` (216 lines)
**Purpose:** Root component, navigation orchestrator, settings manager

**Strengths:**
- Clean separation of session flow logic
- Proper debounced settings save
- Good error handling on storage operations

**Weaknesses:**
- 13 provide() calls (over-injection)
- UUID fallback duplicates crypto.randomUUID logic
- Debounce timeout not cleared on unmount
- No loading state during session save

---

### `src/views/HomeView.vue` (171 lines)
**Purpose:** Settings UI and session start

**Strengths:**
- Clean template with semantic HTML
- Good accessibility (labels, ARIA)
- Proper two-way binding with `v-model`

**Weaknesses:**
- Uses inject (tight coupling to App.vue)
- No validation on speed/duration ranges (relies on HTML attributes)
- Emoji in UI (not localizable, accessibility concerns)

---

### `src/components/SessionView.vue` (490 lines)
**Purpose:** Core BLS session with canvas, audio, controls

**Strengths:**
- Comprehensive keyboard shortcuts
- Screen reader announcements
- Proper cleanup in onUnmounted

**Weaknesses:**
- **WAY too large** - needs component decomposition
- Mutates props directly (speed, volume)
- Bounce pattern logic should be in composable
- No error boundary around canvas operations
- Magic numbers throughout
- Circular pattern special-cased (breaks pattern)

**Recommendations:**
- Split into 4-5 smaller components
- Move all pattern logic to composables
- Add try/catch in animation loop
- Extract constants

---

### `src/composables/useSessionStorage.ts` (211 lines)
**Purpose:** IndexedDB wrapper for session CRUD

**Strengths:**
- Proper Promise-based async/await
- Good error messages
- CSV injection protection (partial)
- Computed statistics

**Weaknesses:**
- Shared dbInstance (multi-tab risk)
- getAll() loads entire dataset
- CSV sanitization incomplete
- No transaction error rollback
- Export functions mixed with storage logic

**Recommendations:**
- Remove singleton pattern
- Add pagination to loadSessions
- Extract export logic to separate composable
- Handle version conflicts

---

### `src/composables/useAudio.ts` (69 lines)
**Purpose:** Web Audio API wrapper

**Strengths:**
- Proper browser compatibility (`webkitAudioContext`)
- Graceful error handling
- Clean API surface

**Weaknesses:**
- Sound duration hardcoded (0.15s)
- No oscillator cleanup tracking (minor leak)
- `as any` type assertion

**Recommendations:**
- Track active oscillators, stop on unmount
- Add sound duration parameter
- Define proper AudioContext type

---

### `src/composables/useMovementPattern.ts` (70 lines)
**Purpose:** Pattern position calculations

**Strengths:**
- **Pure functions** (excellent testability)
- Clear math for each pattern
- Good test coverage

**Weaknesses:**
- Bounce returns hardcoded center (breaks pattern)
- No easing functions here (should be)
- getPanValue special-cases vertical (inconsistent)

**Recommendations:**
- Move easing functions here
- Implement proper bounce physics
- Normalize pan calculation

---

### `src/tests/` (3 files)
**Purpose:** Vitest unit tests

**Strengths:**
- Good setup with mocked Web APIs
- useMovementPattern tests comprehensive

**Weaknesses:**
- Minimal coverage (<10%)
- useAudio tests only validate ranges, not behavior
- No component tests
- No integration tests

**Recommendations:** See Testing section above

---

## Prioritized Action Plan

### 🔥 1-3 Day Plan (Quick Wins)

- [ ] **Fix documentation mismatch:** Update CLAUDE.md to acknowledge Vue Router or remove it
- [ ] **Add Toast cleanup:** Add `onUnmounted(() => clearTimeout(timeout))` to Toast.vue
- [ ] **Fix CSV double-escape bug:** Sanitize before quote escaping in useSessionStorage.ts
- [ ] **Add route guards:** Prevent direct access to /session without active session
- [ ] **Extract constants:** Replace magic numbers in SessionView with named constants
- [ ] **Add settings save on unmount:** Ensure debounced save completes before navigation
- [ ] **Fix prop mutation:** Emit events instead of mutating settings in SessionView
- [ ] **Add error toast on storage failure:** Show user-visible error when localStorage fails
- [ ] **Verify PWA build:** Confirm service worker generated in production build

**Estimated effort:** 4-6 hours

---

### 📦 1-2 Week Plan (Medium Refactors)

- [ ] **Remove IndexedDB singleton:** Create fresh connection per operation
- [ ] **Add integration tests:** Test session save flow, journal merge, distress calculation
- [ ] **Decompose SessionView:** Extract Countdown, Canvas, Controls, Timer into separate components
- [ ] **Implement reduced motion:** Disable easing and bounce when prefers-reduced-motion
- [ ] **Add ESLint + Prettier:** Configure linting with pre-commit hooks
- [ ] **Optimize bundle size:** Configure code splitting, analyze with rollup-plugin-visualizer
- [ ] **Add CI/CD pipeline:** GitHub Actions for type-check and test on PR
- [ ] **Paginate history view:** Load sessions in batches of 20-50
- [ ] **Move bounce physics to composable:** Consolidate all pattern logic
- [ ] **Add error boundaries:** Try/catch in animation loop and critical paths
- [ ] **Complete CSV sanitization:** Apply to all fields, handle edge cases
- [ ] **Add coverage reporting:** Configure Vitest coverage and set 60% target

**Estimated effort:** 20-30 hours

---

### 🚀 Longer-term / Aspirational

- [ ] **Consider Pinia migration:** Replace provide/inject with structured state management
- [ ] **Add Playwright E2E tests:** Full session flow test with real browser
- [ ] **Accessibility audit:** Automated testing with axe-core, manual screen reader testing
- [ ] **Performance optimization:** Target Lighthouse 95+ on mobile
- [ ] **Add visual regression tests:** Capture canvas states, detect rendering bugs
- [ ] **Multi-tab sync:** BroadcastChannel for cross-tab session updates
- [ ] **Improve error messages:** Standardize tone and format across app
- [ ] **Add analytics-free telemetry:** Privacy-preserving usage metrics (local only)
- [ ] **Internationalization (i18n):** Add multi-language support
- [ ] **Component library migration:** Consider headless UI components (Radix Vue)
- [ ] **Design system:** Formalize color palette, spacing, typography tokens

---

## Recommendations for Future Reviews

### Recurring Review Types

1. **Quarterly Security Audit** (30 min)
   - Check for new dependencies with vulnerabilities (`npm audit`)
   - Review localStorage/IndexedDB for new PII exposure
   - Verify no external network requests added
   - Test CSP headers still enforced

2. **Monthly Dependency Update** (15 min)
   - Update Vue, Vite, TypeScript, Tailwind
   - Run full test suite after updates
   - Check for breaking changes in browser APIs

3. **Pre-Release Checklist** (1 hour)
   - Run full test suite with coverage report
   - Type-check passes (`npm run type-check`)
   - Build succeeds (`npm run build`)
   - Lighthouse score >90 on mobile
   - Manual accessibility check (keyboard nav, screen reader)
   - Multi-browser test (Chrome, Firefox, Safari, Edge)
   - PWA install test on iOS and Android

4. **Post-Incident Review** (As needed)
   - If user reports bug: Write failing test first, then fix
   - If data loss: Audit all storage operations
   - If performance issue: Profile with Chrome DevTools

---

## Final Verdict

**Ship it?** ✅ Yes, for current scope (Phases 1-3)

**Before Phase 4?** ⚠️ Address critical issues (documentation fix, testing, multi-tab safety)

**Before Phase 5?** 🔴 Requires architectural improvements (decompose SessionView, state management, comprehensive testing)

---

**This is a solid foundation.** The code demonstrates clear thinking, privacy consciousness, and good TypeScript discipline. The main weaknesses are **test coverage** and **documentation accuracy**. Fixing the critical issues will take 1-2 weeks but will pay dividends as features expand.

The therapeutic use case demands reliability. Invest in testing infrastructure now before clinical adoption scales.

---

**Review completed by Claude Code on 2025-11-16.**
