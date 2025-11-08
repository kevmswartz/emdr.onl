import type { MovementPattern } from '../types'

export interface PatternPosition {
  x: number // 0-1 range
  y: number // 0-1 range
}

export function useMovementPattern() {
  const calculatePosition = (
    pattern: MovementPattern,
    progress: number, // 0-1
    direction: number // 1 or -1
  ): PatternPosition => {
    switch (pattern) {
      case 'horizontal':
        return {
          x: direction === 1 ? progress : 1 - progress,
          y: 0.5,
        }

      case 'vertical':
        return {
          x: 0.5,
          y: direction === 1 ? progress : 1 - progress,
        }

      case 'circular': {
        // Full circle, clockwise
        const angle = progress * Math.PI * 2 * direction
        return {
          x: 0.5 + Math.cos(angle) * 0.35, // 35% of width/height
          y: 0.5 + Math.sin(angle) * 0.35,
        }
      }

      case 'figure8': {
        // Lissajous curve (figure-8) - slower, half pattern per cycle
        const angle = progress * Math.PI
        return {
          x: 0.5 + Math.sin(angle) * 0.35,
          y: 0.5 + Math.sin(angle * 2) * 0.35 * direction,
        }
      }

      case 'bounce': {
        // Bouncing pattern (like DVD screensaver)
        // Uses progress to determine position in bounce cycle
        // This will be handled specially in SessionView with velocity tracking
        return { x: 0.5, y: 0.5 }
      }

      default:
        return { x: 0.5, y: 0.5 }
    }
  }

  const getPanValue = (pattern: MovementPattern, position: PatternPosition): number => {
    // Return -1 (left) to 1 (right) based on x position
    if (pattern === 'vertical') {
      // For vertical, use y position
      return (position.y - 0.5) * 2
    }
    return (position.x - 0.5) * 2
  }

  return {
    calculatePosition,
    getPanValue,
  }
}