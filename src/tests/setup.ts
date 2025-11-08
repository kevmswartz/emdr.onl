// Vitest setup file
import { vi } from 'vitest'

// Mock Web APIs that aren't available in happy-dom
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn() },
    type: 'sine',
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn() },
  })),
  createStereoPanner: vi.fn(() => ({
    connect: vi.fn(),
    pan: { setValueAtTime: vi.fn() },
  })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn(),
  close: vi.fn(),
}))

// Mock navigator.vibrate
global.navigator.vibrate = vi.fn()

// Mock Screen Wake Lock API
Object.defineProperty(global.navigator, 'wakeLock', {
  writable: true,
  value: {
    request: vi.fn().mockResolvedValue({
      release: vi.fn().mockResolvedValue(undefined),
      released: false,
      type: 'screen',
    }),
  },
})

// Mock IndexedDB
const mockIDBFactory = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  databases: vi.fn(),
  cmp: vi.fn(),
}

global.indexedDB = mockIDBFactory as any
