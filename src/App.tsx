import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { AppLayout } from './components/layout/AppLayout';
import { FeedbackForm } from './components/feedback/FeedbackForm';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppLayout />
        <FeedbackForm />
      </ChatProvider>
    </AuthProvider>
  );
};
