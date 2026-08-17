import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { AppLayout } from './components/layout/AppLayout';
import { AnimatedSplashScreen } from './components/ui/AnimatedSplashScreen';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <AnimatedSplashScreen />
        <AppLayout />
      </ChatProvider>
    </AuthProvider>
  );
};
