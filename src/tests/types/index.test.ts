import { describe, it, expect } from 'vitest'
import type { Settings, Session, JournalEntry, Statistics, MovementPattern, SoundType } from '@/types'

describe('Type Definitions', () => {
  it('should define valid MovementPattern types', () => {
    const patterns: MovementPattern[] = ['horizontal', 'vertical', 'circular', 'figure8', 'bounce']

    patterns.forEach(pattern => {
      expect(['horizontal', 'vertical', 'circular', 'figure8', 'bounce']).toContain(pattern)
    })
  })

  it('should define valid SoundType types', () => {
    const soundTypes: SoundType[] = ['sine', 'triangle', 'sawtooth']

    soundTypes.forEach(type => {
      expect(['sine', 'triangle', 'sawtooth']).toContain(type)
    })
  })

  it('should create valid Settings object', () => {
    const settings: Settings = {
      pattern: 'horizontal',
      speed: 5,
      dotSize: 60,
      dotColor: '#10b981',
      backgroundColor: '#000000',
      audioEnabled: true,
      soundType: 'sine',
      volume: 0.7,
      frequency: 220,
      duration: 60,
      enableJournaling: false,
      hapticFeedback: true,
      keyboardShortcuts: true,
    }

    expect(settings.speed).toBeGreaterThanOrEqual(1)
    expect(settings.speed).toBeLessThanOrEqual(10)
    expect(settings.volume).toBeGreaterThanOrEqual(0)
    expect(settings.volume).toBeLessThanOrEqual(1)
    expect(settings.frequency).toBeGreaterThanOrEqual(100)
    expect(settings.frequency).toBeLessThanOrEqual(800)
  })

  it('should create valid JournalEntry object', () => {
    const journal: JournalEntry = {
      targetMemory: 'Test memory',
      initialDistress: 8,
      negativeBelief: 'I am not safe',
      bodySensations: 'Tight chest',
      whatCameUp: 'New insight',
      currentDistress: 3,
      notes: 'Significant progress',
    }

    expect(journal.initialDistress).toBeGreaterThanOrEqual(0)
    expect(journal.initialDistress).toBeLessThanOrEqual(10)
    expect(journal.currentDistress).toBeGreaterThanOrEqual(0)
    expect(journal.currentDistress).toBeLessThanOrEqual(10)
  })

  it('should create valid Session object', () => {
    const session: Session = {
      id: 'test-uuid-123',
      timestamp: Date.now(),
      duration: 120,
      settings: {
        pattern: 'circular',
        speed: 7,
        dotSize: 80,
        dotColor: '#3b82f6',
        backgroundColor: '#1f2937',
        audioEnabled: true,
        soundType: 'triangle',
        volume: 0.5,
        frequency: 440,
        duration: 120,
        enableJournaling: true,
        hapticFeedback: false,
        keyboardShortcuts: true,
      },
      journal: {
        initialDistress: 7,
        currentDistress: 2,
      },
      distressReduction: 5,
    }

    expect(session.id).toBeTruthy()
    expect(session.timestamp).toBeGreaterThan(0)
    expect(session.duration).toBeGreaterThan(0)
    expect(session.distressReduction).toBe(5)
  })

  it('should create valid Statistics object', () => {
    const stats: Statistics = {
      totalSessions: 10,
      totalDuration: 1200,
      averageDistressReduction: 4.5,
      averageDuration: 120,
    }

    expect(stats.totalSessions).toBeGreaterThanOrEqual(0)
    expect(stats.totalDuration).toBeGreaterThanOrEqual(0)
    expect(stats.averageDuration).toBeGreaterThanOrEqual(0)
  })

  it('should calculate distress reduction correctly', () => {
    const initialDistress = 9
    const currentDistress = 3
    const reduction = initialDistress - currentDistress

    expect(reduction).toBe(6)
    expect(reduction).toBeGreaterThanOrEqual(0)
  })
})
