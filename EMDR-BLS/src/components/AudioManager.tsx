// Platform-specific audio: Web Audio API for web, Expo AV for mobile
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

interface AudioSettings {
  enabled: boolean;
  volume: number;
  leftFreq: number;
  rightFreq: number;
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private leftSound: Audio.Sound | null = null;
  private rightSound: Audio.Sound | null = null;
  private settings: AudioSettings = {
    enabled: true,
    volume: 0.7,
    leftFreq: 440, // A4
    rightFreq: 523, // C5
  };

  async initialize() {
    try {
      if (Platform.OS === 'web') {
        // Web: Use AudioContext
        if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass && typeof AudioContextClass === 'function') {
            this.audioContext = new AudioContextClass();
            console.log('Audio manager initialized, state:', this.audioContext.state);
            
            // Note: Context will be in 'suspended' state until user interaction
            // This is normal browser behavior for autoplay protection
            if (this.audioContext.state === 'suspended') {
              console.log('🔇 Audio context suspended - will resume on first play attempt');
            }
          } else {
            console.warn('AudioContext not available on this platform');
          }
        } else {
          console.warn('AudioContext not supported on this platform');
        }
      } else {
        // Mobile: Use Expo AV
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
        });
        
        // Create simple beep sounds for mobile
        const { sound: leftSound } = await Audio.Sound.createAsync({
          uri: `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMG`
        });
        const { sound: rightSound } = await Audio.Sound.createAsync({
          uri: `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCjiH0fPTgjMG`
        });
        
        this.leftSound = leftSound;
        this.rightSound = rightSound;
        
        await this.leftSound.setVolumeAsync(this.settings.volume);
        await this.rightSound.setVolumeAsync(this.settings.volume);
        
        console.log('Audio manager initialized for mobile');
      }
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  async testAudio() {
    try {
      console.log('🔊 Testing audio...');
      await this.playLeft();
      setTimeout(async () => {
        await this.playRight();
      }, 300);
      return true;
    } catch (error) {
      console.warn('Audio test failed:', error);
      return false;
    }
  }

  // Removed createToneSound method - using direct Web Audio API calls

  async playLeft() {
    if (!this.settings.enabled) return;
    
    try {
      if (Platform.OS === 'web') {
        // Web: Use AudioContext
        if (!this.audioContext || this.audioContext.state === 'closed') {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass || typeof AudioContextClass !== 'function') {
            console.warn('AudioContext not available for creating fresh context');
            return;
          }
          this.audioContext = new AudioContextClass();
        }
        
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(this.settings.leftFreq, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.4, this.audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
        
        console.log('🔊 Playing LEFT tone:', this.settings.leftFreq, 'Hz', 'Context state:', this.audioContext.state);
      } else {
        // Mobile: Use Expo AV
        if (this.leftSound) {
          await this.leftSound.replayAsync();
          console.log('🔊 Playing LEFT tone on mobile');
        }
      }
    } catch (error) {
      console.warn('Failed to play left tone:', error);
    }
  }

  async playRight() {
    if (!this.settings.enabled) return;
    
    try {
      if (Platform.OS === 'web') {
        // Web: Use AudioContext
        if (!this.audioContext || this.audioContext.state === 'closed') {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass || typeof AudioContextClass !== 'function') {
            console.warn('AudioContext not available for creating fresh context');
            return;
          }
          this.audioContext = new AudioContextClass();
        }
        
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(this.settings.rightFreq, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.4, this.audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
        
        console.log('🔊 Playing RIGHT tone:', this.settings.rightFreq, 'Hz', 'Context state:', this.audioContext.state);
      } else {
        // Mobile: Use Expo AV
        if (this.rightSound) {
          await this.rightSound.replayAsync();
          console.log('🔊 Playing RIGHT tone on mobile');
        }
      }
    } catch (error) {
      console.warn('Failed to play right tone:', error);
    }
  }

  async updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Update mobile sound volumes if they exist
    if (Platform.OS !== 'web' && newSettings.volume !== undefined) {
      try {
        if (this.leftSound) {
          await this.leftSound.setVolumeAsync(this.settings.volume);
        }
        if (this.rightSound) {
          await this.rightSound.setVolumeAsync(this.settings.volume);
        }
      } catch (error) {
        console.warn('Failed to update mobile audio volume:', error);
      }
    }
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  async cleanup() {
    try {
      if (Platform.OS === 'web') {
        // Web: Clean up AudioContext
        if (this.audioContext && this.audioContext.state !== 'closed') {
          await this.audioContext.close();
          this.audioContext = null;
        }
      } else {
        // Mobile: Clean up Expo AV sounds
        if (this.leftSound) {
          await this.leftSound.unloadAsync();
          this.leftSound = null;
        }
        if (this.rightSound) {
          await this.rightSound.unloadAsync();
          this.rightSound = null;
        }
      }
      console.log('Audio manager cleaned up');
    } catch (error) {
      console.warn('Audio cleanup failed:', error);
    }
  }
}

export const audioManager = new AudioManager();