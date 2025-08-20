import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSettings } from '../hooks/useSettings';
import { settingsStorage } from '../storage/SettingsStorage';
import { useReducedMotion, useScreenReader } from '../hooks/useAccessibility';

type Props = NativeStackScreenProps<RootStackParamList, 'GlobalSettings'>;

export function GlobalSettingsScreen({ navigation }: Props) {
  const { settings, updateSettings, loading } = useGlobalSettings();
  const isReducedMotionEnabled = useReducedMotion();
  const isScreenReaderEnabled = useScreenReader();

  if (loading || !settings) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
    updateSettings({ theme });
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your settings and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await settingsStorage.resetToDefaults();
            Alert.alert('Reset Complete', 'All settings have been reset to defaults.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Theme Settings */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingTitle}>Theme Settings</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity 
              style={[styles.themeOption, settings.theme === 'system' && styles.themeSelected]}
              onPress={() => handleThemeChange('system')}
            >
              <Ionicons name="phone-portrait" size={20} color="white" />
              <Text style={styles.optionText}>Follow System</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.themeOption, settings.theme === 'light' && styles.themeSelected]}
              onPress={() => handleThemeChange('light')}
            >
              <Ionicons name="sunny" size={20} color="white" />
              <Text style={styles.optionText}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.themeOption, settings.theme === 'dark' && styles.themeSelected]}
              onPress={() => handleThemeChange('dark')}
            >
              <Ionicons name="moon" size={20} color="white" />
              <Text style={styles.optionText}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Default BLS Settings Info */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingTitle}>Default BLS Settings</Text>
          <Text style={styles.settingDescription}>
            Default settings are automatically applied to new BLS sessions. You can customize these in the BLS Tool.
          </Text>
          <View style={styles.defaultsInfo}>
            <Text style={styles.defaultLabel}>Speed: {settings.defaultBLSSettings.speed.toFixed(1)} Hz</Text>
            <Text style={styles.defaultLabel}>Duration: {settings.defaultBLSSettings.duration} minutes</Text>
            <Text style={styles.defaultLabel}>Shape: {settings.defaultBLSSettings.shape}</Text>
            <Text style={styles.defaultLabel}>Audio: {settings.defaultBLSSettings.audio.enabled ? 'Enabled' : 'Disabled'}</Text>
          </View>
        </View>

        {/* Accessibility Status */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingTitle}>Accessibility Status</Text>
          <Text style={styles.settingDescription}>
            Current accessibility settings detected from your device
          </Text>
          <View style={styles.accessibilityStatus}>
            <View style={styles.statusItem}>
              <Ionicons 
                name={isReducedMotionEnabled ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={isReducedMotionEnabled ? "#059669" : "#94a3b8"} 
              />
              <Text style={styles.statusText}>
                Reduced Motion: {isReducedMotionEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons 
                name={isScreenReaderEnabled ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={isScreenReaderEnabled ? "#059669" : "#94a3b8"} 
              />
              <Text style={styles.statusText}>
                Screen Reader: {isScreenReaderEnabled ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text style={styles.accessibilityNote}>
            The app automatically adapts to your accessibility preferences. Bilateral stimulation will use audio/haptic feedback instead of motion when reduced motion is enabled.
          </Text>
        </View>

        {/* About & Help */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingTitle}>About & Help</Text>
          <Text style={styles.settingDescription}>
            EMDR Bilateral Stimulation Tool v1.0.0{'\n'}
            Therapeutic bilateral stimulation for EMDR therapy support.
          </Text>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="help-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoButtonText}>Usage Guide</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy & Data */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingTitle}>Privacy & Data</Text>
          <Text style={styles.settingDescription}>
            All data is stored locally on your device. No information is transmitted to external servers.
          </Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetAllData}
            accessibilityRole="button"
            accessibilityLabel="Reset All Data"
            accessibilityHint="Warning: This will permanently delete all your settings and session data"
            accessible={true}
          >
            <Ionicons name="warning" size={20} color="#ef4444" />
            <Text style={styles.resetButtonText}>Reset All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  settingGroup: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  settingTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingDescription: {
    color: '#94a3b8',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    backgroundColor: '#4b5563',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  themeSelected: {
    backgroundColor: '#2563eb',
  },
  optionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  defaultsInfo: {
    backgroundColor: '#4b5563',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  defaultLabel: {
    color: '#e2e8f0',
    fontSize: 16,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4b5563',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4b5563',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  resetButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
  accessibilityStatus: {
    backgroundColor: '#4b5563',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    color: '#e2e8f0',
    fontSize: 16,
    flex: 1,
  },
  accessibilityNote: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});