'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { imagery } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/utils/api';
import { GoogleLoginBlock } from '@/components/GoogleLoginBlock';
import type { CredentialResponse } from '@react-oauth/google';
import { ArrowLeftIcon, MailIcon } from 'lucide-react';

export default function RegisterPage() {
  const { register, loginWithGoogle, pushToast } = useStore();
  const router = useRouter();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const syncEmailFormState = () => {
      const isEmailFormState = window.history.state?.authSignupMode === 'email';
      setShowEmailForm(isEmailFormState);
    };

    syncEmailFormState();
    window.addEventListener('popstate', syncEmailFormState);

    return () => {
      window.removeEventListener('popstate', syncEmailFormState);
    };
  }, []);

  const openEmailSignup = useCallback(() => {
    setShowEmailForm(true);
    const nextState = { ...(window.history.state ?? {}), authSignupMode: 'email' };
    window.history.pushState(nextState, '', window.location.pathname + window.location.search);
  }, []);

  const closeEmailSignup = useCallback(() => {
    setShowEmailForm(false);
    if (window.history.state?.authSignupMode === 'email') {
      window.history.back();
    }
  }, []);

  const handleGoogleSignup = useCallback(
    async (response: CredentialResponse) => {
      if (!response.credential) {
        setFormError('Google sign-up did not return a valid credential. Please try again.');
        pushToast({ title: 'Google sign-up error', body: 'Missing credential from Google.', tone: 'error' });
        return;
      }
      setFormError('');
      setGoogleLoading(true);
      try {
        const me = await loginWithGoogle(response.credential);
        pushToast({
          title: 'Account created & signed in.',
          body: 'Welcome to Dallian Luxe Hair!',
          tone: 'success',
        });
        router.push(me.role === 'staff' ? '/admin/dashboard' : '/customer/dashboard');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Unable to sign up with Google. Please try again.';
        setFormError(message);
        pushToast({ title: 'Google sign-up failed', body: message, tone: 'error' });
      } finally {
        setGoogleLoading(false);
      }
    },
    [loginWithGoogle, pushToast, router]
  );

  const handleGoogleError = useCallback(() => {
    setFormError('Google sign-up was cancelled or failed. Please try again.');
    pushToast({ title: 'Sign up cancelled', body: 'Google sign-up attempt was unsuccessful.', tone: 'error' });
  }, [pushToast]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.phone && !/^0\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
      next.phone = 'Enter a 10-digit phone number (e.g. 0712345678).';
    }
    if (form.password.length < 6) next.password = 'Use at least 6 characters.';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await register({
        full_name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      pushToast({
        title: 'Account created.',
        body: 'Enter the code we emailed you to verify your address.',
        tone: 'success',
      });
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors: Record<string, string> = {};
        for (const [field, value] of Object.entries(error.payload)) {
          if (['full_name', 'email', 'phone', 'password'].includes(field) && Array.isArray(value)) {
            const key = field === 'full_name' ? 'name' : field;
            fieldErrors[key] = String(value[0]);
          }
        }
        setErrors(fieldErrors);
        setFormError(Object.keys(fieldErrors).length > 0 ? '' : error.message);
        pushToast({ title: 'Could not create account.', body: error.message, tone: 'error' });
      } else {
        const message = 'Something went wrong. Please try again.';
        setFormError(message);
        pushToast({ title: 'Could not create account.', body: message, tone: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:min-h-[80vh] lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          {showEmailForm ? (
            <div>
              <button
                type="button"
                onClick={closeEmailSignup}
                className="inline-flex items-center gap-1.5 text-xs text-ink/60 hover:text-chestnut transition-colors mb-4"
              >
                <ArrowLeftIcon width={14} height={14} />
                All sign up options
              </button>
              <h1 className="font-serif text-2xl leading-tight text-ink sm:text-3xl">Sign Up with Email</h1>
              <p className="mt-1 text-sm text-ink/60">Fill in your details below to create your Dallian account.</p>

              {formError && (
                <p
                  role="alert"
                  className="mt-4 flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </p>
              )}

              <form onSubmit={submit} noValidate className="mt-6 space-y-4">
                <TextField
                  label="Full Name"
                  value={form.name}
                  error={errors.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  autoComplete="name"
                  placeholder="e.g. Wanjiru Mwangi"
                />

                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  error={errors.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  autoComplete="email"
                  placeholder="you@example.com"
                />

                <TextField
                  label="Phone Number (Optional)"
                  value={form.phone}
                  error={errors.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0712 345 678"
                />

                <TextField
                  label="Password"
                  type="password"
                  value={form.password}
                  error={errors.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />

                <TextField
                  label="Confirm Password"
                  type="password"
                  value={form.confirmPassword}
                  error={errors.confirmPassword}
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                />

                <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </Button>
              </form>
            </div>
          ) : (
            <div>
              <h1 className="font-serif text-2xl leading-tight text-ink sm:text-3xl">Create Your Account</h1>
              <p className="mt-2 text-sm text-ink/60">
                Choose your preferred sign up method to begin your luxury hair journey.
              </p>

              {formError && (
                <p
                  role="alert"
                  className="mt-4 flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </p>
              )}

              {/* Google Sign-Up Choice Block */}
              <div className="mt-8 space-y-4">
                <GoogleLoginBlock
                  text="signup_with"
                  onSuccess={handleGoogleSignup}
                  onError={handleGoogleError}
                />

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="h-px w-full bg-ink/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-cream px-3 text-ink/45 font-medium tracking-wider">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openEmailSignup}
                  className="flex w-full items-center justify-center gap-2.5 border border-black bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-black transition-all hover:bg-black hover:text-white"
                >
                  <MailIcon width={16} height={16} />
                  <span>Sign up with email</span>
                </button>
              </div>
            </div>
          )}

          <p className="mt-6 text-sm text-ink/60">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-chestnut underline underline-offset-4 hover:opacity-80 transition-opacity font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <img
          src={imagery.categoryHumanHair}
          alt="Dallian Luxe Hair Model"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}