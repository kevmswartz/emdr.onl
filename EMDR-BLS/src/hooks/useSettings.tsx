import { useState, useEffect } from 'react';
import { settingsStorage, BLSSettings, GlobalSettings } from '../storage/SettingsStorage';

export function useBLSSettings() {
  const [settings, setSettings] = useState<BLSSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await settingsStorage.getBLSSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.warn('Failed to load BLS settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<BLSSettings>) => {
    if (!settings) return;
    
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
      await settingsStorage.setBLSSettings(updated);
    } catch (error) {
      console.warn('Failed to save BLS settings:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  return {
    settings,
    updateSettings,
    loading,
  };
}

export function useGlobalSettings() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await settingsStorage.getGlobalSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.warn('Failed to load global settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<GlobalSettings>) => {
    if (!settings) return;
    
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
      await settingsStorage.setGlobalSettings(updated);
    } catch (error) {
      console.warn('Failed to save global settings:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  return {
    settings,
    updateSettings,
    loading,
  };
}