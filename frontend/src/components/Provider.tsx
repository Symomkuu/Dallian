'use client';

import React from 'react';
import { StoreProvider } from '../contexts/StoreContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  );
}