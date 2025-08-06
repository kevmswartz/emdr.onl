# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file EMDR (Eye Movement Desensitization and Reprocessing) therapy tool built as a standalone HTML application. The entire application is contained in `index.html` with embedded CSS and JavaScript.

## Architecture

- **Single-page application**: All functionality is contained within `index.html`
- **Vanilla JavaScript**: No build process, frameworks, or dependencies
- **CSS Custom Properties**: Theme system using CSS variables for light/dark mode
- **Web Audio API**: Audio bilateral stimulation using stereo panning
- **RequestAnimationFrame**: Smooth visual dot animation with easing

## Key Components

### Visual System
- Animated dot that moves left-to-right across the screen
- Easing function (`easeInOutSine`) for smooth movement
- Configurable speed (1-10 scale mapping to 4000ms-2000ms cycle duration)

### Audio System  
- Stereo-panned sine wave tones (220Hz)
- Alternates between left (-1) and right (+1) audio channels
- Synchronized with visual movement timing

### Session Management
- Fullscreen session view that overlays the main interface
- Configurable duration (20-60 seconds)
- Safety feature: automatically stops on window focus loss

### Theme System
- Light/dark mode toggle with localStorage persistence
- CSS custom properties for consistent theming

## Development Notes

- No build system required - can be opened directly in browser
- No package.json or dependencies
- Testing should be done manually in browser
- Audio requires user interaction to start (Web Audio API policy)
- Responsive design works on mobile and desktop

## File Structure

```
/
├── index.html (entire application)
└── CLAUDE.md (this file)
```

## Common Tasks

Since this is a single HTML file with no build process:
- **Testing**: Open `index.html` in a web browser
- **Development**: Edit `index.html` directly
- **Deployment**: Serve the `index.html` file from any web server