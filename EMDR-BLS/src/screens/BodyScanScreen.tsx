import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { BilateralStimulation } from '../components/BilateralStimulation';
import { useBLSSettings } from '../hooks/useSettings';

type Props = NativeStackScreenProps<RootStackParamList, 'BodyScan'>;

interface BodyScanState {
  phase: 'instructions' | 'scanning' | 'active_processing' | 'completed';
  sessionStartTime: number;
  cycleCount: number;
  sensationAreas: string[];
  scanComplete: boolean;
}

export function BodyScanScreen({ navigation, route }: Props) {
  const { sessionData } = route.params;
  const { settings } = useBLSSettings();
  const overlayOpacity = useRef(new Animated.Value(1)).current; // Start visible for instructions
  
  const [bodyScanState, setBodyScanState] = useState<BodyScanState>({
    phase: 'instructions',
    sessionStartTime: Date.now(),
    cycleCount: 0,
    sensationAreas: [],
    scanComplete: false,
  });

  const [showInstructions, setShowInstructions] = useState(true);

  const bodyAreas = [
    'Head & Face', 'Neck & Throat', 'Shoulders', 'Arms & Hands', 
    'Chest & Heart', 'Upper Back', 'Stomach & Abdomen', 'Lower Back',
    'Hips & Pelvis', 'Thighs', 'Knees', 'Calves & Shins', 'Feet & Ankles'
  ];

  const handleBeginScan = () => {
    setBodyScanState(prev => ({ ...prev, phase: 'scanning' }));
    setShowInstructions(false);
    animateOverlayOut();
  };

  const handleFoundSensation = (area: string) => {
    setBodyScanState(prev => ({
      ...prev,
      sensationAreas: [...prev.sensationAreas, area],
      phase: 'active_processing'
    }));
    
    Alert.alert(
      'Sensation Found',
      `You've identified tension or discomfort in: ${area}\n\nLet's process this with bilateral stimulation until it clears.`,
      [{ text: 'Begin Processing', onPress: () => {} }]
    );
  };

  const handleNoSensations = () => {
    setBodyScanState(prev => ({ 
      ...prev, 
      phase: 'completed',
      scanComplete: true 
    }));
    
    setTimeout(() => {
      handleCompleteSession();
    }, 1000);
  };

  const handleSensationCleared = () => {
    Alert.alert(
      'Sensation Check',
      'Has the tension or discomfort in this area cleared or reduced significantly?',
      [
        { 
          text: 'Still Present', 
          style: 'cancel',
          onPress: () => {
            // Continue processing
          }
        },
        { 
          text: 'Cleared', 
          onPress: () => {
            setBodyScanState(prev => ({ 
              ...prev, 
              phase: 'completed',
              scanComplete: true 
            }));
            handleCompleteSession();
          }
        }
      ]
    );
  };

  const handleCompleteSession = () => {
    const sessionDuration = Math.floor((Date.now() - bodyScanState.sessionStartTime) / 1000);
    
    navigation.navigate('SessionSummary', {
      sessionData: {
        ...sessionData,
        bodyScanComplete: true,
        sessionDuration
      }
    });
  };

  const animateOverlayOut = () => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCycleComplete = () => {
    setBodyScanState(prev => ({ 
      ...prev, 
      cycleCount: prev.cycleCount + 1 
    }));
  };

  const getSessionTime = () => {
    const elapsed = Math.floor((Date.now() - bodyScanState.sessionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isActive = bodyScanState.phase === 'active_processing';
  
  // Very slow, gentle stimulation for body scan
  const bodyScanSettings = {
    ...settings,
    speed: 0.3, // Very slow for body awareness
  };

  return (
    <View style={styles.container}>
      {/* Body Scan Header */}
      <View style={styles.phaseHeader}>
        <Text style={styles.phaseTitle}>Body Scan</Text>
        <Text style={styles.phaseSubtitle}>Notice any remaining tension or sensations</Text>
      </View>

      {/* Bilateral stimulation - only active during processing */}
      {isActive && (
        <BilateralStimulation
          isActive={true}
          speed={bodyScanSettings?.speed || 0.3}
          shape={bodyScanSettings?.shape || 'circle'}
          size="large"
          backgroundColor={bodyScanSettings?.visual?.backgroundColor || '#000000'}
          shapeColor={bodyScanSettings?.visual?.shapeColor || '#ffffff'}
          audioSettings={bodyScanSettings?.audio}
          onCycleComplete={handleCycleComplete}
        />
      )}

      {/* Body Scan Interface - when not processing */}
      {!isActive && (
        <View style={styles.bodyScanContent}>
          <ScrollView style={styles.bodyAreasList} showsVerticalScrollIndicator={false}>
            <Text style={styles.scanInstructionText}>
              Slowly scan through your body from head to toe. Notice any areas of tension, discomfort, or unusual sensations.
            </Text>
            
            {bodyAreas.map((area, index) => (
              <TouchableOpacity
                key={area}
                style={[
                  styles.bodyAreaButton,
                  bodyScanState.sensationAreas.includes(area) && styles.bodyAreaSelected
                ]}
                onPress={() => handleFoundSensation(area)}
              >
                <Ionicons 
                  name={bodyScanState.sensationAreas.includes(area) ? "checkmark-circle" : "radio-button-off"} 
                  size={24} 
                  color={bodyScanState.sensationAreas.includes(area) ? "#059669" : "#94a3b8"} 
                />
                <Text style={[
                  styles.bodyAreaText,
                  bodyScanState.sensationAreas.includes(area) && styles.bodyAreaTextSelected
                ]}>
                  {area}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.noSensationsButton}
              onPress={handleNoSensations}
            >
              <Ionicons name="checkmark-done" size={24} color="#2563eb" />
              <Text style={styles.noSensationsText}>No sensations - Body feels clear</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Control Panel - only during active processing */}
      {isActive && (
        <View style={styles.controlPanel}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTimeText}>{getSessionTime()}</Text>
            <Text style={styles.cycleText}>{bodyScanState.cycleCount} cycles</Text>
            <Text style={styles.areaText}>
              Processing: {bodyScanState.sensationAreas[bodyScanState.sensationAreas.length - 1]}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.clearedButton} 
            onPress={handleSensationCleared}
          >
            <Ionicons name="checkmark" size={20} color="white" />
            <Text style={styles.clearedButtonText}>Sensation Cleared</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Instructions Overlay */}
      {showInstructions && (
        <Animated.View 
          style={[styles.overlay, { opacity: overlayOpacity }]}
          pointerEvents={showInstructions ? 'auto' : 'none'}
        >
          <View style={styles.overlayContent}>
            <Text style={styles.overlayTitle}>Body Scan Instructions</Text>
            
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Ionicons name="body" size={24} color="#2563eb" />
                <Text style={styles.instructionText}>
                  Slowly scan through your body from head to toe
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Ionicons name="search" size={24} color="#2563eb" />
                <Text style={styles.instructionText}>
                  Notice any areas of tension, tightness, or discomfort
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Ionicons name="hand-left" size={24} color="#2563eb" />
                <Text style={styles.instructionText}>
                  Tap any area where you feel sensations
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                <Text style={styles.instructionText}>
                  If you find no sensations, select "Body feels clear"
                </Text>
              </View>
            </View>

            <Text style={styles.reminderText}>
              This is the final phase. Take your time and listen to your body.
            </Text>
            
            <TouchableOpacity 
              style={styles.beginScanButton}
              onPress={handleBeginScan}
            >
              <Text style={styles.beginScanButtonText}>Begin Body Scan</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  phaseHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    paddingHorizontal: 20,
  },
  phaseTitle: {
    color: '#2563eb',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phaseSubtitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  bodyScanContent: {
    flex: 1,
    paddingTop: 120,
    paddingHorizontal: 24,
  },
  bodyAreasList: {
    flex: 1,
  },
  scanInstructionText: {
    color: '#e2e8f0',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  bodyAreaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
  },
  bodyAreaSelected: {
    backgroundColor: '#0f2419',
    borderWidth: 1,
    borderColor: '#059669',
  },
  bodyAreaText: {
    color: '#e2e8f0',
    fontSize: 16,
    flex: 1,
  },
  bodyAreaTextSelected: {
    color: '#059669',
    fontWeight: '600',
  },
  noSensationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    gap: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  noSensationsText: {
    color: '#2563eb',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    alignItems: 'flex-start',
    flex: 1,
  },
  sessionTimeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cycleText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 2,
  },
  areaText: {
    color: '#2563eb',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  clearedButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  clearedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  overlayContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
  },
  overlayTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  instructionsList: {
    width: '100%',
    marginBottom: 24,
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  instructionText: {
    color: '#e2e8f0',
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  reminderText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  beginScanButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  beginScanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});