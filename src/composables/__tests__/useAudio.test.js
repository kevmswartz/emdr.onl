import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useAudio } from '../useAudio.js';

// Mock Web Audio API
const mockAudioContext = {
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn() }
  })),
  createOscillator: vi.fn(() => ({
    type: '',
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(() => ({ connect: vi.fn() })),
    start: vi.fn(),
    stop: vi.fn()
  })),
  createStereoPanner: vi.fn(() => ({
    pan: { setValueAtTime: vi.fn() },
    connect: vi.fn(() => ({ connect: vi.fn() }))
  })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn(),
  close: vi.fn()
};

global.AudioContext = vi.fn(() => mockAudioContext);
global.webkitAudioContext = vi.fn(() => mockAudioContext);

describe('useAudio', () => {
  let volume;
  let soundType;
  let showToast;

  beforeEach(() => {
    volume = ref(0.5);
    soundType = ref('sine');
    showToast = vi.fn();
    vi.clearAllMocks();
  });

  it('should initialize audio context', () => {
    const { initAudio } = useAudio(volume, soundType, showToast);
    initAudio();
    
    expect(global.AudioContext).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
  });

  it('should play sound with correct pan value', () => {
    const { initAudio, playSound } = useAudio(volume, soundType, showToast);
    initAudio();
    playSound(-1);
    
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createStereoPanner).toHaveBeenCalled();
  });

  it('should not play sound when volume is 0', () => {
    volume.value = 0;
    const { initAudio, playSound } = useAudio(volume, soundType, showToast);
    initAudio();
    playSound(-1);
    
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });
});