import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BLSSession } from '../components/BLSSession';
import { BLSConfigScreen } from './BLSConfigScreen';
import { useBLSSettings } from '../hooks/useSettings';
import * as ScreenOrientation from 'expo-screen-orientation';

type Props = NativeStackScreenProps<RootStackParamList, 'BLSSession'>;

export function BLSSessionScreen({ navigation, route }: Props) {
  const { mode, sessionData } = route.params;
  const { settings } = useBLSSettings();
  
  // Unified state for both modes - BLS Tool starts paused, Guided sessions start active
  const [isActive, setIsActive] = useState(mode === 'guided-session'); // BLS Tool starts paused, guided starts active
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(mode === 'guided-session' ? Date.now() : null);
  const [cycleCount, setCycleCount] = useState(0);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Enable auto-rotation when component mounts (mobile only)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const enableAutoRotate = async () => {
      try {
        await ScreenOrientation.unlockAsync();
      } catch (error) {
        if (Platform.OS !== 'web') {
          console.warn('Screen orientation not supported on this device');
        }
      }
    };

    enableAutoRotate();

    return () => {
      if (Platform.OS !== 'web') {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      }
    };
  }, []);

  if (!settings) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        {/* Loading state */}
      </View>
    );
  }

  const handleCycleComplete = () => {
    setCycleCount(prev => prev + 1);
  };

  const handleStop = () => {
    const confirmMessage = mode === 'bls-tool' 
      ? 'Are you sure you want to stop the bilateral stimulation session?'
      : 'Are you sure you want to stop the processing session?';
    
    const stopTitle = mode === 'bls-tool' ? 'Stop Session' : 'Stop Session';
    
    // Use web-compatible confirmation
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${stopTitle}\n\n${confirmMessage}`);
      if (confirmed) {
        // EXACT same stop logic for both modes
        setIsActive(false);
        setSessionStartTime(null);
        setCycleCount(0);
        
        // Different navigation based on mode
        if (mode === 'bls-tool') {
          navigation.goBack(); // Go back to main menu
        } else {
          navigation.navigate('MainMenu'); // Go to main menu for guided sessions
        }
      }
    } else {
      Alert.alert(
        stopTitle,
        confirmMessage,
        [
          { text: 'Continue Session', style: 'cancel' },
          { 
            text: 'Stop Session', 
            style: 'destructive',
            onPress: () => {
              // EXACT same stop logic for both modes
              setIsActive(false);
              setSessionStartTime(null);
              setCycleCount(0);
              
              // Different navigation based on mode
              if (mode === 'bls-tool') {
                navigation.goBack(); // Go back to main menu
              } else {
                navigation.navigate('MainMenu'); // Go to main menu for guided sessions
              }
            }
          },
        ]
      );
    }
  };

  const handleSettingsPress = () => {
    setShowConfigModal(true);
  };

  return (
    <View style={styles.container}>
      <BLSSession
        isActive={isActive}
        settings={settings}
        onCycleComplete={handleCycleComplete}
        onPause={() => setIsActive(false)}
        onResume={() => {
          setIsActive(true);
          // Start timer when session begins for BLS Tool
          if (mode === 'bls-tool' && !sessionStartTime) {
            setSessionStartTime(Date.now());
          }
        }}
        onStop={handleStop}
        onSettingsChange={handleSettingsPress}
        showTimer={true}
        showCycleCount={true}
        showSettingsButton={true}
        showEmergencyStop={false}
        sessionStartTime={sessionStartTime}
        cycleCount={cycleCount}
      />
      
      {/* BLS Configuration Modal */}
      <BLSConfigScreen
        visible={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});