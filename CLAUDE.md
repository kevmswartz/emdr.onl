# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EMDR.online is a Vue 3 + TypeScript browser-based bilateral stimulation (BLS) app for EMDR therapy. The app provides visual animations, synchronized audio tones, and optional haptic feedback for therapeutic sessions. All data is stored locally (no servers, no analytics) to respect privacy.

## Development Commands

### Core Commands
```bash
npm run dev          # Start dev server at http://localhost:8080
npm run build        # Type-check and build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript type checking without building
```

### Testing
No testing framework is currently configured. The spec (`REBUILD_SPEC.md`) outlines plans for Vitest + Testing Library.

## Architecture

### Tech Stack
- **Vue 3** with `<script setup>` and TypeScript
- **Vite** for build tooling (configured at port 8080)
- **Tailwind CSS** with dark mode (`darkMode: 'class'`)
- **IndexedDB** for local session storage
- **Web Audio API** for bilateral audio stimulation
- **Canvas API** for visual animations

### State Management
No Pinia or Vuex. State is managed via:
- **Composables** for reusable logic (audio, movement patterns, storage, haptics, wake lock, keyboard shortcuts, theme)
- **LocalStorage** for settings persistence (key: `'emdr-settings'`)
- **IndexedDB** for session history (database: `'emdr-bls'`, store: `'sessions'`)
- **Ref-based state** in `App.vue` for view navigation

### View Navigation
Simple state-based navigation without Vue Router:
```typescript
type View = 'home' | 'pre-journal' | 'session' | 'post-journal' | 'history' | 'feedback'
const currentView = ref<View>('home')
```

### Directory Structure
```
src/
├── components/
│   ├── SessionView.vue           # Active BLS session (fullscreen canvas + timer)
│   ├── PreSessionJournal.vue     # Pre-session journaling form
│   ├── PostSessionJournal.vue    # Post-session journaling form
│   ├── HistoryView.vue           # Session history list + statistics
│   ├── FeedbackView.vue          # Feedback form
│   └── Toast.vue                 # Toast notifications
├── composables/
│   ├── useAudio.ts               # Web Audio API (oscillator + stereo panner)
│   ├── useMovementPattern.ts     # Pattern position calculations
│   ├── useSessionStorage.ts      # IndexedDB CRUD operations
│   ├── useWakeLock.ts            # Screen Wake Lock API
│   ├── useHaptics.ts             # Vibration API
│   ├── useKeyboardShortcuts.ts   # Global keyboard shortcuts
│   └── useTheme.ts               # Dark mode system preference detection
├── types/
│   └── index.ts                  # TypeScript interfaces
├── App.vue                       # Root component with navigation logic
└── main.ts                       # App entry point
```

## Key Architectural Patterns

### Composables Architecture
Each composable encapsulates a specific browser API or feature:

- **`useAudio(volume, frequency, soundType)`**: Creates Web Audio context with gain node and plays tones with stereo panning. Returns `initAudio()` and `playSound(panValue)`.

- **`useMovementPattern()`**: Pure calculation functions for pattern positions. Returns `calculatePosition(pattern, progress, direction)` and `getPanValue(pattern, position)`. Each pattern returns normalized coordinates (0-1 range).

- **`useSessionStorage()`**: IndexedDB wrapper for session CRUD operations. Returns reactive `sessions` array, `statistics` computed, and methods for `loadSessions()`, `saveSession()`, `deleteSession()`, `exportToJSON()`, `exportToCSV()`.

- **`useWakeLock()`**: Manages Screen Wake Lock API to prevent screen sleep during sessions.

- **`useHaptics()`**: Wraps Vibration API for haptic feedback patterns.

- **`useKeyboardShortcuts()`**: Global event listeners for keyboard controls (Space, Esc, +/-, [/]).

- **`useTheme()`**: Detects system color scheme preference and applies dark mode class to document.

### Type System
All interfaces defined in `src/types/index.ts`:

```typescript
Settings          # User preferences (visual, audio, session, UX)
JournalEntry      # Pre/post session notes and distress ratings
Session           # Complete session record (timestamp, duration, settings, journal, distressReduction)
Statistics        # Aggregate stats (totalSessions, totalDuration, averageDistressReduction, averageDuration)
MovementPattern   # 'horizontal' | 'vertical' | 'circular' | 'figure8' | 'bounce'
SoundType         # 'sine' | 'triangle' | 'sawtooth'
```

### Session Flow
1. **Home** → User configures quick settings → Clicks "Start Session"
2. **Pre-Journal** (if journaling enabled) → User enters target memory, initial distress → Clicks "Continue"
3. **Session** → 3-second countdown → BLS animation runs with timer → User can pause/resume/stop
4. **Post-Journal** (if journaling enabled) → User enters what came up, current distress → Clicks "Save"
5. **Home** → Session saved to IndexedDB with calculated distress reduction

### Canvas Animation Pattern
`SessionView.vue` uses `requestAnimationFrame` loop:
- Calculates `progress` (0-1) based on `elapsedTime` and `speed`
- Calls `calculatePosition(pattern, progress, direction)` from composable
- Converts normalized position to canvas coordinates
- Draws circle with `dotColor` and `dotSize`
- Calls `playSound(panValue)` at pattern completion to sync audio with visuals

### Settings Persistence
Settings auto-save to localStorage on change via deep watcher in `App.vue`:
```typescript
watch(settings, saveSettings, { deep: true })
```

Settings are loaded on mount from `localStorage.getItem('emdr-settings')`.

## Implementation Guidelines

### When Adding New Movement Patterns
1. Add pattern type to `MovementPattern` union in `src/types/index.ts`
2. Implement position calculation in `useMovementPattern.ts` `calculatePosition()` switch statement
3. Add option to pattern selector in `App.vue` home view
4. Consider if pattern needs special pan calculation in `getPanValue()`

### When Adding New Sound Types
1. Add type to `SoundType` union in `src/types/index.ts`
2. If it's an oscillator type (sine/triangle/sawtooth), it works automatically via `oscillator.type` in `useAudio.ts`
3. If it's a sample-based sound (nature sounds, chimes), you'll need to implement `AudioBufferSourceNode` logic in `useAudio.ts`
4. Add option to sound type selector in `App.vue` home view

### When Modifying Session Storage
- Always maintain backward compatibility with existing IndexedDB schema
- If schema changes are needed, increment `DB_VERSION` in `useSessionStorage.ts` and add migration logic in `onupgradeneeded`
- Session IDs use `crypto.randomUUID()` (assumes modern browser support)

### Styling Conventions
- Use Tailwind utility classes (no custom CSS files)
- Dark mode variants: `dark:bg-gray-800`, `dark:text-white`, etc.
- Accessibility: `touch-target` class for 44x44px minimum touch areas
- Responsive: `min-h-screen`, `max-w-md`, `p-4`, `space-y-8` patterns

### Browser API Usage
- **Web Audio**: Always check for `window.AudioContext || webkitAudioContext` for Safari
- **Wake Lock**: Feature detect and gracefully degrade if unsupported
- **Haptics**: Check `navigator.vibrate` availability
- **IndexedDB**: Wrap all operations in try/catch with user-friendly error toasts

### Accessibility Requirements
- All interactive elements need `aria-label` attributes
- Respect `prefers-reduced-motion` media query (implemented in `useTheme.ts`)
- Keyboard navigation supported via `useKeyboardShortcuts.ts`
- Target WCAG 2.1 AA compliance (see `REBUILD_SPEC.md` for full requirements)

## Common Development Tasks

### Testing a Session Flow
1. Start dev server: `npm run dev`
2. Open http://localhost:8080
3. Adjust quick settings
4. Enable journaling checkbox
5. Click "Start Session" → Fill pre-journal → Session runs → Fill post-journal → Check history

### Debugging Canvas Animation
Add console logs in `SessionView.vue` animation loop:
```typescript
const position = calculatePosition(settings.value.pattern, progress, direction.value)
console.log({ progress, position, direction: direction.value })
```

### Testing IndexedDB
Open Chrome DevTools → Application → Storage → IndexedDB → `emdr-bls` → `sessions`

### Clearing All Data
```javascript
// In browser console:
localStorage.clear()
indexedDB.deleteDatabase('emdr-bls')
location.reload()
```

## Future Roadmap

See `REBUILD_SPEC.md` for complete specification. Key phases:

- **Phase 1 (DONE)**: Core BLS with basic patterns, audio, timer, settings persistence
- **Phase 2 (DONE)**: Multiple patterns, haptics, keyboard shortcuts, toast notifications
- **Phase 3 (DONE)**: Journaling system, IndexedDB, session history, export
- **Phase 4 (PLANNED)**: PWA with service worker, offline support, install prompt, accessibility audit
- **Phase 5 (OPTIONAL)**: Distress trend charts, custom audio upload, breathing exercises

## Important Constraints

### Privacy-First Design
- **NEVER** add analytics, tracking, or external network requests
- All data stays local (localStorage + IndexedDB)
- Export functionality must be explicit user action
- No cookies, no telemetry, no servers

### Therapeutic Context
- This is a clinical tool used in therapy sessions
- Defaults must be safe and non-triggering
- UI should be calming, not flashy
- Haptics and audio should be gentle by default
- Session interruption (pause/stop) must always be available

### Mobile-First
- Primary use case is phone/tablet during therapy
- Touch targets must be large (44x44px minimum)
- Canvas must perform well on mobile GPUs
- Avoid layout shifts during fullscreen transitions
- Battery efficiency matters (optimize animation loops)

## Git Workflow Notes

- Main branch: `main`
- Current branch: `rebuild-from-scratch`
- Commit message format includes co-authorship footer:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

## Deployment

- Host: Netlify (configured for `main` branch auto-deploy)
- Domain: emdr.onl
- Build command: `npm run build`
- Output directory: `dist`
- HTTPS required for PWA features (wake lock, audio context)
