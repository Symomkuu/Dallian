'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

interface GoogleLoginBlockProps {
  onSuccess: (response: CredentialResponse) => void;
  onError: () => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

export const GoogleLoginBlock = memo(function GoogleLoginBlock({
  onSuccess,
  onError,
  text = 'signin_with',
}: GoogleLoginBlockProps) {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '55361185279-o8oukqff92vq926b76orgm936n5tb7o5.apps.googleusercontent.com';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [buttonWidth, setButtonWidth] = useState(320);

  useEffect(() => {
    const updateWidth = () => {
      const measuredWidth = containerRef.current?.clientWidth ?? 320;
      const nextWidth = Math.max(220, Math.min(380, measuredWidth));
      setButtonWidth(Math.floor(nextWidth));
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="flex w-full items-center justify-center">
      <div ref={containerRef} className="w-full flex justify-center">
        {clientId ? (
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            useOneTap={false}
            width={String(buttonWidth)}
            text={text}
            shape="rectangular"
            theme="outline"
            logo_alignment="left"
            size="large"
          />
        ) : (
          <button
            type="button"
            className="w-full border border-ink/20 bg-stone-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400 cursor-not-allowed"
            disabled
            title="Google sign-in is unavailable"
          >
            Google sign-in unavailable
          </button>
        )}
      </div>
    </div>
  );
});

export default GoogleLoginBlock;
