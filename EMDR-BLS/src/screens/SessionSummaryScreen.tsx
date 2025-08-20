import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSummary'>;

interface SessionRecord {
  sessionId: string;
  date: string;
  targetMemory: string;
  initialSuds: number;
  finalSuds: number;
  negativeCognition: string;
  positiveCognition: string;
  finalVoC: number;
  bodyScanComplete: boolean;
  sessionDuration: number;
  notes?: string;
  completed: boolean;
}

export function SessionSummaryScreen({ navigation, route }: Props) {
  const { sessionData } = route.params;
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const sessionRecord: SessionRecord = {
    sessionId: Date.now().toString(),
    date: new Date().toISOString(),
    targetMemory: sessionData.targetMemory,
    initialSuds: sessionData.initialSuds,
    finalSuds: sessionData.finalSuds,
    negativeCognition: sessionData.negativeCognition,
    positiveCognition: sessionData.positiveCognition,
    finalVoC: sessionData.finalVoC,
    bodyScanComplete: sessionData.bodyScanComplete,
    sessionDuration: sessionData.sessionDuration,
    notes: '',
    completed: true,
  };

  const saveSession = async () => {
    setSaving(true);
    try {
      // Get existing sessions
      const existingSessions = await AsyncStorage.getItem('emdr_sessions');
      const sessions: SessionRecord[] = existingSessions ? JSON.parse(existingSessions) : [];
      
      // Add new session with notes
      const sessionWithNotes = { ...sessionRecord, notes };
      sessions.push(sessionWithNotes);
      
      // Save back to storage
      await AsyncStorage.setItem('emdr_sessions', JSON.stringify(sessions));
      
      Alert.alert(
        'Session Saved',
        'Your EMDR session has been saved successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.warn('Failed to save session:', error);
      Alert.alert('Save Error', 'Could not save your session. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    await saveSession();
    navigation.navigate('MainMenu');
  };

  const handleNewSession = () => {
    navigation.navigate('SessionSetup');
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (initial: number, final: number): string => {
    const improvement = initial - final;
    if (improvement >= 3) return '#059669'; // Great improvement
    if (improvement >= 1) return '#f59e0b'; // Some improvement  
    return '#ef4444'; // Little/no improvement
  };

  const getProgressText = (initial: number, final: number): string => {
    const improvement = initial - final;
    if (improvement >= 3) return 'Excellent Progress';
    if (improvement >= 1) return 'Good Progress';
    if (improvement === 0) return 'No Change';
    return 'Needs More Processing';
  };

  const getVoCColor = (voc: number): string => {
    if (voc >= 6) return '#059669';
    if (voc >= 4) return '#f59e0b';
    return '#ef4444';
  };

  const getVoCText = (voc: number): string => {
    if (voc >= 6) return 'Strong Belief';
    if (voc >= 4) return 'Moderate Belief';
    return 'Weak Belief';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Session Complete!</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString()} • {formatDuration(sessionData.sessionDuration)}
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Success Message */}
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={48} color="#059669" />
          <Text style={styles.successTitle}>EMDR Session Completed</Text>
          <Text style={styles.successText}>
            You've successfully completed all phases of your EMDR session. Take a moment to reflect on your progress.
          </Text>
        </View>

        {/* Progress Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Session Progress</Text>
          
          {/* SUDS Progress */}
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Distress Level (SUDS)</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressValues}>
                <Text style={styles.initialValue}>Initial: {sessionData.initialSuds}</Text>
                <Text style={[styles.finalValue, { color: getProgressColor(sessionData.initialSuds, sessionData.finalSuds) }]}>
                  Final: {sessionData.finalSuds}
                </Text>
              </View>
              <View style={styles.progressIndicator}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.max(10, ((sessionData.initialSuds - sessionData.finalSuds) / sessionData.initialSuds) * 100)}%`,
                      backgroundColor: getProgressColor(sessionData.initialSuds, sessionData.finalSuds)
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: getProgressColor(sessionData.initialSuds, sessionData.finalSuds) }]}>
                {getProgressText(sessionData.initialSuds, sessionData.finalSuds)}
              </Text>
            </View>
          </View>

          {/* VoC Progress */}
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Positive Belief Strength (VoC)</Text>
            <View style={styles.vocContainer}>
              <Text style={styles.vocValue}>
                <Text style={[styles.vocNumber, { color: getVoCColor(sessionData.finalVoC) }]}>
                  {sessionData.finalVoC}
                </Text>
                <Text style={styles.vocScale}>/7</Text>
              </Text>
              <Text style={[styles.vocText, { color: getVoCColor(sessionData.finalVoC) }]}>
                {getVoCText(sessionData.finalVoC)}
              </Text>
            </View>
          </View>

          {/* Body Scan Status */}
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Body Scan</Text>
            <View style={styles.statusContainer}>
              <Ionicons 
                name={sessionData.bodyScanComplete ? "checkmark-circle" : "alert-circle"} 
                size={24} 
                color={sessionData.bodyScanComplete ? "#059669" : "#f59e0b"} 
              />
              <Text style={[styles.statusText, { color: sessionData.bodyScanComplete ? "#059669" : "#f59e0b" }]}>
                {sessionData.bodyScanComplete ? 'Complete - No residual tension' : 'Incomplete'}
              </Text>
            </View>
          </View>
        </View>

        {/* Session Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Session Details</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Target Memory</Text>
            <Text style={styles.detailValue}>{sessionData.targetMemory}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Negative Belief</Text>
            <Text style={styles.detailValue}>"{sessionData.negativeCognition}"</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Positive Belief</Text>
            <Text style={[styles.detailValue, { color: '#059669' }]}>"{sessionData.positiveCognition}"</Text>
          </View>
        </View>

        {/* Session Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.cardTitle}>Session Notes</Text>
          <Text style={styles.notesHelper}>
            Record any insights, thoughts, or observations from your session (optional)
          </Text>
          <TextInput
            style={styles.notesInput}
            placeholder="How are you feeling after this session? Any insights or observations..."
            placeholderTextColor="#9ca3af"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveAndExit}
            disabled={saving}
          >
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save & Return to Menu'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.newSessionButton}
            onPress={handleNewSession}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.newSessionButtonText}>Start New Session</Text>
          </TouchableOpacity>
        </View>

        {/* Therapeutic Reminder */}
        <View style={styles.reminderCard}>
          <Ionicons name="heart" size={24} color="#ef4444" />
          <View style={styles.reminderText}>
            <Text style={styles.reminderTitle}>Remember</Text>
            <Text style={styles.reminderContent}>
              Healing is a process. Be patient and gentle with yourself. If you continue to experience distress, consider working with a qualified EMDR therapist.
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
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  successCard: {
    backgroundColor: '#059669',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  successText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  summaryCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressItem: {
    marginBottom: 24,
  },
  progressLabel: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    gap: 8,
  },
  progressValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  initialValue: {
    color: '#94a3b8',
    fontSize: 14,
  },
  finalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressIndicator: {
    height: 8,
    backgroundColor: '#4b5563',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  vocContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vocValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  vocNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  vocScale: {
    color: '#94a3b8',
    fontSize: 16,
  },
  vocText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 6,
  },
  detailValue: {
    color: '#e2e8f0',
    fontSize: 16,
    lineHeight: 24,
  },
  notesCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  notesHelper: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  notesInput: {
    backgroundColor: '#4b5563',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  newSessionButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
  },
  newSessionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reminderCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    flexDirection: 'row',
    gap: 16,
  },
  reminderText: {
    flex: 1,
  },
  reminderTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reminderContent: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
});