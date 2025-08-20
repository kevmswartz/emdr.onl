import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { BLSSessionScreen } from '../screens/BLSSessionScreen';
import { GlobalSettingsScreen } from '../screens/GlobalSettingsScreen';
import { SessionSetupScreen } from '../screens/SessionSetupScreen';
import { InstallationPhaseScreen } from '../screens/InstallationPhaseScreen';
import { BodyScanScreen } from '../screens/BodyScanScreen';
import { SessionSummaryScreen } from '../screens/SessionSummaryScreen';

export type RootStackParamList = {
  MainMenu: undefined;
  BLSSession: {
    mode: 'bls-tool' | 'guided';
    sessionData?: {
      targetMemory: string;
      initialSuds: number;
      negativeCognition: string;
      positiveCognition: string;
    };
  };
  GlobalSettings: undefined;
  SessionSetup: undefined;
  InstallationPhase: {
    sessionData: {
      targetMemory: string;
      initialSuds: number;
      negativeCognition: string;
      positiveCognition: string;
      finalSuds: number;
    };
  };
  BodyScan: {
    sessionData: {
      targetMemory: string;
      initialSuds: number;
      negativeCognition: string;
      positiveCognition: string;
      finalSuds: number;
      finalVoC: number;
    };
  };
  SessionSummary: {
    sessionData: {
      targetMemory: string;
      initialSuds: number;
      negativeCognition: string;
      positiveCognition: string;
      finalSuds: number;
      finalVoC: number;
      bodyScanComplete: boolean;
      sessionDuration: number;
    };
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="MainMenu"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="BLSSession" component={BLSSessionScreen} />
        <Stack.Screen name="GlobalSettings" component={GlobalSettingsScreen} />
        <Stack.Screen name="SessionSetup" component={SessionSetupScreen} />
        <Stack.Screen name="InstallationPhase" component={InstallationPhaseScreen} />
        <Stack.Screen name="BodyScan" component={BodyScanScreen} />
        <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}