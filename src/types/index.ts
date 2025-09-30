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

  // UX
  hapticFeedback: boolean
  keyboardShortcuts: boolean
}