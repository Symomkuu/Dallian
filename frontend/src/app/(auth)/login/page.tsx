'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { imagery } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/utils/api';

export default function LoginPage() {
  const { login, pushToast } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter the email address on your account.';
    if (password.length < 6) next.password = 'Passwords are at least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const me = await login(email, password);
      pushToast({ title: 'Signed in.', body: 'Welcome back to Dallian Luxe Hair.', tone: 'success' });
      // The backend tells us the role; staff go to the dashboard, customers to their account.
      router.push(me.role === 'staff' ? '/admin/dashboard' : '/account');
    } catch (error) {
      if (error instanceof ApiError && error.payload?.code === 'email_not_verified') {
        pushToast({ title: 'Please verify your email first.', tone: 'error' });
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      const message =
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
      setErrors({ password: message });
      pushToast({ title: 'Could not sign in.', body: message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:min-h-[80vh] lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-14 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-ink">Sign In</h1>
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
              label="Password"
              type="password"
              value={password}
              error={errors.password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-ink/60">
                <input type="checkbox" className="h-3.5 w-3.5 accent-chestnut" />
                Keep me signed in
              </label>
              <button type="button" className="text-chestnut underline-offset-4 hover:opacity-80 transition-opacity">
                Forgot password?
              </button>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-ink/60">
            New to Dallian Luxe Hair?{' '}
            <Link href="/register" className="text-chestnut underline underline-offset-4 hover:opacity-80 transition-opacity">
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-sm text-ink/60">
            Or{' '}
            <Link href="/" className="text-chestnut underline underline-offset-4 hover:opacity-80 transition-opacity">
              continue as a guest
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <img src={imagery.categoryHumanHair} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>
  );
}