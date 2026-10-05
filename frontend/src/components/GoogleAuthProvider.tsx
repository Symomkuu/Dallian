'use client';

import React, { type ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleAuthProviderProps {
  children: ReactNode;
}

export function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '420729352352-l3vvp4uqn5p82fhibdphagoe2bma9gj3.apps.googleusercontent.com';

  if (!clientId) {
    return <>{children}</>;
  }

  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}

export default GoogleAuthProvider;
