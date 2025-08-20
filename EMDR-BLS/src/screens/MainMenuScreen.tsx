import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet, AccessibilityInfo } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

export function MainMenuScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Text 
        style={styles.title}
        accessibilityRole="header"
        accessibilityLabel="EMDR Bilateral Stimulation App"
      >
        EMDR
      </Text>
      <Text 
        style={styles.subtitle}
        accessibilityLabel="Bilateral Stimulation therapy tool"
      >
        Bilateral Stimulation
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('SessionSetup')}
          accessibilityRole="button"
          accessibilityLabel="Start Guided EMDR Session"
          accessibilityHint="Begin a complete EMDR therapy session with setup, processing, installation, and body scan phases"
        >
          <Text style={styles.buttonText}>Guided EMDR Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('BLSSession', { mode: 'bls-tool' })}
          accessibilityRole="button"
          accessibilityLabel="Open Bilateral Stimulation Tool"
          accessibilityHint="Access standalone bilateral stimulation with customizable settings for speed, shape, and audio"
        >
          <Text style={styles.buttonText}>Bilateral Stimulation Tool</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('GlobalSettings')}
        accessibilityRole="button"
        accessibilityLabel="Open Settings"
        accessibilityHint="Access global app settings, themes, and preferences"
      >
        <Ionicons name="settings" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#cbd5e1',
    marginBottom: 64,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 280,
    gap: 24,
  },
  button: {
    paddingVertical: 20, // Increased for larger touch target
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 56, // Ensures minimum 44pt touch target + padding
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: '#059669',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  settingsButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 50,
    minWidth: 56, // Ensures minimum 44pt touch target
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});