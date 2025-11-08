# EMDR.online

<div align="center">

**Privacy-focused bilateral stimulation for EMDR therapy**

[Live App](https://emdr.onl) • [Report Issue](https://github.com/kevmswartz/emdr.onl/issues)

[![Built with Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## Table of Contents

- [What is EMDR.online?](#what-is-emdronline)
- [Features](#features)
- [Quick Start](#quick-start)
  - [For Users](#for-users)
  - [For Developers](#for-developers)
- [Development](#development)
  - [Commands](#commands)
  - [Project Structure](#project-structure)
  - [Architecture](#architecture)
- [Usage Guide](#usage-guide)
  - [Starting a Session](#starting-a-session)
  - [Journaling](#journaling)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
- [Technical Details](#technical-details)
  - [Browser APIs](#browser-apis)
  - [Data Storage](#data-storage)
  - [PWA Support](#pwa-support)
- [Privacy & Security](#privacy--security)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## What is EMDR.online?

EMDR.online is a browser-based bilateral stimulation (BLS) tool designed for **Eye Movement Desensitization and Reprocessing (EMDR)** therapy. It provides visual animations, synchronized audio tones, and optional haptic feedback to support therapeutic sessions.

### Built for Therapy

This isn't a generic relaxation app. EMDR.online was created with input from practicing therapists to be:

- **Instantly accessible**: Open on any device, no installation or account required
- **Clinically appropriate**: Safe defaults, calming aesthetics, non-triggering design
- **Fully private**: All data stays on your device—no servers, no tracking, no analytics
- **Reliable offline**: Works without internet via Progressive Web App (PWA) technology
- **Professionally capable**: Configurable patterns, speeds, sounds, and session tracking

### Why a Rebuild?

This codebase represents a complete rewrite of a legacy app that had accumulated technical debt. The new version prioritizes:

- Modern web standards (Vue 3, TypeScript, Web APIs)
- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA compliance in progress)
- Clean architecture with composable logic
- Privacy-by-design (zero external requests)

---

## Features

### 🎯 Core Bilateral Stimulation

- **5 Movement Patterns**: Horizontal, Vertical, Circular, Figure-8, Bounce
- **Adjustable Parameters**: Speed (1-10), duration (10-180s), dot size, colors
- **Smooth Animations**: Canvas-based rendering with 60fps target and easing functions

### 🔊 Audio Stimulation

- **Synchronized Sound**: Stereo-panned audio tracks visual movement
- **Multiple Waveforms**: Sine (soft), Triangle (mellow), Sawtooth (bright)
- **Frequency Control**: 220Hz default, adjustable 100-800Hz range
- **Volume Control**: 0-100% with independent slider

### 📝 Therapeutic Journaling

- **Pre-Session**: Target memory, initial distress (0-10 scale), negative beliefs, body sensations
- **Post-Session**: What came up, current distress, processing notes
- **Automatic Tracking**: Calculates distress reduction, timestamps all entries

### 📊 Session History & Analytics

- **IndexedDB Storage**: All sessions saved locally with full detail
- **Statistics Dashboard**: Total sessions, average duration, distress trends
- **Export Options**: Download as JSON or CSV for external analysis
- **Privacy-Preserving**: Data never leaves your device

### ♿ Accessibility Features

- **Keyboard Navigation**: Full control without mouse (Space, Esc, +/-, [/])
- **System Theme Support**: Automatic dark mode based on OS preference
- **Reduced Motion**: Respects `prefers-reduced-motion` media query
- **ARIA Labels**: Screen reader support throughout interface
- **Large Touch Targets**: 44x44px minimum for mobile accessibility

### 🌐 Progressive Web App (PWA)

- **Installable**: Add to home screen on iOS/Android
- **Offline Support**: Service worker caches assets for offline use
- **No App Store**: Direct browser install, no gatekeepers

### ⚡ UX Enhancements

- **Haptic Feedback**: Vibration patterns on supported devices
- **Wake Lock**: Keeps screen active during sessions
- **Toast Notifications**: Non-intrusive feedback for actions
- **3-Second Countdown**: Prepare before session starts
- **Pause/Resume**: Full control over session flow

---

## Quick Start

### For Users

1. **Visit**: Navigate to [emdr.onl](https://emdr.onl) in any modern browser
2. **Configure**: Adjust quick settings (pattern, duration, speed, sound, volume)
3. **Start**: Click "Start Session" button
4. **Session**: Watch the animation, listen to tones, process your experience
5. **Complete**: Session ends automatically or stop manually

**Optional**: Enable journaling to track distress levels and processing notes.

**Pro Tip**: Install as PWA for offline access:
- **iOS Safari**: Tap Share → Add to Home Screen
- **Android Chrome**: Tap ⋮ → Install App
- **Desktop Chrome**: Click ⊕ in address bar → Install

### For Developers

```bash
# Clone repository
git clone https://github.com/kevmswartz/emdr.onl.git
cd emdr.onl

# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Development

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server at http://localhost:8080 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Run TypeScript type checking without building |

### Project Structure

```
emdr.onl/
├── public/                      # Static assets
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service worker
│   ├── icon-192.png            # PWA icons
│   ├── icon-512.png
│   └── favicon.ico
├── src/
│   ├── components/              # Vue components
│   │   ├── SessionView.vue      # Active BLS session (fullscreen canvas)
│   │   ├── PreSessionJournal.vue
│   │   ├── PostSessionJournal.vue
│   │   ├── HistoryView.vue      # Session history + statistics
│   │   ├── FeedbackView.vue     # User feedback form
│   │   └── Toast.vue            # Toast notification system
│   ├── composables/             # Reusable logic
│   │   ├── useAudio.ts          # Web Audio API (oscillator + panner)
│   │   ├── useMovementPattern.ts # Pattern position calculations
│   │   ├── useSessionStorage.ts  # IndexedDB operations
│   │   ├── useWakeLock.ts       # Screen Wake Lock API
│   │   ├── useHaptics.ts        # Vibration API
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useTheme.ts          # Dark mode detection
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── App.vue                  # Root component (navigation + settings)
│   ├── main.ts                  # App entry point
│   └── style.css                # Global styles (minimal)
├── CLAUDE.md                    # Developer instructions for AI
├── REBUILD_SPEC.md              # Original specification document
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
└── package.json
```

### Architecture

#### State Management

**No Pinia or Vuex**. State is managed via:

- **Composables**: Encapsulate browser APIs (audio, storage, haptics, etc.)
- **LocalStorage**: Settings persistence (`key: 'emdr-settings'`)
- **IndexedDB**: Session history (`database: 'emdr-bls'`)
- **Reactive Refs**: Component-level state in `App.vue`

#### View Navigation

Simple state-based navigation without Vue Router:

```typescript
type View = 'home' | 'pre-journal' | 'session' | 'post-journal' | 'history' | 'feedback'
const currentView = ref<View>('home')
```

#### Composables Architecture

Each composable wraps a single browser API or concern:

| Composable | Purpose | Returns |
|------------|---------|---------|
| `useAudio()` | Web Audio context, oscillator, panner | `initAudio()`, `playSound(pan)` |
| `useMovementPattern()` | Pure calculation functions for patterns | `calculatePosition()`, `getPanValue()` |
| `useSessionStorage()` | IndexedDB CRUD operations | `sessions`, `statistics`, `saveSession()`, `exportToJSON()`, etc. |
| `useWakeLock()` | Screen Wake Lock API wrapper | `requestWakeLock()`, `releaseWakeLock()` |
| `useHaptics()` | Vibration API wrapper | `vibrate(pattern)` |
| `useKeyboardShortcuts()` | Global keyboard event listeners | Setup function |
| `useTheme()` | System theme detection | `isDark` ref |

#### Type System

All interfaces defined in `src/types/index.ts`:

```typescript
Settings          // User preferences (visual, audio, session, UX)
JournalEntry      // Pre/post session notes + distress ratings
Session           // Complete session record (timestamp, duration, settings, journal)
Statistics        // Aggregate stats (totalSessions, totalDuration, averages)
MovementPattern   // 'horizontal' | 'vertical' | 'circular' | 'figure8' | 'bounce'
SoundType         // 'sine' | 'triangle' | 'sawtooth'
```

#### Session Flow

```
┌──────┐     ┌─────────────┐     ┌─────────┐     ┌──────────────┐     ┌──────┐
│ Home │ --> │ Pre-Journal │ --> │ Session │ --> │ Post-Journal │ --> │ Home │
└──────┘     └─────────────┘     └─────────┘     └──────────────┘     └──────┘
               (if enabled)        (countdown       (if enabled)        (data
                                   + animation)                          saved)
```

#### Canvas Animation Pattern

`SessionView.vue` uses `requestAnimationFrame` loop:

1. Calculate `progress` (0-1) based on `elapsedTime` and `speed`
2. Call `calculatePosition(pattern, progress, direction)` from composable
3. Convert normalized position (0-1) to canvas coordinates
4. Draw circle with `dotColor` and `dotSize`
5. Call `playSound(panValue)` at pattern completion to sync audio

---

## Usage Guide

### Starting a Session

1. **Choose Pattern**: Select movement type (horizontal, vertical, circular, figure-8, bounce)
2. **Set Duration**: Use slider to set session length (10-180 seconds)
3. **Adjust Speed**: Speed slider controls how fast the dot moves (1-10)
4. **Select Sound**: Choose waveform (sine, triangle, sawtooth)
5. **Set Volume**: Adjust audio volume (0-100%)
6. **Pick Color**: Select dot color from preset swatches
7. **Click "Start Session"**: 3-second countdown begins, then session starts

### Journaling

**Enable journaling** via checkbox on home screen to access:

#### Pre-Session Form
- **Target Memory**: Brief description of what you're processing
- **Initial Distress**: Rate current distress level (0-10 scale)
- **Negative Belief**: Optional self-belief associated with memory
- **Body Sensations**: Optional physical sensations you're noticing

#### Post-Session Form
- **What Came Up**: New insights, memories, or experiences during session
- **Current Distress**: Rate distress level after session (0-10 scale)
- **Notes**: Any additional observations

**Distress Reduction** is automatically calculated: `initialDistress - currentDistress`

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Pause/resume session |
| `Esc` | Stop session and return home |
| `+` / `=` | Increase speed during session |
| `-` / `_` | Decrease speed during session |
| `[` | Decrease volume |
| `]` | Increase volume |

**Disable shortcuts**: Uncheck "Enable keyboard shortcuts" on settings

---

## Technical Details

### Browser APIs

#### Web Audio API
- **Purpose**: Generate stereo-panned tones synchronized with visual movement
- **Implementation**: `useAudio.ts` creates AudioContext, OscillatorNode, StereoPannerNode, GainNode
- **Frequency**: Default 220Hz (adjustable 100-800Hz)
- **Duration**: 150ms tone on each pattern completion
- **Browser Support**: Safari requires `webkitAudioContext` fallback

#### Canvas API
- **Purpose**: Hardware-accelerated 60fps animations
- **Implementation**: `SessionView.vue` uses `requestAnimationFrame` loop
- **Patterns**: Pure functions calculate normalized positions (0-1 range)
- **Rendering**: Clears canvas each frame, draws single circle at calculated position

#### Screen Wake Lock API
- **Purpose**: Prevent screen sleep during sessions
- **Implementation**: `useWakeLock.ts` requests lock on session start, releases on end
- **Browser Support**: Chrome 84+, Edge 84+, Safari 16.4+ (iOS/iPadOS)
- **Fallback**: Gracefully degrades if unsupported

#### Vibration API
- **Purpose**: Haptic feedback on pattern completion and countdown
- **Implementation**: `useHaptics.ts` wraps `navigator.vibrate()`
- **Browser Support**: Chrome (Android), Edge (Android)
- **Pattern**: 50ms pulse on each movement cycle completion

#### IndexedDB
- **Purpose**: Persistent local storage for session history
- **Implementation**: `useSessionStorage.ts` manages database operations
- **Schema**:
  - Database: `emdr-bls`
  - Store: `sessions` (keyPath: `id`, index: `timestamp`)
- **Operations**: CRUD via Promises, sorted by timestamp descending

### Data Storage

#### LocalStorage
- **Key**: `emdr-settings`
- **Content**: Serialized `Settings` object
- **Persistence**: Saved on every settings change via deep watcher
- **Size**: ~500 bytes (well under 5MB limit)

#### IndexedDB
- **Database**: `emdr-bls` (version 1)
- **Store**: `sessions` with auto-incrementing `id`
- **Data**: Full session objects including settings snapshot and journal
- **Capacity**: Quota depends on device, typically 50MB+ available
- **Export**: JSON and CSV export functions for data portability

#### What's NOT Stored
- ❌ No cookies
- ❌ No session storage
- ❌ No external database
- ❌ No cloud sync
- ❌ No analytics tracking

### PWA Support

#### Manifest (`public/manifest.json`)
```json
{
  "name": "EMDR BLS",
  "short_name": "EMDR",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#10b981",
  "icons": [...]
}
```

#### Service Worker (`public/sw.js`)
- **Strategy**: Cache-first with network fallback
- **Cached Assets**: HTML, manifest, icons
- **Update Strategy**: Clean old caches on activate
- **Offline Fallback**: Returns cached index.html for document requests

#### Installation Criteria
- ✅ HTTPS required (provided by Netlify)
- ✅ Valid manifest with icons
- ✅ Registered service worker
- ✅ Start URL loads while offline

---

## Privacy & Security

### Privacy Guarantees

✅ **Zero Network Requests**: App makes no HTTP requests after initial load
✅ **No Analytics**: No Google Analytics, Mixpanel, or tracking scripts
✅ **No Cookies**: No authentication, no sessions, no tracking cookies
✅ **Local Storage Only**: All data stays on device (LocalStorage + IndexedDB)
✅ **No User Accounts**: No email, password, or personal info collected
✅ **Explicit Export**: Data only leaves device when user clicks export
✅ **Open Source**: Code is auditable on GitHub

### Security Considerations

- **HTTPS Only**: Required for Web Audio, Wake Lock, and Service Worker APIs
- **Content Security Policy**: Consider adding CSP headers in deployment
- **Subresource Integrity**: Consider SRI hashes for future CDN assets
- **No eval()**: TypeScript compilation ensures no dynamic code execution
- **Input Sanitization**: Journal entries stored as-is (no XSS risk, no server)

### Data Deletion

**Clear All Data**:
1. Open browser DevTools (F12)
2. Go to Application → Storage
3. Clear LocalStorage and IndexedDB for site
4. Or: Settings → Clear All Sessions → Confirm

**Note**: There is no account recovery because there are no accounts.

---

## Contributing

Contributions are welcome! This project prioritizes:

1. **Privacy-first design**: No tracking, no external requests
2. **Accessibility**: WCAG 2.1 AA compliance
3. **Therapeutic appropriateness**: Safe, calming, non-triggering
4. **Mobile-first**: Primary use case is phone/tablet
5. **Code quality**: TypeScript, clean composables, documented patterns

### Development Workflow

1. **Fork** the repository
2. **Create branch**: `git checkout -b feature/your-feature`
3. **Make changes**: Follow existing patterns in `CLAUDE.md`
4. **Test locally**: `npm run dev` and verify on desktop + mobile
5. **Type-check**: `npm run type-check` must pass
6. **Commit**: Clear, descriptive commit messages
7. **Push**: `git push origin feature/your-feature`
8. **Pull Request**: Describe changes and reasoning

### Code Style

- **Vue 3**: Use `<script setup>` composition API
- **TypeScript**: Strict mode, explicit types, no `any`
- **Tailwind**: Utility classes only, no custom CSS files
- **Composables**: Pure functions where possible, single responsibility
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

### Areas for Contribution

See [Roadmap](#roadmap) section for planned features. Priority areas:

- 🧪 **Testing**: Add Vitest unit tests for composables
- ♿ **Accessibility**: Screen reader testing, ARIA improvements
- 🎨 **Patterns**: New movement patterns or easing functions
- 🔊 **Audio**: Nature sounds, chimes, custom audio upload
- 📊 **Charts**: Distress level trend visualization
- 🌍 **i18n**: Multi-language support

---

## Roadmap

### ✅ Phase 1: Core BLS (Complete)
- Canvas-based horizontal animation
- Web Audio with stereo panning
- Session timer with countdown
- Settings persistence (LocalStorage)
- Pause/stop controls

### ✅ Phase 2: Enhanced Experience (Complete)
- Multiple movement patterns (5 total)
- Additional waveforms (sine, triangle, sawtooth)
- Haptic feedback
- Keyboard shortcuts
- Toast notifications

### ✅ Phase 3: Journaling & History (Complete)
- Pre/post session journal forms
- IndexedDB integration
- Session history list
- Statistics dashboard
- Export to JSON/CSV

### 🚧 Phase 4: PWA & Polish (In Progress)
- [ ] Full service worker caching (including Vite bundles)
- [ ] Custom install prompt
- [ ] Offline indicator
- [ ] Accessibility audit + fixes (WCAG 2.1 AA)
- [ ] Performance optimization (Lighthouse 95+)
- [ ] Add Vitest unit tests

### 🔮 Phase 5: Advanced Features (Planned)
- [ ] Nature sounds library (rain, ocean, wind chimes)
- [ ] Custom audio upload support
- [ ] Distress trend charts (simple line graph)
- [ ] Breathing exercise integration
- [ ] Session templates/presets
- [ ] Multi-language support (i18n)

### 💡 Future Ideas (Unscheduled)
- Therapist mode: QR code config sharing
- Apple Watch companion (haptic-only)
- Health app integration (export session data)
- Guided meditation library
- Community sound pack submissions

---

## License

**MIT License**

Copyright (c) 2024 Kevin Swartz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Acknowledgments

- **EMDR Community**: Therapists and practitioners who provided feedback
- **Vue.js Team**: For an excellent framework and composition API
- **Open Source**: Built entirely with free, open-source tools

---

## Support

- **Issues**: [GitHub Issues](https://github.com/kevmswartz/emdr.onl/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kevmswartz/emdr.onl/discussions)
- **Live App**: [emdr.onl](https://emdr.onl)

**Note**: This tool is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions regarding mental health conditions.

---

<div align="center">

**Built with privacy, simplicity, and therapeutic effectiveness in mind.**

⭐ Star this repo if you find it useful!

</div>
