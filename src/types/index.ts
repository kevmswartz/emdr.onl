export type MovementPattern = 'horizontal' | 'vertical' | 'circular' | 'figure8'
export type SoundType = 'sine' | 'triangle' | 'sawtooth'

export interface Settings {
  // Visual
  pattern: MovementPattern
  speed: number // 1-10
  dotSize: number // 20-120
  dotColor: string // hex
  backgroundColor: string // hex

  // Audio
  audioEnabled: boolean
  soundType: SoundType
  volume: number // 0-1
  frequency: number // 100-800 Hz

  // Session
  duration: number // seconds
  enableJournaling: boolean

  // UX
  hapticFeedback: boolean
  keyboardShortcuts: boolean
}

export interface JournalEntry {
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

export interface Session {
  id: string // uuid
  timestamp: number
  duration: number // seconds

  // Settings snapshot
  settings: Settings

  // Journal if enabled
  journal?: JournalEntry

  // Calculated
  distressReduction?: number
}

export interface Statistics {
  totalSessions: number
  totalDuration: number // seconds
  averageDistressReduction: number
  averageDuration: number // seconds
}