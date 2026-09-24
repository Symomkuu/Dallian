'use client';

import React, { useState } from 'react';
import { ClockIcon, MailIcon, MapPinIcon, MessageCircleIcon, PhoneIcon } from 'lucide-react';
import { brand } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const { pushToast } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.message.trim()) next.message = 'Add a short message so we can help.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
      pushToast({ title: 'Message sent.', body: 'Our team will reply shortly.', tone: 'success' });
    }, 700);
  };

  return (
    <>
      <div className="mx-auto grid max-w-page gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-14">
        <aside>
          <div className="border border-ink/10 bg-white p-7">
            <h2 className="font-serif text-2xl text-ink">{brand.name}</h2>
            <dl className="mt-6 space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <dt className="mt-0.5">
                  <MapPinIcon width={16} height={16} className="text-gold" />
                  <span className="sr-only">Address</span>
                </dt>
                <dd className="text-ink/70">
                  {brand.addressLine1}
                  <br />
                  {brand.addressLine2}
                </dd>
              </div>
              <div className="flex items-start gap-3">
                <dt className="mt-0.5">
                  <PhoneIcon width={16} height={16} className="text-gold" />
                  <span className="sr-only">Phone</span>
                </dt>
                <dd>
                  <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="text-ink/70 hover:text-chestnut">
                    {brand.phone}
                  </a>
                </dd>
              </div>
              <div className="flex items-start gap-3">
                <dt className="mt-0.5">
                  <MailIcon width={16} height={16} className="text-gold" />
                  <span className="sr-only">Email</span>
                </dt>
                <dd>
                  <a href={`mailto:${brand.email}`} className="text-ink/70 hover:text-chestnut">
                    {brand.email}
                  </a>
                </dd>
              </div>
              <div className="flex items-start gap-3">
                <dt className="mt-0.5">
                  <ClockIcon width={16} height={16} className="text-gold" />
                  <span className="sr-only">Hours</span>
                </dt>
                <dd className="text-ink/70">
                  {brand.hours.map((entry) => (
                    <span key={entry.day} className="block">
                      {entry.day} — {entry.time}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <a
              href={`https://wa.me/${brand.phoneIntl}`}
              target="_blank"
              rel="noreferrer"
              className="label-luxe mt-7 flex h-12 items-center justify-center gap-2 bg-ink text-cream transition-colors duration-200 hover:bg-chestnut-deep"
            >
              <MessageCircleIcon width={15} height={15} className="text-gold" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="mt-5 border border-ink/10 ">
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-cream-deep p-8 text-center">
              <MapPinIcon width={22} height={22} className="text-chestnut" />
              <p className="font-serif text-lg text-ink">Mountain Mall, Thika Road</p>
              <p className="text-xs leading-relaxed text-ink/55">
                Map placeholder — this area can be connected to Google Maps by the administrator.
              </p>
            </div>
          </div>
        </aside>

        <section>
          <div className="border border-ink/10 bg-white p-7 sm:p-9">
            <h2 className="font-serif text-2xl text-ink">Send us a message</h2>
            {sent ? (
              <div className="mt-7 border border-gold/50 bg-cream px-6 py-8 text-center">
                <p className="font-serif text-xl text-ink">Thank you, {form.name.split(' ')[0]}.</p>
                <p className="mt-2 text-sm text-ink/65">
                  Your message has been received. We reply to enquiries during store hours.
                </p>
                <Button
                  variant="secondary"
                  className="mt-6"
                  onClick={() => {
                    setSent(false);
                    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
                  }}
                >
                  Send Another
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-7 grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Name"
                  value={form.name}
                  error={errors.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />

                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  error={errors.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />

                <TextField
                  label="Phone"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  inputMode="tel"
                />

                <TextField
                  label="Subject"
                  value={form.subject}
                  onChange={(event) => setForm({ ...form, subject: event.target.value })}
                />

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="contact-message" className="label-luxe text-ink/60">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    aria-invalid={Boolean(errors.message)}
                    className="w-full rounded-sm border border-ink/20 bg-white px-4 py-3 text-sm focus:border-chestnut focus:outline-none"
                  />

                  {errors.message && <p className="text-xs text-red-700">{errors.message}</p>}
                </div>
                <Button type="submit" size="lg" className="sm:col-span-2 sm:w-52" disabled={sending}>
                  {sending ? 'Sending…' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </>
  );
}