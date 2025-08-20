import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useBLSSettings } from '../hooks/useSettings';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSetup'>;

interface SessionData {
  targetMemory: string;
  initialSuds: number;
  negativeCognition: string;
  positiveCognition: string;
}

export function SessionSetupScreen({ navigation }: Props) {
  const { settings } = useBLSSettings();
  const [sessionData, setSessionData] = useState<SessionData>({
    targetMemory: '',
    initialSuds: 5,
    negativeCognition: '',
    positiveCognition: '',
  });

  const handleSudsChange = (delta: number) => {
    setSessionData(prev => ({
      ...prev,
      initialSuds: Math.max(0, Math.min(10, prev.initialSuds + delta))
    }));
  };

  const handleBeginProcessing = () => {
    // Validate form
    if (!sessionData.targetMemory.trim()) {
      Alert.alert('Missing Information', 'Please describe the target memory to process.');
      return;
    }
    if (!sessionData.negativeCognition.trim()) {
      Alert.alert('Missing Information', 'Please enter the negative belief about yourself.');
      return;
    }
    if (!sessionData.positiveCognition.trim()) {
      Alert.alert('Missing Information', 'Please enter the positive belief you want to install.');
      return;
    }

    // Navigate to BLSSession with guided mode and session data
    navigation.navigate('BLSSession', { mode: 'guided', sessionData });
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
        <Text style={styles.headerTitle}>EMDR Session Setup</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Setup Instructions</Text>
          <Text style={styles.instructionText}>
            This guided EMDR session will help you process a specific target memory. Please take your time to thoughtfully complete each field.
          </Text>
        </View>

        {/* Target Memory */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Target Memory *</Text>
          <Text style={styles.formHelp}>
            Briefly describe the memory or situation you want to process
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe the target memory..."
            placeholderTextColor="#9ca3af"
            value={sessionData.targetMemory}
            onChangeText={(text) => setSessionData(prev => ({ ...prev, targetMemory: text }))}
            multiline
            numberOfLines={3}
            accessibilityLabel="Target memory description"
            accessibilityHint="Enter a brief description of the memory or situation you want to process"
            accessible={true}
          />
        </View>

        {/* Initial SUDS */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Initial Distress Level (SUDS) *</Text>
          <Text style={styles.formHelp}>
            Rate your current distress when thinking about this memory (0 = no distress, 10 = highest distress)
          </Text>
          <View style={styles.sudsContainer}>
            <TouchableOpacity 
              style={styles.sudsButton}
              onPress={() => handleSudsChange(-1)}
              accessibilityRole="button"
              accessibilityLabel="Decrease distress level"
              accessibilityHint={`Current level is ${sessionData.initialSuds}. Tap to decrease.`}
              accessible={true}
            >
              <Ionicons name="remove" size={24} color="white" />
            </TouchableOpacity>
            <View 
              style={styles.sudsDisplay}
              accessibilityRole="text"
              accessibilityLabel={`Current distress level: ${sessionData.initialSuds} out of 10`}
              accessible={true}
            >
              <Text style={styles.sudsNumber}>{sessionData.initialSuds}</Text>
              <Text style={styles.sudsText}>SUDS</Text>
            </View>
            <TouchableOpacity 
              style={styles.sudsButton}
              onPress={() => handleSudsChange(1)}
              accessibilityRole="button"
              accessibilityLabel="Increase distress level"
              accessibilityHint={`Current level is ${sessionData.initialSuds}. Tap to increase.`}
              accessible={true}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Negative Cognition */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Negative Belief *</Text>
          <Text style={styles.formHelp}>
            What negative belief about yourself goes with this memory? (e.g., "I am powerless", "I am not safe")
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="I am..."
            placeholderTextColor="#9ca3af"
            value={sessionData.negativeCognition}
            onChangeText={(text) => setSessionData(prev => ({ ...prev, negativeCognition: text }))}
          />
        </View>

        {/* Positive Cognition */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Positive Belief *</Text>
          <Text style={styles.formHelp}>
            What would you prefer to believe about yourself? (e.g., "I am in control", "I am safe now")
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="I am..."
            placeholderTextColor="#9ca3af"
            value={sessionData.positiveCognition}
            onChangeText={(text) => setSessionData(prev => ({ ...prev, positiveCognition: text }))}
          />
        </View>

        {/* BLS Preferences */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>BLS Preferences</Text>
          <Text style={styles.formHelp}>Current settings will be used</Text>
          <View style={styles.blsPreview}>
            <Text style={styles.blsPreviewText}>Speed: {settings?.speed.toFixed(1)} Hz</Text>
            <Text style={styles.blsPreviewText}>Shape: {settings?.shape}</Text>
            <Text style={styles.blsPreviewText}>Audio: {settings?.audio.enabled ? 'Enabled' : 'Disabled'}</Text>
          </View>
        </View>

        {/* Begin Button */}
        <TouchableOpacity 
          style={styles.beginButton}
          onPress={handleBeginProcessing}
        >
          <Ionicons name="play" size={24} color="white" />
          <Text style={styles.beginButtonText}>Begin Processing Phase</Text>
        </TouchableOpacity>

        {/* Safety Note */}
        <View style={styles.safetyCard}>
          <Ionicons name="information-circle" size={24} color="#f59e0b" />
          <View style={styles.safetyTextContainer}>
            <Text style={styles.safetyTitle}>Important Safety Note</Text>
            <Text style={styles.safetyText}>
              This tool is meant to supplement professional EMDR therapy. If you experience overwhelming emotions, please stop and consult with a qualified mental health professional.
            </Text>
          </View>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  instructionCard: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  instructionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formHelp: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  sudsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  sudsButton: {
    backgroundColor: '#374151',
    width: 56, // Increased for better accessibility
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sudsDisplay: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  sudsNumber: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  sudsText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  blsPreview: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  blsPreviewText: {
    color: '#e2e8f0',
    fontSize: 16,
  },
  beginButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  beginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  safetyCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    flexDirection: 'row',
    gap: 16,
  },
  safetyTextContainer: {
    flex: 1,
  },
  safetyTitle: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  safetyText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
});