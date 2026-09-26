'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { imagery } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/utils/api';
import { ArrowLeftIcon, CheckCircleIcon, KeyRoundIcon, ShieldCheckIcon } from 'lucide-react';

function ResetPasswordForm() {
  const { resetPassword, forgotPassword, pushToast } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams?.get('email');
    if (fromQuery) {
      setEmail(fromQuery.trim());
    }
  }, [searchParams]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (!trimmedEmail) {
      next.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = 'Please enter a valid email address.';
    }

    if (!trimmedCode) {
      next.code = 'Please enter the verification code sent to your email.';
    } else if (trimmedCode.length < 4) {
      next.code = 'Verification code must be at least 4 digits.';
    }

    if (!newPassword) {
      next.newPassword = 'Please enter a new password.';
    } else if (newPassword.length < 6) {
      next.newPassword = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      next.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      // Explicit frontend password confirmation validation
      next.confirmPassword = 'Passwords do not match. Please verify and try again.';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const me = await resetPassword(trimmedEmail, trimmedCode, newPassword);
      pushToast({
        title: 'Password reset successfully.',
        body: 'Welcome back to Dallian Luxe Hair.',
        tone: 'success',
      });
      // Redirect to dashboard based on role
      const targetDashboard = me?.role === 'staff' ? '/admin/dashboard' : '/customer/dashboard';
      router.push(targetDashboard);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Something went wrong. Please check your code and try again.';
      
      if (message.toLowerCase().includes('code')) {
        setErrors({ code: message });
      } else if (message.toLowerCase().includes('password')) {
        setErrors({ newPassword: message });
      } else {
        setErrors({ code: message });
      }

      pushToast({ title: 'Could not reset password.', body: message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrors({ email: 'Enter a valid email to resend the code.' });
      return;
    }
    setResending(true);
    try {
      await forgotPassword(trimmedEmail);
      pushToast({
        title: 'New code sent.',
        body: 'Please check your email inbox for the new reset code.',
        tone: 'info',
      });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to resend code. Please try again.';
      pushToast({ title: 'Could not resend code.', body: message, tone: 'error' });
    } finally {
      setResending(false);
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
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-cream">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold backdrop-blur-xs mb-4">
            <ShieldCheckIcon width={24} height={24} />
          </div>
          <p className="label-luxe text-gold">Secure Account Recovery</p>
          <h2 className="mt-2 max-w-md font-serif text-3xl leading-snug text-cream">
            Set your new password and regain full account access
          </h2>
          <div className="mt-6 space-y-2 text-xs text-cream/70">
            <div className="flex items-center gap-2">
              <CheckCircleIcon width={14} height={14} className="text-gold" />
              <span>Instant verification via secure one-time code</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon width={14} height={14} className="text-gold" />
              <span>Direct access to orders, bag and wishlist after reset</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form column */}
      <div className="flex items-center justify-center px-5 py-14 sm:px-8">
        <div className="w-full max-w-sm">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 text-xs text-ink/60 hover:text-chestnut transition-colors mb-6"
          >
            <ArrowLeftIcon width={14} height={14} />
            Change Email
          </Link>

          <h1 className="font-serif text-3xl text-ink">Reset Password</h1>
          <p className="mt-2 text-sm text-ink/60">
            Enter the verification code sent to your email and your new password below.
          </p>

          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            <TextField
              label="Email Address"
              type="email"
              value={email}
              error={errors.email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="yourname@example.com"
            />

            <div>
              <TextField
                label="Verification Code"
                value={code}
                error={errors.code}
                onChange={(event) => setCode(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="e.g. 123456"
              />
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-xs text-chestnut underline hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {resending ? 'Sending code…' : "Didn't receive a code? Resend"}
                </button>
              </div>
            </div>

            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              error={errors.newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />

            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              error={errors.confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
            />

            <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? 'Updating Password…' : 'Reset Password & Continue'}
            </Button>
          </form>

          <div className="mt-8 border-t border-ink/10 pt-6 text-center">
            <p className="text-sm text-ink/60">
              Remembered your credentials?{' '}
              <Link
                href="/login"
                className="text-chestnut underline underline-offset-4 hover:opacity-80 transition-opacity font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-ink/40">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
