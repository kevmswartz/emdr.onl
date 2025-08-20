import { renderHook } from '@testing-library/react-native';
import { useBLSSettings } from '../../hooks/useSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useBLSSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return default settings when no stored settings exist', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useBLSSettings());

    // Initially loading should be true
    expect(result.current.loading).toBe(true);
    expect(result.current.settings).toBe(null);
    expect(typeof result.current.updateSettings).toBe('function');
  });

  it('should have proper default settings structure', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({
      speed: 1.8,
      duration: 20,
      shape: 'circle',
      size: 'medium',
      autoSlow: true,
      autoSlowAmount: 20,
      audio: {
        enabled: true,
        volume: 0.7,
        leftFreq: 220,
        rightFreq: 330,
      },
      visual: {
        backgroundColor: '#000000',
        shapeColor: '#ffffff',
        breathingCue: false,
      },
    }));

    const { result, waitForNextUpdate } = renderHook(() => useBLSSettings());

    // Wait for settings to load
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.settings).toMatchObject({
      speed: 1.8,
      duration: 20,
      shape: 'circle',
      size: 'medium',
      autoSlow: true,
      audioSettings: expect.objectContaining({
        enabled: expect.any(Boolean),
        volume: expect.any(Number),
      }),
      visual: expect.objectContaining({
        backgroundColor: expect.any(String),
        shapeColor: expect.any(String),
      }),
    });
  });
});