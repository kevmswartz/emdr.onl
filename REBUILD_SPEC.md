# EMDR App Rebuild Specification

## Core Philosophy
- **Mobile-first**: Primary use case is phone/tablet during therapy sessions
- **Simplicity**: Remove complexity, focus on bilateral stimulation excellence
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, screen reader support
- **Offline-capable**: PWA with service worker, works without internet
- **Privacy-focused**: All data local, optional export, no analytics/tracking

---

## Architecture

### Tech Stack
- **Vue 3** with `<script setup>` and TypeScript throughout
- **Vite** for build tooling
- **Pinia** for state management (cleaner than props drilling)
- **TailwindCSS** for styling
- **Vitest** + Testing Library for tests
- **PWA plugin** for offline support and install prompt

### Project Structure
```
src/
├── components/
│   ├── session/
│   │   ├── SessionCanvas.vue        # Visual BLS rendering
│   │   ├── SessionControls.vue      # Play/pause/stop buttons
│   │   ├── SessionTimer.vue         # Progress circle + time
│   │   └── SessionSettings.vue      # Pre-session config
│   ├── audio/
│   │   ├── AudioPlayer.vue          # Audio controls UI
│   │   └── SoundPresets.vue         # Preset selector
│   ├── journaling/
│   │   ├── JournalEntry.vue         # Single journal form
│   │   └── JournalHistory.vue       # Past entries list
│   └── ui/
│       ├── Button.vue
│       ├── Slider.vue
│       ├── ColorPicker.vue
│       └── Toast.vue
├── composables/
│   ├── useAudio.ts                  # Web Audio API logic
│   ├── useSessionTimer.ts           # Timer state management
│   ├── useWakeLock.ts               # Screen wake lock
│   ├── useHaptics.ts                # Vibration API
│   ├── useVisualAnimation.ts        # Canvas animation logic
│   └── useStorage.ts                # IndexedDB wrapper
├── stores/
│   ├── session.ts                   # Current session state
│   ├── settings.ts                  # User preferences
│   └── history.ts                   # Past sessions
├── types/
│   └── index.ts                     # TypeScript interfaces
├── utils/
│   ├── audio.ts                     # Audio generation helpers
│   ├── easing.ts                    # Easing functions
│   └── export.ts                    # Data export utilities
└── views/
    ├── Home.vue                     # Landing page
    ├── Session.vue                  # Active BLS session
    ├── Journal.vue                  # Pre/post session notes
    └── History.vue                  # Session history
```

### No Router Needed
Simple state-based view switching:
```typescript
const currentView = ref<'home' | 'session' | 'journal' | 'history'>('home')
```

---

## Features

### 1. Session Modes (Simplified)

#### Quick Start (Default)
- Click "Start" → 3s countdown → BLS session begins
- Minimal friction, immediate therapy

#### Journaling Mode
- Optional pre-session: Target memory, distress level (0-10)
- Session runs
- Optional post-session: What came up, current distress level
- Auto-calculates distress reduction

**Remove**: "Guided" mode with timed prompts (ineffective), "Full form" mode (too complex)

---

### 2. Visual Bilateral Stimulation

#### Movement Patterns
- **Horizontal (default)**: Smooth left-right
- **Vertical**: Up-down movement
- **Figure-8**: Infinity symbol pattern
- **Circular**: Clockwise/counter-clockwise
- **Spiral**: Expanding/contracting spiral

#### Visual Settings
- **Speed**: 1-10 scale (0.5 Hz to 2 Hz range)
- **Size**: 20-120px radius
- **Color**: Full color picker + presets (green, blue, purple, amber)
- **Trail effect**: Optional motion blur/trail
- **Background**: Solid black, gradient, or custom color

#### Implementation Details
- Canvas-based with `requestAnimationFrame`
- Separate composable for each pattern type
- Hardware acceleration with `willChange` CSS
- 60fps target, fallback to simpler rendering on low-end devices

---

### 3. Audio Bilateral Stimulation

#### Sound Types
- **Tones**: Sine, triangle, sawtooth (current)
- **Nature**: Rain, ocean waves, wind chimes
- **Chimes**: Singing bowl, bell, soft gong
- **Clicks**: Subtle click/tap sounds
- **Custom**: User can upload MP3/WAV

#### Audio Modes
- **Stereo pan** (default): Single tone panned left/right
- **Alternating**: Separate left/right tones
- **Binaural**: Slight frequency difference (requires headphones)
- **Off**: Visual only

#### Audio Settings
- **Volume**: 0-100%
- **Frequency**: 100-800 Hz for tones
- **Tone duration**: 50-300ms

#### Implementation
- Web Audio API with `StereoPannerNode` and `OscillatorNode`
- Audio files via `AudioBufferSourceNode` with pan
- Volume fade in/out on session start/stop
- Audio context resumed on user interaction (browser policy)

---

### 4. Session Controls

#### During Session
- **Pause/Resume**: Freezes animation and timer
- **Stop**: Ends session, shows summary if journaling enabled
- **Extend**: Add 30s/60s to timer without stopping
- **Skip**: Jump to end (for testing)

#### Session Duration
- Presets: 30s, 60s, 2min, 5min, 10min
- Custom: 10s - 30min range

#### Auto-behaviors
- **Gradual slowdown**: Optional 20% speed reduction over session
- **Fade out**: Audio volume fades last 5 seconds
- **Haptic finish**: 3 pulses when session completes

---

### 5. Journaling System

#### Pre-Session (Optional)
- Target memory (textarea, 500 char limit)
- Initial distress (0-10 slider with emoji indicators)
- Negative belief (textarea, 200 char limit)
- Body sensations (textarea, 200 char limit)

#### Post-Session (Optional)
- What came up (textarea, 500 char)
- Current distress (0-10 slider)
- Notes (textarea, 500 char)

#### Auto-saved
- Saves to IndexedDB on every change
- Session timestamp, duration, settings snapshot
- Calculated distress reduction

---

### 6. Session History

#### Display
- List view with date, duration, distress change
- Filter: Last 7 days, 30 days, all time
- Search by notes content
- Sort by date, distress reduction

#### Statistics
- Total sessions count
- Average session duration
- Average distress reduction
- Chart: Distress levels over time (optional, simple)

#### Data Management
- Export all to JSON
- Export to CSV for spreadsheets
- Import from JSON
- Delete individual sessions or bulk delete

---

### 7. Settings & Preferences

#### Session Defaults
- Default mode (quick vs journaling)
- Default duration
- Auto-start after countdown

#### Visual Defaults
- Movement pattern
- Speed, size, color
- Background color

#### Audio Defaults
- Sound type
- Audio mode
- Volume, frequency

#### Accessibility
- Reduced motion (respects prefers-reduced-motion)
- High contrast mode
- Larger touch targets (44x44px minimum)
- Keyboard shortcuts enabled/disabled

#### Advanced
- Haptic feedback on/off
- Wake lock on/off
- Auto-fullscreen on/off
- Show advanced stats

---

### 8. Keyboard Shortcuts

- `Space`: Pause/resume session
- `Esc`: Stop session
- `+/-`: Adjust speed during session
- `[/]`: Adjust volume during session
- `S`: Start session (from home)
- `J`: Open journal (from home)
- `H`: View history (from home)

---

### 9. Accessibility Features

#### Screen Reader Support
- Proper ARIA labels on all controls
- Live regions for timer updates (not too frequent)
- Session status announcements

#### Keyboard Navigation
- Full keyboard control, logical tab order
- Focus indicators clearly visible
- Skip links where appropriate

#### Motion Sensitivity
- Respect `prefers-reduced-motion` media query
- If enabled: Slower animations, no auto-play
- Alternative: Pulsing dot instead of movement

#### Color Contrast
- WCAG AA compliant (4.5:1 text, 3:1 UI)
- High contrast mode option
- Color blind friendly palette

---

### 10. PWA Features

#### Installable
- Manifest.json with icons, theme colors
- Install prompt after 2nd visit
- Standalone display mode

#### Offline Support
- Service worker caches app shell
- Works completely offline
- No network requests (privacy++)

#### Performance
- Lighthouse score 95+ on all metrics
- < 1s TTI (Time to Interactive)
- < 100KB initial bundle

---

## Data Model

### TypeScript Interfaces

```typescript
// Settings
interface Settings {
  // Visual
  pattern: 'horizontal' | 'vertical' | 'figure8' | 'circular' | 'spiral'
  speed: number // 1-10
  dotSize: number // 20-120
  dotColor: string // hex
  trailEffect: boolean
  backgroundColor: string

  // Audio
  audioEnabled: boolean
  soundType: 'sine' | 'triangle' | 'sawtooth' | 'nature-rain' | 'nature-ocean' | 'chime-bowl' | 'chime-bell' | 'click' | 'custom'
  audioMode: 'stereo' | 'alternating' | 'binaural' | 'off'
  volume: number // 0-1
  frequency: number // 100-800
  toneDuration: number // 50-300ms
  customAudioUrl?: string

  // Session
  defaultDuration: number // seconds
  enableJournaling: boolean
  autoStart: boolean
  gradualSlowdown: boolean
  audioFadeOut: boolean

  // UX
  hapticFeedback: boolean
  wakeLock: boolean
  autoFullscreen: boolean
  keyboardShortcuts: boolean
  reducedMotion: boolean
  highContrast: boolean
}

// Journal Entry
interface JournalEntry {
  id: string // uuid
  timestamp: number

  // Pre-session
  targetMemory?: string
  initialDistress?: number // 0-10
  negativeBelief?: string
  bodySensations?: string

  // Post-session
  whatCameUp?: string
  currentDistress?: number // 0-10
  notes?: string
}

// Session
interface Session {
  id: string // uuid
  timestamp: number
  duration: number // seconds

  // Settings snapshot
  settings: Settings

  // Journal if enabled
  journal?: JournalEntry

  // Calculated
  distressReduction?: number // currentDistress - initialDistress
}

// History
interface History {
  sessions: Session[]
  totalSessions: number
  totalDuration: number // seconds
  averageDistressReduction?: number
}
```

---

## Storage Strategy

### IndexedDB Structure
```
Database: emdr-app

Stores:
- settings (single record, key: 'default')
- sessions (keyPath: 'id', indexed by timestamp)
- audioFiles (keyPath: 'id', stores custom audio blobs)
```

### Composable API
```typescript
const { settings, updateSettings } = useSettings()
const { sessions, addSession, deleteSession, exportSessions } = useHistory()
const { addCustomAudio, getCustomAudio } = useAudioFiles()
```

---

## UI/UX Design

### Home Screen
```
┌─────────────────────────────────┐
│  🎯 EMDR BLS                     │
│                                  │
│  ┌───────────────────────────┐  │
│  │   🌀 Start Session        │  │  ← Big, primary CTA
│  └───────────────────────────┘  │
│                                  │
│  Quick Settings:                 │
│  Duration: [2min ▼]              │
│  Pattern: [Horizontal ▼]         │
│  Sound: [Tone ▼]                 │
│                                  │
│  [⚙️ All Settings]  [📊 History] │
│                                  │
└─────────────────────────────────┘
```

### Session Screen (Fullscreen)
```
┌─────────────────────────────────┐
│            ⏱️ 1:23                │  ← Top: Timer + progress ring
│                                  │
│                                  │
│           ●                      │  ← Center: Animated dot
│                                  │
│                                  │
│                                  │
│   ⏸️  ⏹️  +30s                    │  ← Bottom: Controls
└─────────────────────────────────┘
```

### Settings Screen
```
┌─────────────────────────────────┐
│  ← Settings                      │
│                                  │
│  Visual                          │
│  ├─ Pattern: Horizontal          │
│  ├─ Speed: ▓▓▓▓▓░░░░░ 5          │
│  ├─ Size: ▓▓▓▓▓▓░░░░ 60px        │
│  └─ Color: [🟢]                  │
│                                  │
│  Audio                           │
│  ├─ Sound: Soft Tone             │
│  ├─ Volume: ▓▓▓▓▓▓▓░░░ 70%       │
│  └─ Frequency: 220 Hz            │
│                                  │
│  Session                         │
│  ├─ Duration: 2 minutes          │
│  ├─ Enable Journaling: ☑️         │
│  └─ Auto-start: ☐                │
│                                  │
│  [Reset to Defaults]             │
└─────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Core BLS (MVP)
- [ ] Project setup (Vite + Vue 3 + TS + Tailwind)
- [ ] Basic canvas animation (horizontal pattern only)
- [ ] Simple audio (tone with stereo pan)
- [ ] Session timer with countdown
- [ ] Settings: speed, duration, volume, color
- [ ] Pause/stop controls
- [ ] LocalStorage for settings

### Phase 2: Enhanced Experience
- [ ] Multiple movement patterns (vertical, figure-8, circular)
- [ ] Additional sound types (nature, chimes, clicks)
- [ ] Haptic feedback
- [ ] Wake lock
- [ ] Keyboard shortcuts
- [ ] Toast notifications

### Phase 3: Journaling & History
- [ ] Pre/post session journal forms
- [ ] IndexedDB integration
- [ ] Session history list
- [ ] Basic statistics
- [ ] Export to JSON/CSV

### Phase 4: PWA & Polish
- [ ] Service worker + offline support
- [ ] Install prompt
- [ ] Accessibility audit + fixes
- [ ] Performance optimization
- [ ] Custom audio upload
- [ ] Dark mode (system preference)

### Phase 5: Advanced (Optional)
- [ ] Distress trend chart
- [ ] Session templates
- [ ] Breathing exercises
- [ ] Emergency grounding tools
- [ ] Share config via URL

---

## Testing Strategy

### Unit Tests
- Composables: useAudio, useTimer, useStorage, useAnimation
- Utils: Easing functions, audio generation, export functions
- Stores: Settings, session, history state management

### Component Tests
- Settings form interactions
- Session controls (pause, stop, extend)
- Journal form validation
- History list filtering/sorting

### E2E Tests (Minimal)
- Complete session flow
- Settings persistence
- Journal save/load
- Export functionality

### Manual Testing Checklist
- [ ] Works offline
- [ ] Screen doesn't sleep during session
- [ ] Audio plays correctly (headphones + speakers)
- [ ] Haptics work on iOS/Android
- [ ] Keyboard navigation complete
- [ ] Screen reader usable
- [ ] Reduced motion respected
- [ ] Works on iOS Safari, Chrome Android, Desktop browsers

---

## Performance Targets

- **Bundle size**: < 100KB gzipped
- **TTI**: < 1 second
- **FCP**: < 0.5 seconds
- **Animation**: Solid 60fps
- **Memory**: < 50MB during session
- **Battery**: Minimal drain (optimize canvas/audio)

---

## Deployment

- **Host**: Netlify (free tier, auto-deploy from Git)
- **Domain**: emdr.onl (existing)
- **HTTPS**: Required (for PWA, wake lock, audio)
- **CDN**: Netlify edge network
- **Analytics**: None (privacy-focused)

---

## Nice-to-Haves (Post-MVP)

- [ ] Multiple language support (i18n)
- [ ] Therapist mode (QR code to share preset configs)
- [ ] Apple Watch companion (haptic-only sessions)
- [ ] Integration with health apps (export sessions)
- [ ] Guided meditations library
- [ ] Community-submitted sound packs
- [ ] Donation/support page (Ko-fi, GitHub Sponsors)

---

## What to Remove from Current Codebase

❌ Guided mode (timed text prompts)
❌ Full form mode (overly complex)
❌ Step progress bar
❌ Unused settings (interactionMode, pauseBetweenSides, sessionEndMode)
❌ Hash-based routing
❌ Options API components
❌ .js files (migrate to .ts)
❌ Prop drilling through 5 components
❌ LocalStorage (upgrade to IndexedDB)
❌ Harsh sine waves only (add alternatives)
❌ EMDR-BLS folder (old merged codebase)

---

## Success Metrics

- ✅ Can complete a BLS session in < 10 seconds from app open
- ✅ Works completely offline
- ✅ Zero console errors/warnings
- ✅ Lighthouse score 95+ on all metrics
- ✅ WCAG 2.1 AA compliant
- ✅ Positive feedback from actual EMDR users/therapists
- ✅ No privacy concerns (no tracking, no external requests)
- ✅ Feels smooth and professional on mobile devices

---

**Built with**: Privacy, simplicity, and therapeutic effectiveness in mind.