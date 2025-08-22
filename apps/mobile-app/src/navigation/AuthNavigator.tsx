import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { WelcomeScreen } from '../features/auth/screens/WelcomeScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const handlePhoneLogin = () => {
    // Navigate to phone login screen when implemented
    console.log('Phone login pressed');
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Welcome">
        {() => <WelcomeScreen onPhoneLogin={handlePhoneLogin} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

