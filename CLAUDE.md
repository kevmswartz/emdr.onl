# EMDR Bilateral Stimulation App Specifications

## Technology Stack

### Primary Option: React Native + Expo
- **Framework:** React Native with Expo
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** React Navigation v6
- **State Management:** React hooks (useState, useContext)
- **Storage:** AsyncStorage for local persistence
- **Audio:** Expo AV
- **Haptics:** Expo Haptics
- **Animations:** React Native Reanimated

## App Architecture

### Two Primary Modes
1. **Guided EMDR Session** - Full therapeutic protocol
2. **Bilateral Stimulation Tool** - Self-contained BLS with integrated settings

### Navigation Structure
```
Main Menu
├── Bilateral Stimulation Tool → BLSSessionScreen
├── Guided EMDR Session → SessionSetupScreen → BLSSessionScreen → Installation → BodyScan → Summary
└── Global Settings
```

### BLS Configuration Modal
- **Accessed from:** Settings button in BLSSessionScreen
- **Type:** Modal/popup overlay (not navigation screen)
- **Contains:** All bilateral stimulation configuration options

## Screens (7 Total)

### Core Screens
1. **MainMenuScreen** - Entry point with mode selection
2. **BLSSessionScreen** - Unified full-screen bilateral stimulation (used by both modes)
3. **BLSConfigScreen** - Settings modal/popup (accessed from BLSSessionScreen)
4. **GlobalSettingsScreen** - App-wide preferences

### Guided EMDR Flow
5. **SessionSetupScreen** - Target memory, cognitions, initial setup
6. **InstallationPhaseScreen** - Positive cognition installation
7. **BodyScanScreen** - Body awareness phase
8. **SessionSummaryScreen** - Session recap and notes

## Screen Details

### 1. MainMenuScreen
- App title/logo
- Two primary buttons:
  - "Bilateral Stimulation Tool"
  - "Guided EMDR Session"
- Global settings gear icon (bottom corner)
- Clean, calming design

### 2. BLSSessionScreen (Unified)
**Used by both BLS Tool and Guided Sessions - EXACTLY identical implementation**

**Visual Area:**
- Full-screen bilateral stimulation animation
- Clean, immersive experience with chosen background

**Unified Control Panel:**
- **Session Info:** Session timer, cycle count, real-time Hz rate display
- **Controls:** Pause/Resume button, Settings gear button, Stop button with text label
- **Styling:** Rounded panel with dark background

**Key:** Both modes use this EXACT same screen with EXACT same bilateral stimulation logic.

### 3. BLSConfigScreen (Modal)
**Accessed via settings button in BLSSessionScreen**
- **Speed Control:** ±0.1 Hz adjustment buttons (0.2-2.0 Hz range)
- **Duration Control:** ±5 minute adjustment buttons (1-60 min range)
- **Shape Selector:** Circle, Triangle, Square options with visual previews
- **Size Options:** Small, Medium, Large selection
- **Background Colors:** Black, Dark Gray, Green, Blue options
- **Shape Colors:** White, Red, Green, Blue, Orange options
- **Audio Settings:** Enable/disable toggle + test button
- **Auto-Slow:** Toggle with reduction percentage (5-50%)
- **Preview Area:** Live preview of bilateral stimulation with current settings

### 4. GlobalSettingsScreen
**App-Wide Preferences:**
- **Theme Settings:** Follow system / Force light / Force dark
- **Default Preferences:** Set defaults for new BLS sessions
- **About/Help:** App information and usage guide
- **Privacy:** Data handling, reset all data option

### 5. SessionSetupScreen
- **Instructions:** Brief EMDR setup explanation
- **Target Memory:** Text input field
- **Initial SUDS:** 0-10 distress scale slider
- **Negative Cognition:** "I am..." input field
- **Positive Cognition:** "I am..." input field
- **BLS Preferences:** Quick speed/shape selection
- **Begin Processing** button

### 6. InstallationPhaseScreen
- **Display chosen positive cognition** prominently
- **Modified bilateral stimulation** (slightly different rhythm)
- **VoC Rating:** 1-7 scale ("How true does this feel?")
- **Continue until VoC reaches 6-7**
- **Automatic progression** to body scan

### 7. BodyScanScreen
- **Instructions:** "Notice any sensations in your body"
- **Optional body diagram** for marking areas
- **Continue stimulation** if tension/sensations found
- **Complete when clear** button
- **Skip if no sensations** option

### 8. SessionSummaryScreen
- **Before/After Comparison:**
  - Initial SUDS vs Final SUDS
  - Session duration
  - Phases completed
- **Notes Section:** Optional reflection field
- **Actions:**
  - Save session notes
  - Return to menu
  - Start new session

## Core Features & Options

### Unified BLS Architecture
**BLSSessionScreen:**
- **Single implementation** used by both BLS Tool and Guided Sessions
- **Identical bilateral stimulation logic** - no duplicate code
- **Unified control panel** with same buttons, same behavior, same appearance
- **Single settings modal** (BLSConfigScreen) accessed from settings button

**Key Principle:** ONE bilateral stimulation implementation eliminates all inconsistencies

### Bilateral Stimulation Engine
**Visual Component:**
- Smooth animated movement between left/right positions
- Platform-optimized animations (native driver on mobile, JS on web)
- Configurable shapes: circle, triangle, square with visual previews
- Three size options: small (32px), medium (48px), large (72px)
- Responsive movement range (90% of screen width)
- Movement frequency controls bilateral rate (0.2-2.0 Hz range)

**Audio Component:**
- Dual-tone system: LEFT (440 Hz) and RIGHT (523 Hz) frequencies
- Audio triggers on arrival at each side position
- Volume control with real-time test function
- Enable/disable toggle with immediate audio manager updates
- Web Audio API implementation for consistent cross-platform experience

**Haptic Component:**
- Vibration pulse synchronized with audio on each side arrival
- Platform-aware implementation (mobile only)
- Simple trigger system via Expo Haptics
- Graceful fallback on unsupported devices

**Real-time Speed Control:**
- Live Hz rate display: shows current speed including auto-slow adjustments
- Starting frequency: 0.2-2.0 Hz (adjustable in 0.1 Hz increments)
- Auto-slow: gradual reduction of 5-50% over session duration
- Speed changes reflected immediately in UI and audio timing
- Minimum speed floor of 0.2 Hz to prevent stopping

### Data Storage (Local Only)

**Global App Preferences:**
```json
{
  "theme": "system|light|dark",
  "defaultBLSSettings": {
    "speed": 1.8,
    "duration": 20,
    "shape": "dot",
    "autoSlow": true
  }
}
```

**BLS Session Settings:**
```json
{
  "current": {
    "speed": 1.8,
    "duration": 20,
    "shape": "dot",
    "size": "medium",
    "autoSlow": true,
    "autoSlowAmount": 20,
    "audio": {
      "enabled": true,
      "volume": 0.7
    },
    "haptics": {
      "enabled": true,
      "intensity": "medium"
    },
    "visual": {
      "backgroundColor": "black",
      "breathingCue": false
    }
  }
}
```

**Guided Session Data:**
```json
{
  "sessionId": "timestamp",
  "targetMemory": "Brief description",
  "sudsInitial": 8,
  "sudsFinal": 3,
  "negativeBeliefe": "I am helpless",
  "positiveBeliefe": "I am capable",
  "vocFinal": 6,
  "duration": "00:18:42",
  "phasesCompleted": ["setup", "processing", "installation", "bodyScan"],
  "notes": "Optional user notes",
  "completed": true
}
```

## User Experience Flow

### BLS Tool Usage
1. **Tap "Bilateral Stimulation Tool"** from main menu
2. **See default settings** pre-loaded (duration, speed, shape)
3. **Adjust primary controls** if needed (always visible)
4. **Press "Start Full Screen Session"** to begin
5. **Monitor session progress** via timer and cycle count
6. **Access settings via gear button** for real-time adjustments
7. **Use pause/resume or stop** to control session

### Guided Session Usage
1. **Complete session setup** with target memory and cognitions
2. **Begin processing phase** with unified BLS interface
3. **Access settings anytime** via blue "Settings" button
4. **Monitor progress** with timer and cycle tracking
5. **Trigger installation** when ready via floating button
6. **Real-time adjustments** apply immediately during session

### Unified Control Panel Design
**Consistent Interface Elements:**
- **Bottom Control Panel:** Rounded dark panel with session info and controls
- **Session Information Display:** Title, cycle count, elapsed time, real-time Hz rate
- **Color-Coded Controls:** 
  - Orange pause button, green resume button
  - Blue check-in/action buttons
  - Red emergency/stop buttons
- **Typography:** Clear hierarchy with bold session info and colored Hz display
- **Responsive Layout:** Adapts to different screen sizes and orientations

**Cross-Mode Consistency:**
- Both BLS Tool and Guided Session use identical control panel styling
- Same button layouts and interaction patterns
- Consistent spacing, colors, and visual feedback
- Unified accessibility labels and hints

### Settings Persistence
- **BLS settings save automatically** when changed
- **Global defaults** apply to new sessions  
- **Last session settings** remembered for BLS tool
- **Guided session preferences** separate from BLS tool
- **Real-time updates** reflect immediately in preview and session interfaces

## Technical Requirements

### Performance
- **Smooth 60fps animations** via platform-optimized drivers (native on mobile, JS on web)
- **Low latency** audio/haptic feedback (<50ms) with Web Audio API
- **Real-time speed tracking** with immediate UI updates during auto-slow
- **Responsive controls** with immediate visual and audio feedback
- **Efficient battery usage** during long sessions with optimized animation cycles
- **Cross-platform compatibility** handling web, iOS, and Android platforms

### Accessibility
- **High contrast support** with clear color differentiation for controls
- **Screen reader compatibility** with comprehensive accessibility labels and hints
- **Large touch targets** (minimum 44pt) for all interactive elements
- **Reduced motion respect** with alternative static positioning for accessibility users
- **Live region announcements** for session state changes and speed updates
- **Alternative interaction methods** with full keyboard and assistive technology support

### Platform Compatibility
- **Web Support:** Full functionality in modern browsers with graceful feature detection
- **Mobile Support:** iOS 12+ / Android 8+ with native performance optimizations
- **Responsive Design:** Adapts to phone and tablet layouts seamlessly
- **Orientation Handling:** Portrait/landscape support with safe area awareness
- **Feature Detection:** Graceful degradation for unsupported platform features (orientation, haptics)

## Development Status

### ✅ Phase 1: Core BLS Tool (COMPLETED)
- ✅ Bilateral stimulation engine with platform optimization
- ✅ Integrated controls (speed, duration, shape, colors)
- ✅ Audio/haptic feedback with Web Audio API
- ✅ Settings persistence with real-time updates
- ✅ Clean, unified interface design

### ✅ Phase 2: Advanced BLS Features (COMPLETED)
- ✅ Integrated settings interface (no modal needed)
- ✅ Auto-slow functionality with real-time display
- ✅ Visual customization (background/shape colors, sizes)
- ✅ Global settings screen integration
- ✅ Consistent control panel design

### ✅ Phase 3: Guided EMDR Protocol (COMPLETED)
- ✅ Complete session flow implementation
- ✅ Settings modal system (replaced check-in overlays)
- ✅ Session phases with unified control panels
- ✅ Processing, Installation, and Body Scan screens
- ✅ Simplified session controls and safety features

### ✅ Phase 4: Platform & UX Polish (COMPLETED)
- ✅ Cross-platform compatibility (web, iOS, Android)
- ✅ Accessibility improvements with screen reader support
- ✅ Performance optimization with platform detection
- ✅ Error handling for unsupported features
- ✅ Consistent user experience across all modes

### ✅ Phase 5: Architecture Unification (COMPLETED)
- ✅ **BLSSession component** - Single bilateral stimulation implementation
- ✅ **Timer and cycle tracking** - Added to BLS Tool for consistency
- ✅ **Working stop button** - Fixed guided session exit functionality
- ✅ **Settings modal** - Real-time adjustments during guided sessions
- ✅ **Eliminated code duplication** - Unified control panel across modes

### 🎯 Current State: Production Ready
The app now features a complete, polished implementation with:
- **Unified BLS architecture** eliminating code duplication
- **Consistent user experience** across BLS Tool and Guided Sessions
- **Real-time session tracking** with timer and cycle count in both modes
- **In-session settings** available during guided sessions
- **Simplified controls** with working stop functionality
- **Platform-optimized performance** with comprehensive accessibility

## Security & Privacy

### Data Handling
- **No external transmission** - all data stays on device
- **Local storage only** - AsyncStorage/localStorage
- **No user accounts** or authentication required
- **Clear data option** in settings
- **Transparent privacy policy**

### Clinical Considerations
- **Appropriate disclaimers** about therapeutic use
- **Professional guidance recommendations** for trauma work
- **Crisis resources** and emergency contacts
- **Tool vs therapy clarification**
- **Informed consent** for guided sessions

## UI/UX Principles

### Design Philosophy
- **Therapeutic minimalism** - reduce distractions
- **Progressive disclosure** - advanced features when needed
- **Immediate feedback** - visual/audio/haptic confirmation
- **Respectful defaults** - sensible starting points
- **User control** - full customization available

### Visual Design
- **Calming color palette** with theme options
- **Smooth animations** that feel therapeutic
- **Clear typography** with good contrast
- **Spacious layouts** to reduce cognitive load
- **Consistent patterns** throughout the app

This specification provides a complete roadmap for building a therapeutically sound, user-friendly EMDR bilateral stimulation app with integrated settings and proper clinical protocol support.