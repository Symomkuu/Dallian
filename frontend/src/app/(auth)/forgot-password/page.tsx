'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { imagery } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/utils/api';
import { ArrowLeftIcon, KeyRoundIcon } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword, pushToast } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      next.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = 'Please enter a valid email address.';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await forgotPassword(trimmedEmail);
      pushToast({
        title: 'Verification code sent.',
        body: 'Check your email inbox for your 6-digit reset code.',
        tone: 'info',
      });
      router.push(`/reset-password?email=${encodeURIComponent(trimmedEmail)}`);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
      setErrors({ email: message });
      pushToast({ title: 'Could not send reset code.', body: message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:min-h-[80vh] lg:grid-cols-2">
      {/* Left visual column */}
      <div className="relative hidden lg:block">
        <img
          src={imagery.categoryHumanHair}
          alt="Dallian Luxe Hair"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-cream">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold backdrop-blur-xs mb-4">
            <KeyRoundIcon width={24} height={24} />
          </div>
          <p className="label-luxe text-gold">Account Security</p>
          <h2 className="mt-2 max-w-md font-serif text-3xl leading-snug text-cream">
            Restore access to your bespoke luxury hair collection
          </h2>
          <p className="mt-3 max-w-sm text-sm text-cream/70">
            We will send a secure verification code to your registered email to help you reset your password.
          </p>
        </div>
      </div>

      {/* Right form column */}
      <div className="flex items-center justify-center px-5 py-14 sm:px-8">
        <div className="w-full max-w-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-ink/60 hover:text-chestnut transition-colors mb-6"
          >
            <ArrowLeftIcon width={14} height={14} />
            Back to Sign In
          </Link>

          <h1 className="font-serif text-3xl text-ink">Forgot Password?</h1>
          <p className="mt-2 text-sm text-ink/60">
            Enter the email address associated with your account, and we&apos;ll email you a verification code to reset your password.
          </p>

          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
            <TextField
              label="Email Address"
              type="email"
              value={email}
              error={errors.email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="e.g. yourname@example.com"
            />

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Sending Code…' : 'Send Verification Code'}
            </Button>
          </form>

          <div className="mt-8 space-y-2 border-t border-ink/10 pt-6">
            <p className="text-sm text-ink/60">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-chestnut underline underline-offset-4 hover:opacity-80 transition-opacity font-medium"
              >
                Sign in
              </Link>
            </p>
            <p className="text-sm text-ink/60">
              New to Dallian?{' '}
              <Link
                href="/register"
                className="text-chestnut underline underline-offset-4 hover:opacity-80 transition-opacity font-medium"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
