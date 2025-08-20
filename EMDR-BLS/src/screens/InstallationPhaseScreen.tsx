import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { BilateralStimulation } from '../components/BilateralStimulation';
import { useBLSSettings } from '../hooks/useSettings';

type Props = NativeStackScreenProps<RootStackParamList, 'InstallationPhase'>;

interface InstallationState {
  phase: 'active' | 'paused' | 'voc_check';
  sessionStartTime: number;
  currentVoC: number; // Validity of Cognition 1-7
  cycleCount: number;
  lastCheckTime: number;
}

export function InstallationPhaseScreen({ navigation, route }: Props) {
  const { sessionData } = route.params;
  const { settings } = useBLSSettings();
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  const [installationState, setInstallationState] = useState<InstallationState>({
    phase: 'active',
    sessionStartTime: Date.now(),
    currentVoC: 4, // Start at middle range
    cycleCount: 0,
    lastCheckTime: Date.now(),
  });

  const [showOverlay, setShowOverlay] = useState(false);

  // Auto VoC check every 90 seconds
  useEffect(() => {
    if (installationState.phase !== 'active') return;

    const vocTimer = setInterval(() => {
      const timeSinceLastCheck = Date.now() - installationState.lastCheckTime;
      if (timeSinceLastCheck >= 90000) { // 90 seconds
        showVoCCheck();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(vocTimer);
  }, [installationState.phase, installationState.lastCheckTime]);

  const showVoCCheck = () => {
    setInstallationState(prev => ({ ...prev, phase: 'voc_check' }));
    setShowOverlay(true);
    animateOverlayIn();
  };

  const animateOverlayIn = () => {
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animateOverlayOut = () => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowOverlay(false);
      setInstallationState(prev => ({ 
        ...prev, 
        phase: 'active',
        lastCheckTime: Date.now()
      }));
    });
  };

  const handleCycleComplete = () => {
    setInstallationState(prev => ({ 
      ...prev, 
      cycleCount: prev.cycleCount + 1 
    }));
  };

  const handleVoCChange = (newVoC: number) => {
    setInstallationState(prev => ({
      ...prev,
      currentVoC: Math.max(1, Math.min(7, newVoC))
    }));
  };

  const handleContinueInstallation = () => {
    animateOverlayOut();
  };

  const handlePause = () => {
    setInstallationState(prev => ({ ...prev, phase: 'paused' }));
  };

  const handleResume = () => {
    setInstallationState(prev => ({ ...prev, phase: 'active' }));
  };

  const handleBodyScanPhase = () => {
    Alert.alert(
      'Installation Complete?',
      `VoC Rating: ${installationState.currentVoC}/7\n\nThe positive belief "${sessionData.positiveCognition}" should feel authentic and true when you think of the original memory.`,
      [
        { text: 'Continue Installation', style: 'cancel' },
        { 
          text: 'Begin Body Scan', 
          onPress: () => {
            navigation.navigate('BodyScan', { 
              sessionData: {
                ...sessionData,
                finalVoC: installationState.currentVoC
              }
            });
          }
        }
      ]
    );
  };

  const handleManualVoCCheck = () => {
    showVoCCheck();
  };

  const getSessionTime = () => {
    const elapsed = Math.floor((Date.now() - installationState.sessionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVoCDescription = (voc: number): string => {
    switch (voc) {
      case 1: return 'Completely False';
      case 2: return 'Mostly False';
      case 3: return 'Somewhat False';
      case 4: return 'Neutral';
      case 5: return 'Somewhat True';
      case 6: return 'Mostly True';
      case 7: return 'Completely True';
      default: return 'Unknown';
    }
  };

  const getVoCColor = (voc: number): string => {
    if (voc >= 6) return '#059669'; // Green for good VoC
    if (voc >= 4) return '#f59e0b'; // Yellow for moderate VoC
    return '#ef4444'; // Red for low VoC
  };

  const isActive = installationState.phase === 'active';
  
  // Use slightly different settings for installation phase
  const installationSettings = {
    ...settings,
    speed: settings ? Math.max(0.3, settings.speed * 0.8) : 0.4, // Slightly slower for installation
  };

  return (
    <View style={styles.container}>
      {/* Installation Header */}
      <View style={styles.phaseHeader}>
        <Text style={styles.phaseTitle}>Installation Phase</Text>
        <Text style={styles.phaseSubtitle}>Installing: "{sessionData.positiveCognition}"</Text>
      </View>

      {/* Full-screen bilateral stimulation */}
      <BilateralStimulation
        isActive={isActive}
        speed={installationSettings?.speed || 0.4}
        shape={installationSettings?.shape || 'circle'}
        size="large"
        backgroundColor={installationSettings?.visual?.backgroundColor || '#000000'}
        shapeColor={installationSettings?.visual?.shapeColor || '#ffffff'}
        autoSlow={installationSettings?.autoSlow}
        autoSlowAmount={installationSettings?.autoSlowAmount}
        duration={installationSettings?.duration}
        audioSettings={installationSettings?.audio}
        onCycleComplete={handleCycleComplete}
      />

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTimeText}>{getSessionTime()}</Text>
          <Text style={styles.cycleText}>{installationState.cycleCount} cycles</Text>
        </View>
        
        <View style={styles.controlButtons}>
          {isActive ? (
            <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
              <Ionicons name="pause" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.playButton} onPress={handleResume}>
              <Ionicons name="play" size={20} color="white" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.vocButton, { backgroundColor: getVoCColor(installationState.currentVoC) }]} 
            onPress={handleManualVoCCheck}
          >
            <Text style={styles.vocButtonText}>VoC: {installationState.currentVoC}</Text>
          </TouchableOpacity>
          
          {installationState.currentVoC >= 6 && (
            <TouchableOpacity style={styles.bodyScanButton} onPress={handleBodyScanPhase}>
              <Ionicons name="body" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* VoC Check Overlay */}
      {showOverlay && (
        <Animated.View 
          style={[styles.overlay, { opacity: overlayOpacity }]}
          pointerEvents={showOverlay ? 'auto' : 'none'}
        >
          <View style={styles.overlayContent}>
            <Text style={styles.overlayTitle}>Validity of Cognition</Text>
            <Text style={styles.overlayText}>
              When you bring up the original memory and the positive belief together:
            </Text>
            <Text style={styles.positiveBeliefText}>
              "{sessionData.positiveCognition}"
            </Text>
            <Text style={styles.overlayText}>
              How true does this feel to you right now?
            </Text>
            
            <View style={styles.vocContainer}>
              <View style={styles.vocScale}>
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.vocOption,
                      installationState.currentVoC === value && styles.vocSelected,
                      { backgroundColor: installationState.currentVoC === value ? getVoCColor(value) : '#374151' }
                    ]}
                    onPress={() => handleVoCChange(value)}
                  >
                    <Text style={styles.vocNumber}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.vocDescription}>
                {getVoCDescription(installationState.currentVoC)}
              </Text>
              
              <View style={styles.vocLabels}>
                <Text style={styles.vocLabel}>Completely False</Text>
                <Text style={styles.vocLabel}>Completely True</Text>
              </View>
            </View>

            <View style={styles.vocActions}>
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleContinueInstallation}
              >
                <Text style={styles.continueButtonText}>Continue Installation</Text>
              </TouchableOpacity>
              
              {installationState.currentVoC >= 6 && (
                <TouchableOpacity 
                  style={styles.bodyScanFullButton}
                  onPress={() => navigation.navigate('BodyScan', { 
                    sessionData: {
                      ...sessionData,
                      finalVoC: installationState.currentVoC
                    }
                  })}
                >
                  <Text style={styles.bodyScanButtonText}>Ready for Body Scan</Text>
                </TouchableOpacity>
              )}
            </View>
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
    color: '#059669',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phaseSubtitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
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
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    backgroundColor: '#059669',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vocButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  vocButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bodyScanButton: {
    backgroundColor: '#2563eb',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  overlayText: {
    color: '#e2e8f0',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  positiveBeliefText: {
    color: '#059669',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    paddingHorizontal: 16,
  },
  vocContainer: {
    width: '100%',
    marginBottom: 32,
  },
  vocScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 4,
  },
  vocOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vocSelected: {
    transform: [{ scale: 1.1 }],
  },
  vocNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  vocDescription: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  vocLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vocLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  vocActions: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bodyScanFullButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  bodyScanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});