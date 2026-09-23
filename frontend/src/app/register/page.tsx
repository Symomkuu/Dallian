'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { imagery } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const { signIn, pushToast } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!/^0\d{9}$/.test(form.phone.replace(/\s/g, ''))) next.phone = 'Enter a 10-digit phone number.';
    if (form.password.length < 6) next.password = 'Use at least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    window.setTimeout(() => {
      signIn(form.name, form.email);
      pushToast({ title: 'Account created.', body: 'You are signed in.', tone: 'success' });
      setLoading(false);
      router.push('/account');
    }, 700);
  };

  return (
    <div className="grid lg:min-h-[80vh] lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-14 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-ink">Create Your Account</h1>
          <p className="mt-2 text-sm text-ink/60">
            Save your addresses, follow your orders and keep a wishlist of the pieces you love.
          </p>
          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
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
              hint="At least 6 characters"
              onChange={(event) => setForm({ ...form, password: event.target.value })}
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
        <img src={imagery.categoryFutura} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <p className="label-luxe text-gold">Dallian Luxe Hair</p>
          <h2 className="mt-4 max-w-sm font-serif text-4xl leading-tight text-cream">
            Smart choices for luxury looks
          </h2>
        </div>
      </div>
    </div>
  );
}