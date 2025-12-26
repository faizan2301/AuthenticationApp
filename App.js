import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;