'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

interface GoogleLoginBlockProps {
  onSuccess: (response: CredentialResponse) => void;
  onError: () => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'pill' | 'rectangular' | 'circle' | 'square';
  theme?: 'filled_black' | 'outline' | 'filled_blue';
}

export const GoogleLoginBlock = memo(function GoogleLoginBlock({
  onSuccess,
  onError,
  text = 'signin_with',
  shape = 'pill',
  theme = 'outline',
}: GoogleLoginBlockProps) {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '420729352352-l3vvp4uqn5p82fhibdphagoe2bma9gj3.apps.googleusercontent.com';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [buttonWidth, setButtonWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.min(380, Math.max(200, window.innerWidth - 64));
    }
    return 280;
  });

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const measuredWidth = containerRef.current.clientWidth;
        if (measuredWidth > 0) {
          const nextWidth = Math.max(200, Math.min(380, measuredWidth - 4));
          setButtonWidth((prev) => (Math.abs(prev - nextWidth) > 5 ? Math.floor(nextWidth) : prev));
        }
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  return (
    <div className="flex w-full max-w-full items-center justify-center overflow-hidden">
      <div ref={containerRef} className="w-full max-w-full flex justify-center overflow-hidden">
        {clientId ? (
          <div className="rounded-full border border-[#D99B26] p-[1px] hover:border-[#c88d1f] transition-all shadow-2xs inline-flex justify-center max-w-full overflow-hidden">
            <GoogleLogin
              key={`${buttonWidth}-${shape}-${theme}`}
              onSuccess={onSuccess}
              onError={onError}
              useOneTap={false}
              width={String(buttonWidth)}
              text={text}
              shape={shape}
              theme={theme}
              logo_alignment="left"
              size="large"
            />
          </div>
        ) : (
          <button
            type="button"
            className="w-full max-w-full rounded-full border border-[#D99B26] bg-[#D99B26] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black cursor-not-allowed text-center"
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
