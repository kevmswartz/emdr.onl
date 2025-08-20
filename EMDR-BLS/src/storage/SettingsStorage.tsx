import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BLSSettings {
  speed: number;
  duration: number; // minutes
  shape: 'circle' | 'triangle' | 'square';
  size: 'small' | 'medium' | 'large';
  autoSlow: boolean;
  autoSlowAmount: number; // percentage
  audio: {
    enabled: boolean;
    volume: number;
    leftFreq: number;
    rightFreq: number;
  };
  haptics: {
    enabled: boolean;
    intensity: 'light' | 'medium' | 'heavy';
  };
  visual: {
    backgroundColor: string;
    shapeColor: string;
    breathingCue: boolean;
  };
}

export interface GlobalSettings {
  theme: 'system' | 'light' | 'dark';
  defaultBLSSettings: BLSSettings;
}

const DEFAULT_BLS_SETTINGS: BLSSettings = {
  speed: 0.5,
  duration: 20,
  shape: 'circle',
  size: 'medium',
  autoSlow: true,
  autoSlowAmount: 20,
  audio: {
    enabled: true,
    volume: 0.7,
    leftFreq: 440,
    rightFreq: 523,
  },
  haptics: {
    enabled: true,
    intensity: 'medium',
  },
  visual: {
    backgroundColor: '#000000',
    shapeColor: '#ffffff',
    breathingCue: false,
  },
};

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  theme: 'system',
  defaultBLSSettings: DEFAULT_BLS_SETTINGS,
};

const STORAGE_KEYS = {
  BLS_SETTINGS: 'bls_settings',
  GLOBAL_SETTINGS: 'global_settings',
};

class SettingsStorage {
  async getBLSSettings(): Promise<BLSSettings> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.BLS_SETTINGS);
      if (stored) {
        return { ...DEFAULT_BLS_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load BLS settings:', error);
    }
    return DEFAULT_BLS_SETTINGS;
  }

  async setBLSSettings(settings: Partial<BLSSettings>): Promise<void> {
    try {
      const current = await this.getBLSSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.BLS_SETTINGS, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save BLS settings:', error);
    }
  }

  async getGlobalSettings(): Promise<GlobalSettings> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.GLOBAL_SETTINGS);
      if (stored) {
        return { ...DEFAULT_GLOBAL_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load global settings:', error);
    }
    return DEFAULT_GLOBAL_SETTINGS;
  }

  async setGlobalSettings(settings: Partial<GlobalSettings>): Promise<void> {
    try {
      const current = await this.getGlobalSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.GLOBAL_SETTINGS, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save global settings:', error);
    }
  }

  async resetToDefaults(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.BLS_SETTINGS,
        STORAGE_KEYS.GLOBAL_SETTINGS,
      ]);
    } catch (error) {
      console.warn('Failed to reset settings:', error);
    }
  }
}

export const settingsStorage = new SettingsStorage();