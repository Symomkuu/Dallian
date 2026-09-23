'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { imagery } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/utils/api';

export default function RegisterPage() {
  const { register, pushToast } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!/^0\d{9}$/.test(form.phone.replace(/\s/g, ''))) next.phone = 'Enter a 10-digit phone number.';
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
        phone: form.phone,
      });
      pushToast({
        title: 'Account created.',
        body: 'Enter the code we emailed you to verify your address.',
        tone: 'success',
      });
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        // DRF sends field errors keyed by their own field name, e.g.
        // { email: ["This email is already registered..."] }. Map each one
        // to the matching input; anything left over (or a generic `detail`
        // message) is shown as a banner above the form instead.
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
          <h1 className="mt-2 font-serif text-2xl leading-tight text-ink sm:text-3xl">Create Your Account</h1>
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
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              autoComplete="email"
            />

            <TextField
              label="Phone Number"
              value={form.phone}
              error={errors.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              inputMode="tel"
              autoComplete="tel"
            />

            <TextField
              label="Password"
              type="password"
              value={form.password}
              error={errors.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              autoComplete="new-password"
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              autoComplete="new-password"
            />

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>
          <p className="mt-6 text-sm text-ink/60">
            Already have an account?{' '}
            <Link href="/login" className="text-chestnut underline underline-offset-4 hover:opacity-80 transition-opacity">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <img src={imagery.categoryHumanHair} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>
  );
}