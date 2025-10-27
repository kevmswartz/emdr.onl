# EMDR.online Overview

[Visit EMDR.online](https://emdr.online)

## What It Is
EMDR.online is a browser-based bilateral stimulation experience crafted for therapists, coaches, and clients who rely on Eye Movement Desensitization and Reprocessing (EMDR) techniques. The app recreates the core sensory cues of an in-person EMDR session—visual tracking, alternating audio tones, and optional haptics—inside a focused single-screen interface. Rather than being a generic relaxation toy, it provides a structured session flow, safe defaults, and rich controls so practitioners can tailor stimulation to the needs of the person in front of them.

## Why It Exists
The project was rebuilt to replace a legacy codebase that had grown brittle and cluttered after years of incremental features. The goal is to keep the tool trustworthy in therapeutic settings: quick to open on a phone or tablet, reliable even when bandwidth is spotty, and respectful of privacy by keeping every journal entry and configuration on the device. EMDR practitioners asked for something they could hand to a client without a training session, and something they could still fine-tune when deeper processing or crisis work demanded it. That tension—simplicity wrapped around professional-grade control—drives the current architecture and roadmap.

## Core Experience
- **Guided launch:** A home screen gathers the essentials (pattern, duration, speed, tone, color) and starts a bilateral stimulation sequence with a single tap.
- **Adaptive visuals:** Five motion paths (horizontal, vertical, circular, figure-eight, and bounce) animate an adjustable dot across a fullscreen canvas to match client tolerance and therapist preference.
- **Layered stimulation:** Web Audio–driven tones pan left to right in sync with the visuals, with quick access to volume and waveform choices; optional device vibrations reinforce the rhythm on supported hardware.
- **Therapeutic journaling:** When enabled, pre- and post-session forms capture target memories, subjective distress ratings, and free-form notes to anchor progress.
- **Progress intelligence:** A history dashboard stores sessions locally in IndexedDB, surfaces aggregate statistics (total time, averages, distress change), and lets practitioners export records as JSON or CSV.
- **Accessibility defaults:** System theme and reduced-motion preferences are honoured automatically, keyboard shortcuts mirror common therapist workflows, and wake locks keep the screen alive during longer sets.

## Under the Hood
- **Framework:** Vue 3 with the `<script setup>` composition API keeps components concise while TypeScript models the intricate session state.
- **Build tooling:** Vite drives fast dev cycles and modern bundling; Tailwind CSS supplies a utility-first design system that stays consistent across themes.
- **Platform APIs:** Composables wrap the Web Audio API, Canvas animations, the Screen Wake Lock, Gamepad-level haptics, and IndexedDB so each concern stays isolated and testable.
- **Data stewardship:** No analytics, no network calls, and no servers—everything persists locally unless a user chooses to export a file.

## What’s Next
The rebuild lives alongside an ambitious specification (`REBUILD_SPEC.md`) that outlines progressive layers: richer sound libraries, deeper movement presets, service-worker-powered offline installs, and advanced statistics. Because the foundations are already componentized and typed, the team can grow the experience without reintroducing the complexity that sparked the reboot. In the meantime, EMDR.online is already a dependable session companion: open browser, press start, and focus on the therapeutic work rather than the tooling.
