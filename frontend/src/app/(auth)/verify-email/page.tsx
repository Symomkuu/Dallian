'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { imagery } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/utils/api';
import { ClockIcon, RotateCcwIcon } from 'lucide-react';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function VerifyEmailPage() {
  const { verifyEmail, resendCode, pushToast } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams?.get('email') || '');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes expiration

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter the email you signed up with.';
    if (!/^\d{4,8}$/.test(code.trim())) next.code = 'Enter the code we emailed you.';
    if (timeLeft <= 0) next.code = 'This verification code has expired. Please click Resend code.';
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
      setTimeLeft(15 * 60); // Reset timer to 15 minutes
      if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
      pushToast({ title: 'New code sent.', body: 'Check your inbox for your 15-minute verification code.', tone: 'info' });
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
        <Image src={imagery.categoryHumanHair} alt="Dallian Luxe Hair" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <p className="label-luxe text-gold">Almost there</p>
          <h2 className="mt-4 max-w-sm font-serif text-4xl leading-tight text-cream">
            Verify your email to finish creating your account
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-ink">Verify Your Email</h1>
          <p className="mt-2 text-sm text-ink/60">
            We emailed a verification code to your address. Enter it below within 15 minutes to activate your account.
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

            <div>
              <TextField
                label="Verification Code"
                value={code}
                error={errors.code}
                onChange={(event) => {
                  setCode(event.target.value);
                  if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="e.g. 123456"
                labelRight={
                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-medium transition-all ${
                      timeLeft > 60
                        ? 'border-[#D99B26]/30 bg-[#D99B26]/10 text-ink'
                        : timeLeft > 0
                        ? 'animate-pulse border-amber-300 bg-amber-50 text-amber-800'
                        : 'border-red-200 bg-red-50 text-red-700 font-sans'
                    }`}
                  >
                    <ClockIcon width={12} height={12} className={timeLeft > 0 ? 'text-[#D99B26]' : 'text-red-600'} />
                    {timeLeft > 0 ? (
                      <span>
                        Expires in <strong className="font-bold">{formatTime(timeLeft)}</strong>
                      </span>
                    ) : (
                      <span className="font-semibold">Code expired</span>
                    )}
                  </div>
                }
              />

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-ink/45">
                  {timeLeft > 0 ? '15 min code validity' : 'Request a new code below'}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-chestnut underline hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcwIcon width={11} height={11} className={resending ? 'animate-spin' : ''} />
                  <span>{resending ? 'Sending…' : "Didn't get a code? Resend"}</span>
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Email'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-ink/60">
            Already verified?{' '}
            <Link href="/login" className="text-chestnut underline underline-offset-4 hover:opacity-80 transition-opacity font-medium">
              Sign in
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
