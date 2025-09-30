export interface Settings {
  // Visual
  speed: number // 1-10
  dotSize: number // 20-120
  dotColor: string // hex
  backgroundColor: string // hex

  // Audio
  audioEnabled: boolean
  volume: number // 0-1
  frequency: number // 100-800 Hz

  // Session
  duration: number // seconds
}