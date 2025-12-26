import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        setShowSplash(false);
      }
    }, 2000);

    if (!isLoading && !showSplash) {
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [isLoading, showSplash]);

  const defaultScreenOptions = {
    headerShown: false,
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    fullScreenGestureEnabled: true,
    animation: 'slide_from_right',
    animationDuration: 300,
    contentStyle: {
      backgroundColor: '#F8FAFC',
    },
  };

  if (showSplash || isLoading) {
    return (
      <Stack.Navigator
        screenOptions={{
          ...defaultScreenOptions,
          animation: 'fade',
          animationDuration: 500,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      {isAuthenticated ? (
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            animation: 'fade_from_bottom',
            animationDuration: 400,
            gestureEnabled: false,
          }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animation: 'fade',
              animationDuration: 300,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{
              animation: 'slide_from_right',
              animationDuration: 350,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              fullScreenGestureEnabled: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

