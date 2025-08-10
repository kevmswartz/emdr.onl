# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an EMDR (Eye Movement Desensitization and Reprocessing) therapy tool built as a Vue.js single-page application. The app provides guided bilateral stimulation sessions with both visual and audio components for therapeutic purposes.

## Commands

- **Development**: `npm run dev` - Starts Vite dev server on port 8080
- **Build**: `npm run build` - Production build with Vite
- **Preview**: `npm run preview` - Preview production build locally
- **Linting**: `npm run lint` - Runs ESLint with Vue, TypeScript, and test plugins
- **Linting (fix)**: `npm run lint:fix` - Auto-fixes ESLint issues
- **Formatting**: `npm run format` - Runs Prettier to format code
- **Type Check**: `npm run type-check` - TypeScript type checking without emit
- **Testing**: `npm run test` - Runs Vitest tests
- **Test UI**: `npm run test:ui` - Opens Vitest UI for test debugging
- **Bundle Analysis**: `npm run build:analyze` - Build with bundle size analysis

## Architecture

- **Vue 3 Composition API**: Modern reactive framework with script setup pattern
- **TypeScript**: Full TypeScript support for better DX and type safety
- **Vite**: Fast build tool and dev server with Vue plugin and optimizations
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Vitest**: Fast testing framework integrated with Vite
- **Component-based**: Modular Vue components with clear separation of concerns
- **Composables**: Reusable logic for audio and wake lock functionality
- **LocalStorage**: Client-side persistence for settings, session data, and history
- **Hash-based routing**: Simple URL navigation without Vue Router

## Key Components

### Core Application Flow
- `App.vue` - Root component managing global state, routing, and composables
- `ModeSelection.vue` - Landing page for choosing session type (guided/quick)
- `MainContent.vue` - Main session management interface
- `SessionPlayer.vue` - Full-screen bilateral stimulation player
- `History.vue` - Session history viewing

### Step Components (Guided Mode)
- `Step1Preparation.vue` - Safe place establishment and memory targeting
- `Step2SetupAssessment.vue` - Initial distress and negative cognition assessment
- `Step3ProcessingSession.vue` - Main bilateral stimulation configuration
- `Step4Checkin.vue` - Post-processing assessment and notes
- `Step5Closing.vue` - Session completion and safe place return

### Composables
- `useAudio.js` - Web Audio API management for stereo-panned tones
- `useWakeLock.js` - Screen wake lock during sessions for uninterrupted therapy

## Data Management

### State Management
- All state managed through Vue 3 Composition API
- Reactive references for session data, settings, and UI state
- Watchers for side effects (theme application, session lifecycle)

### Persistence Strategy  
- **Settings**: Speed, duration, audio/visual preferences via `localStorage`
- **Session Data**: Current session form data with auto-save
- **History**: Last 50 sessions stored with timestamps
- **Theme**: Light/dark mode preference

### Session Flow
1. Mode selection (guided/quick)
2. Preparation and setup (guided only) 
3. Bilateral stimulation session
4. Post-processing check-in
5. Session completion and history save

## Technical Details

### Audio System
- Web Audio API with stereo panning (-1 to +1)
- 220Hz sine wave tones synchronized with visual movement
- Volume control and different waveform types
- Requires user interaction to initialize (browser policy)

### Visual System
- Animated dot with configurable size and color
- Easing-based movement (computed cycle duration: 4500ms - speed*250ms)
- Full-screen session view with wake lock
- Responsive design for all devices

### Safety Features
- Automatic session stop on window visibility change
- Wake lock to prevent screen sleep during sessions
- Toast notifications for user feedback
- Focus loss detection for session interruption