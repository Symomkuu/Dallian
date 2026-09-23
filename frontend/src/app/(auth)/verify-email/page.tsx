'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { imagery } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/utils/api';

export default function VerifyEmailPage() {
  const { verifyEmail, resendCode, pushToast } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams?.get('email');
    if (fromQuery) setEmail(fromQuery);
  }, [searchParams]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter the email you signed up with.';
    if (!/^\d{4,8}$/.test(code.trim())) next.code = 'Enter the code we emailed you.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await verifyEmail(email, code.trim());
      pushToast({ title: 'Email verified.', body: 'Welcome to Dallian Luxe Hair.', tone: 'success' });
      router.push('/customer/dashboard');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
      setErrors({ code: message });
      pushToast({ title: 'Could not verify email.', body: message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Enter the email you signed up with.' });
      return;
    }
    setResending(true);
    try {
      await resendCode(email);
      pushToast({ title: 'Code sent.', body: 'Check your inbox for a new code.', tone: 'info' });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
      pushToast({ title: 'Could not resend code.', body: message, tone: 'error' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="grid lg:min-h-[80vh] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={imagery.categoryHumanHair} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <p className="label-luxe text-gold">Almost there</p>
          <h2 className="mt-4 max-w-sm font-serif text-4xl leading-tight text-cream">
            Verify your email to finish creating your account
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-14 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-ink">Verify Your Email</h1>
          <p className="mt-2 text-sm text-ink/60">
            We emailed a verification code to your address. Enter it below to activate your account.
          </p>
          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
            <TextField
              label="Email"
              type="email"
              value={email}
              error={errors.email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />

            <TextField
              label="Verification Code"
              value={code}
              error={errors.code}
              onChange={(event) => setCode(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
            />

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Email'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-ink/60">
            Didn&apos;t get a code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-chestnut underline underline-offset-4 hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {resending ? 'Sending…' : 'Resend code'}
            </button>
          </p>
          <p className="mt-2 text-sm text-ink/60">
            Already verified?{' '}
            <Link href="/login" className="text-chestnut underline underline-offset-4 hover:opacity-80 transition-opacity">
              Sign in
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
