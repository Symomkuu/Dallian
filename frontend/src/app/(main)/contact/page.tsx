'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  RefreshCwIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TruckIcon,
} from 'lucide-react';
import { brand } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { sendContactEnquiry } from '@/utils/api';

const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Custom Wig Sizing & Cap Fit',
  'Order & Delivery Status',
  'HD Lace & Hair Care Advice',
  'Wholesale & Salon Partnerships',
];

export default function ContactPage() {
  const { pushToast } = useStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Please provide your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Please provide a valid email address.';
    }
    if (!form.message.trim()) {
      next.message = 'Please enter your message or inquiry.';
    } else if (form.message.trim().length < 10) {
      next.message = 'Please enter at least 10 characters so we can assist you.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSending(true);
    setServerError('');

    try {
      await sendContactEnquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setSent(true);
      pushToast({
        title: 'Message sent',
        body: 'Your inquiry has been emailed to dallianltd@gmail.com.',
        tone: 'success',
      });
    } catch {
      setServerError(
        'We were unable to send your message right now. Please try again or chat with us on WhatsApp.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] py-8 sm:py-12">
      <div className="mx-auto max-w-page px-5 sm:px-8">
        {/* Main Grid: Left = Info & Map; Right = Form */}
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 items-start">

          {/* ── Left Column: Contact Channels & Map ────────────────────────── */}
          <aside className="space-y-6">

            {/* Studio & Contact Info Card */}
            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="border-b border-ink/8 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B3A2A]">
                  Dallian Studio & Boutique
                </p>
                <h2 className="mt-1 font-serif text-2xl text-ink">{brand.name}</h2>
              </div>

              <dl className="mt-6 space-y-5 text-sm">
                {/* Physical Address */}
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8B3A2A]/10 text-[#8B3A2A]">
                    <MapPinIcon width={16} height={16} />
                  </span>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink/40">Studio Location</dt>
                    <dd className="mt-0.5 text-ink/80 font-medium leading-snug">
                      {brand.addressLine1}
                      <br />
                      {brand.addressLine2}
                    </dd>
                  </div>
                </div>

                {/* Direct Phone */}
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8B3A2A]/10 text-[#8B3A2A]">
                    <PhoneIcon width={16} height={16} />
                  </span>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink/40">Call Us</dt>
                    <dd className="mt-0.5">
                      <a
                        href={`tel:${brand.phone.replace(/\s/g, '')}`}
                        className="text-ink font-semibold hover:text-[#8B3A2A] transition-colors"
                      >
                        {brand.phone}
                      </a>
                    </dd>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8B3A2A]/10 text-[#8B3A2A]">
                    <MailIcon width={16} height={16} />
                  </span>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink/40">Direct Email</dt>
                    <dd className="mt-0.5">
                      <a
                        href={`mailto:${brand.email}`}
                        className="text-ink font-semibold hover:text-[#8B3A2A] transition-colors"
                      >
                        {brand.email}
                      </a>
                    </dd>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8B3A2A]/10 text-[#8B3A2A]">
                    <ClockIcon width={16} height={16} />
                  </span>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink/40">Opening Hours</dt>
                    <dd className="mt-1 space-y-1 text-xs text-ink/75">
                      {brand.hours.map((entry) => (
                        <div key={entry.day} className="flex justify-between gap-4">
                          <span className="font-medium text-ink/85">{entry.day}</span>
                          <span className="font-mono text-ink/60">{entry.time}</span>
                        </div>
                      ))}
                    </dd>
                  </div>
                </div>
              </dl>

              {/* WhatsApp direct chat CTA */}
              <div className="mt-7 pt-5 border-t border-ink/8">
                <a
                  href={`https://wa.me/${brand.phoneIntl}?text=Hello%20Dallian%20Luxe%20Hair,%20I%20would%20like%20to%20inquire%20about%20your%20luxury%20wigs.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-700 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-emerald-800"
                >
                  <MessageCircleIcon width={18} height={18} />
                  <span>Chat with Us on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Interactive Live Google Map Card */}
            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-ink/8 bg-[#FAF8F5] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <MapPinIcon width={15} height={15} className="text-[#8B3A2A]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-ink">
                    Find Us at Mountain Mall
                  </span>
                </div>
                <a
                  href="https://maps.google.com/?q=Mountain+Mall,+Thika+Road,+Nairobi"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#8B3A2A] hover:underline"
                >
                  <span>Directions</span>
                  <ExternalLinkIcon width={12} height={12} />
                </a>
              </div>

              {/* Live Google Map iframe */}
              <div className="relative h-64 sm:h-72 w-full bg-[#EAE6DE]">
                <iframe
                  title="Dallian Luxe Hair Studio Location at Mountain Mall, Nairobi"
                  src="https://maps.google.com/maps?q=Mountain%20Mall,%20Thika%20Road,%20Nairobi&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="p-3.5 bg-white text-center">
                <p className="text-xs text-ink/55">
                  Located along Thika Superhighway, easily accessible with ample parking.
                </p>
              </div>
            </div>
          </aside>

          {/* ── Right Column: Contact Message Form ──────────────────────── */}
          <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-6 sm:p-9 shadow-sm">
            {/* Form Header */}
            <div className="border-b border-ink/8 pb-4">
              <span className="rounded-full bg-[#8B3A2A]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#8B3A2A] uppercase">
                Email Dispatch
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-ink">Send Us a Message</h2>
              <p className="mt-1.5 text-xs text-ink/55 leading-relaxed">
                Messages sent here go straight to <span className="font-semibold text-ink/75 font-mono">dallianltd@gmail.com</span>. We typically respond within a few hours during business days.
              </p>
            </div>

            {sent ? (
              /* Success Confirmation Banner */
              <div className="my-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 text-center space-y-4">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircleIcon width={30} height={30} />
                </span>

                <div>
                  <h3 className="font-serif text-2xl text-emerald-950">Thank You, {form.name.split(' ')[0]}!</h3>
                  <p className="mt-2 text-sm text-emerald-800/80 max-w-md mx-auto leading-relaxed">
                    Your inquiry has been successfully sent to <span className="font-bold">dallianltd@gmail.com</span>. Our concierge team will review your message and reach out to you via <span className="font-semibold">{form.email}</span>.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setForm({
                        name: '',
                        email: '',
                        phone: '',
                        subject: 'General Inquiry',
                        message: '',
                      });
                    }}
                    className="rounded-xl border border-emerald-300 bg-white px-6 py-2.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-50 shadow-2xs"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              /* Contact Form */
              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                {serverError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
                    {serverError}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Sandra Njuguna"
                      className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 transition focus:border-[#8B3A2A] focus:outline-none focus:ring-1 focus:ring-[#8B3A2A]"
                    />
                    {errors.name && <p className="text-[11px] text-red-600 font-medium">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. sandra@example.com"
                      className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 transition focus:border-[#8B3A2A] focus:outline-none focus:ring-1 focus:ring-[#8B3A2A]"
                    />
                    {errors.email && <p className="text-[11px] text-red-600 font-medium">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                      Phone Number <span className="text-[10px] text-ink/40 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. 0712 345 678"
                      className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 transition focus:border-[#8B3A2A] focus:outline-none focus:ring-1 focus:ring-[#8B3A2A]"
                    />
                  </div>

                  {/* Subject Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-subject" className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                      Topic / Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink transition focus:border-[#8B3A2A] focus:outline-none focus:ring-1 focus:ring-[#8B3A2A]"
                    >
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-ink/40 font-mono">
                      {form.message.length} characters
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about the wig style, length, cap sizing, or any questions you have…"
                    className="w-full rounded-xl border border-ink/15 bg-white p-3.5 text-sm text-ink placeholder:text-ink/30 transition focus:border-[#8B3A2A] focus:outline-none focus:ring-1 focus:ring-[#8B3A2A]"
                  />
                  {errors.message && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[11px] text-ink/45">
                    Delivered directly to <span className="text-ink font-semibold">dallianltd@gmail.com</span>
                  </p>

                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#8B3A2A] px-7 py-3 text-xs font-semibold uppercase tracking-wider text-cream shadow-sm transition hover:opacity-90 disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <RefreshCwIcon width={14} height={14} className="animate-spin" />
                        <span>Sending Message…</span>
                      </>
                    ) : (
                      <>
                        <SendIcon width={14} height={14} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>

        {/* Bottom Feature Badges */}
        <div className="grid gap-4 sm:grid-cols-3 pt-4">
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-2xs flex items-start gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <SparklesIcon width={18} height={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Bespoke Wig Fitting</h4>
              <p className="mt-1 text-xs text-ink/60 leading-relaxed">
                Visit our Mountain Mall boutique for personalized density and cap fitting.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-2xs flex items-start gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8B3A2A]/10 text-[#8B3A2A]">
              <TruckIcon width={18} height={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Nationwide Delivery</h4>
              <p className="mt-1 text-xs text-ink/60 leading-relaxed">
                Express and standard courier delivery across all 47 counties in Kenya.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-2xs flex items-start gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <ShieldCheckIcon width={18} height={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink">100% Quality Guaranteed</h4>
              <p className="mt-1 text-xs text-ink/60 leading-relaxed">
                Premium unprocessed human hair and pre-plucked HD lace frontals.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}