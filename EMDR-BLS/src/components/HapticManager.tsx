import * as Haptics from 'expo-haptics';

interface HapticSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
}

class HapticManager {
  private settings: HapticSettings = {
    enabled: true,
    intensity: 'medium',
  };

  async triggerSide() {
    if (!this.settings.enabled) return;

    try {
      switch (this.settings.intensity) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  async triggerTest() {
    if (!this.settings.enabled) return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic test failed:', error);
    }
  }

  updateSettings(newSettings: Partial<HapticSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): HapticSettings {
    return { ...this.settings };
  }
}

export const hapticManager = new HapticManager();