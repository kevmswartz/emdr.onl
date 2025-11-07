import { describe, it, expect } from 'vitest'
import { useMovementPattern } from '@/composables/useMovementPattern'
import type { MovementPattern } from '@/types'

describe('useMovementPattern', () => {
  const { calculatePosition, getPanValue } = useMovementPattern()

  describe('calculatePosition', () => {
    it('should calculate horizontal position correctly', () => {
      const position = calculatePosition('horizontal', 0.5, 1)
      expect(position.x).toBe(0.5)
      expect(position.y).toBe(0.5)
    })

    it('should calculate vertical position correctly', () => {
      const position = calculatePosition('vertical', 0.5, 1)
      expect(position.x).toBe(0.5)
      expect(position.y).toBe(0.5)
    })

    it('should calculate circular position correctly', () => {
      const position = calculatePosition('circular', 0.25, 1)
      // At 0.25 progress (90 degrees), x should be near center-left, y near top
      expect(position.x).toBeGreaterThanOrEqual(0)
      expect(position.x).toBeLessThanOrEqual(1)
      expect(position.y).toBeGreaterThanOrEqual(0)
      expect(position.y).toBeLessThanOrEqual(1)
    })

    it('should calculate figure8 position correctly', () => {
      const position = calculatePosition('figure8', 0, 1)
      // At start, x at center, y at center
      expect(position.x).toBeCloseTo(0.5, 1)
      expect(position.y).toBeCloseTo(0.5, 1)
    })

    it('should calculate bounce position correctly', () => {
      const position = calculatePosition('bounce', 0, 1)
      // Bounce returns center point
      expect(position.x).toBe(0.5)
      expect(position.y).toBe(0.5)
    })

    it('should handle progress bounds (0 to 1)', () => {
      const patterns: MovementPattern[] = ['horizontal', 'vertical', 'circular', 'figure8', 'bounce']

      patterns.forEach(pattern => {
        const pos0 = calculatePosition(pattern, 0, 1)
        const pos1 = calculatePosition(pattern, 1, 1)

        expect(pos0.x).toBeGreaterThanOrEqual(0)
        expect(pos0.x).toBeLessThanOrEqual(1)
        expect(pos1.x).toBeGreaterThanOrEqual(0)
        expect(pos1.x).toBeLessThanOrEqual(1)
      })
    })

    it('should handle reverse direction', () => {
      const forward = calculatePosition('horizontal', 0.75, 1)
      const reverse = calculatePosition('horizontal', 0.75, -1)

      // For horizontal, reverse should be opposite x position
      expect(forward.x).toBe(0.75)
      expect(reverse.x).toBe(0.25)
    })
  })

  describe('getPanValue', () => {
    it('should return correct pan value for horizontal pattern', () => {
      const panLeft = getPanValue('horizontal', { x: 0, y: 0.5 })
      const panCenter = getPanValue('horizontal', { x: 0.5, y: 0.5 })
      const panRight = getPanValue('horizontal', { x: 1, y: 0.5 })

      expect(panLeft).toBe(-1)
      expect(panCenter).toBe(0)
      expect(panRight).toBe(1)
    })

    it('should return correct pan value for vertical pattern', () => {
      const panLeft = getPanValue('vertical', { x: 0.5, y: 0 })
      const panRight = getPanValue('vertical', { x: 0.5, y: 1 })

      expect(panLeft).toBe(-1)
      expect(panRight).toBe(1)
    })

    it('should return correct pan value for circular pattern', () => {
      const pan = getPanValue('circular', { x: 0.75, y: 0.5 })
      expect(pan).toBeGreaterThanOrEqual(-1)
      expect(pan).toBeLessThanOrEqual(1)
    })

    it('should clamp pan value between -1 and 1', () => {
      const patterns: MovementPattern[] = ['horizontal', 'vertical', 'circular', 'figure8', 'bounce']

      patterns.forEach(pattern => {
        for (let x = 0; x <= 1; x += 0.1) {
          for (let y = 0; y <= 1; y += 0.1) {
            const pan = getPanValue(pattern, { x, y })
            expect(pan).toBeGreaterThanOrEqual(-1)
            expect(pan).toBeLessThanOrEqual(1)
          }
        }
      })
    })
  })
})
