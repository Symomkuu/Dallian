'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { StoreProvider } from '../contexts/StoreContext';
import { GoogleAuthProvider } from './GoogleAuthProvider';
import { ToastStack } from './ui/ToastStack';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <GoogleAuthProvider>
      <StoreProvider>
        {children}
        <ToastStack />
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
          className="z-[99999]"
          style={{ zIndex: 99999 }}
          toastOptions={{
            style: {
              borderRadius: '16px',
              fontFamily: 'Inter, system-ui, sans-serif',
              zIndex: 99999,
            },
          }}
        />
      </StoreProvider>
    </GoogleAuthProvider>
  );
}