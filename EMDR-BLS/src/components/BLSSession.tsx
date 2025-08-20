import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BilateralStimulation } from './BilateralStimulation';

interface BLSSessionProps {
  isActive: boolean;
  settings: any; // BLS settings object
  onSpeedChange?: (speed: number) => void;
  onCycleComplete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onEmergencyStop?: () => void;
  onSettingsChange?: () => void;
  
  // Control panel configuration
  showTimer?: boolean;
  showCycleCount?: boolean;
  showEmergencyStop?: boolean;
  showSettingsButton?: boolean;
  sessionTitle?: string;
  
  // Session data for timer/cycles
  sessionStartTime?: number;
  cycleCount?: number;
}

export function BLSSession({
  isActive,
  settings,
  onSpeedChange,
  onCycleComplete,
  onPause,
  onResume,
  onStop,
  onEmergencyStop,
  onSettingsChange,
  showTimer = false,
  showCycleCount = false,
  showEmergencyStop = false,
  showSettingsButton = false,
  sessionTitle = "BLS Session",
  sessionStartTime,
  cycleCount = 0,
}: BLSSessionProps) {
  const [currentSpeed, setCurrentSpeed] = useState(settings?.speed || 0.5);

  const handleSpeedChange = (newSpeed: number) => {
    setCurrentSpeed(newSpeed);
    if (onSpeedChange) {
      onSpeedChange(newSpeed);
    }
  };

  const getSessionTime = () => {
    if (!sessionStartTime) return "0:00";
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Full-screen bilateral stimulation */}
      <BilateralStimulation
        isActive={isActive}
        speed={settings?.speed || 0.5}
        shape={settings?.shape || 'circle'}
        size="large"
        backgroundColor={settings?.visual?.backgroundColor || '#000000'}
        shapeColor={settings?.visual?.shapeColor || '#ffffff'}
        autoSlow={settings?.autoSlow}
        autoSlowAmount={settings?.autoSlowAmount}
        duration={settings?.duration}
        audioSettings={settings?.audio}
        onCycleComplete={onCycleComplete}
        onSpeedChange={handleSpeedChange}
      />

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTimeText}>
            {showTimer ? getSessionTime() : sessionTitle}
          </Text>
          {showCycleCount && (
            <Text style={styles.cycleText}>{cycleCount} cycles</Text>
          )}
          <Text style={styles.speedText}>{currentSpeed.toFixed(1)} Hz</Text>
        </View>
        
        <View style={styles.controlButtons}>
          {/* Play/Pause Button */}
          {isActive ? (
            <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
              <Ionicons name="pause" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.playButton} onPress={onResume}>
              <Ionicons name="play" size={20} color="white" />
            </TouchableOpacity>
          )}
          
          {/* Settings Button */}
          {showSettingsButton && (
            <TouchableOpacity style={styles.settingsButton} onPress={onSettingsChange}>
              <Ionicons name="settings" size={20} color="white" />
            </TouchableOpacity>
          )}
          
          {/* Stop/Emergency Stop Button */}
          <TouchableOpacity 
            style={showEmergencyStop ? styles.emergencyButton : styles.stopButton} 
            onPress={() => {
              if (showEmergencyStop && onEmergencyStop) {
                onEmergencyStop();
              } else if (onStop) {
                onStop();
              }
            }}
          >
            <Ionicons name="stop" size={20} color="white" />
            {!showEmergencyStop && <Text style={styles.stopButtonText}>Stop</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
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
  speedText: {
    color: '#22c55e',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '600',
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
  settingsButton: {
    backgroundColor: '#374151',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});