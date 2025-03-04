import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {

  return (
    <AuthProvider>
      <Stack initialRouteName="index">
        <Stack.Screen
          name="index"
          options={{
            headerShown: false, // Hides the title bar
          }}
        />
        <Stack.Screen
          name="manager"
          options={{
            headerShown: false, // Hides the title bar
          }}
        />
      </Stack>
    </AuthProvider>
  );
}