'use client';

import React from 'react';
import { StoreProvider } from '../contexts/StoreContext';
import { GoogleAuthProvider } from './GoogleAuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <GoogleAuthProvider>
      <StoreProvider>
        {children}
      </StoreProvider>
    </GoogleAuthProvider>
  );
}