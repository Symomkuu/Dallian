'use client';

import React, { useState } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserIcon,
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { formatDate } from '@/utils/format';

export default function CustomerSettingsPage() {
  const { user, updateUserProfile, pushToast } = useStore();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.delivery_address || '');
  const [notifyOrderUpdates, setNotifyOrderUpdates] = useState(user?.notify_order_updates ?? true);
  const [notifyPromotionsAndDeals, setNotifyPromotionsAndDeals] = useState(user?.notify_promotions_and_deals ?? true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-ink/50">Loading your profile…</p>
      </div>
    );
  }

  // Check if form has unsaved modifications
  const isDirty =
    fullName !== (user.full_name || '') ||
    phone !== (user.phone || '') ||
    deliveryAddress !== (user.delivery_address || '') ||
    notifyOrderUpdates !== (user.notify_order_updates ?? true) ||
    notifyPromotionsAndDeals !== (user.notify_promotions_and_deals ?? true);

  const handleReset = () => {
    setFullName(user.full_name || '');
    setPhone(user.phone || '');
    setDeliveryAddress(user.delivery_address || '');
    setNotifyOrderUpdates(user.notify_order_updates ?? true);
    setNotifyPromotionsAndDeals(user.notify_promotions_and_deals ?? true);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      await updateUserProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        delivery_address: deliveryAddress.trim(),
        notify_order_updates: notifyOrderUpdates,
        notify_promotions_and_deals: notifyPromotionsAndDeals,
      });

      setSavedSuccess(true);
      pushToast({
        title: 'Settings saved successfully',
        body: 'Your profile, delivery address, and preferences have been updated.',
        tone: 'success',
      });
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setErrorMsg('Failed to update settings. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-7 pb-12">
      {/* Page Header */}
      <div>
        <p className="label-luxe text-[#8B3A2A]">Account Preferences</p>
        <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-ink/55">
          Update your contact details, delivery address for quick ordering, and notification preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error notification banner */}
        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* 1. Account & Security Overview (Read-only) */}
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-ink/8 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8B3A2A]/10 text-[#8B3A2A]">
                <ShieldCheckIcon width={16} height={16} />
              </span>
              <h2 className="text-sm font-semibold tracking-wide text-ink uppercase">
                Account Information
              </h2>
            </div>
            {user.is_email_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                <CheckCircleIcon width={12} height={12} /> Verified Member
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink/40">Email Address (Login ID)</p>
              <div className="mt-1 flex items-center gap-2 text-ink font-mono font-medium">
                <MailIcon width={15} height={15} className="text-ink/35 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink/40">Member Since</p>
              <p className="mt-1 text-ink/75 font-medium">
                {user.created_at ? formatDate(user.created_at) : 'Active customer'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Personal & Contact Details */}
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 shadow-xs">
          <div className="mb-4 flex items-center gap-2 border-b border-ink/8 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8B3A2A]/10 text-[#8B3A2A]">
              <UserIcon width={16} height={16} />
            </span>
            <h2 className="text-sm font-semibold tracking-wide text-ink uppercase">
              Personal & Contact Details
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-ink/65">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon width={16} height={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full rounded-xl border border-ink/15 bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink/30 transition focus:border-[#8B3A2A] focus:outline-none focus:ring-1 focus:ring-[#8B3A2A]"
                />
              </div>
              <p className="text-[11px] text-ink/40">Used on your orders, invoices, and delivery slips.</p>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-ink/65">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon width={16} height={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +254 712 345 678"
                  className="w-full rounded-xl border border-ink/15 bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink/30 transition focus:border-[#8B3A2A] focus:outline-none focus:ring-1 focus:ring-[#8B3A2A]"
                />
              </div>
              <p className="text-[11px] text-ink/40">Used for courier delivery coordination and M-Pesa checkout prefill.</p>
            </div>
          </div>
        </div>

        {/* 3. Default Delivery Address */}
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 shadow-xs">
          <div className="mb-4 flex items-center gap-2 border-b border-ink/8 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8B3A2A]/10 text-[#8B3A2A]">
              <MapPinIcon width={16} height={16} />
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-ink uppercase">
                Default Delivery Address
              </h2>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="deliveryAddress" className="block text-xs font-semibold uppercase tracking-wider text-ink/65">
              Shipping & Delivery Location
            </label>
            <div className="relative">
              <textarea
                id="deliveryAddress"
                rows={3}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="e.g. Apartment 4B, Sunset Heights, Argwings Kodhek Rd, Kilimani, Nairobi"
                className="w-full rounded-xl border border-ink/15 bg-white p-3.5 text-sm text-ink placeholder:text-ink/30 transition focus:border-[#8B3A2A] focus:outline-none focus:ring-1 focus:ring-[#8B3A2A]"
              />
            </div>
            <p className="text-[11px] text-ink/45">
              This address will be automatically selected when you place orders, saving you time at checkout.
            </p>
          </div>
        </div>

        {/* 4. Notification Preferences */}
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 shadow-xs">
          <div className="mb-4 flex items-center gap-2 border-b border-ink/8 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8B3A2A]/10 text-[#8B3A2A]">
              <BellIcon width={16} height={16} />
            </span>
            <h2 className="text-sm font-semibold tracking-wide text-ink uppercase">
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-4 divide-y divide-ink/8">
            {/* Order updates toggle */}
            <div className="flex items-start justify-between gap-4 pt-1">
              <div className="space-y-0.5">
                <label htmlFor="notify_order_updates" className="text-sm font-semibold text-ink cursor-pointer">
                  Order & Delivery Updates
                </label>
                <p className="text-xs text-ink/50 leading-relaxed">
                  Receive notifications whenever an order is confirmed, prepared, out for delivery, or completed.
                </p>
              </div>

              <div className="relative inline-flex items-center shrink-0 pt-0.5">
                <input
                  id="notify_order_updates"
                  type="checkbox"
                  checked={notifyOrderUpdates}
                  onChange={(e) => setNotifyOrderUpdates(e.target.checked)}
                  className="h-5 w-5 rounded border-ink/20 text-[#8B3A2A] focus:ring-[#8B3A2A] accent-[#8B3A2A] cursor-pointer"
                />
              </div>
            </div>

            {/* Promotions & deals toggle */}
            <div className="flex items-start justify-between gap-4 pt-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="notify_promotions" className="text-sm font-semibold text-ink cursor-pointer">
                    Promotions & Exclusive Deals
                  </label>
                  <SparklesIcon width={14} height={14} className="text-[#D99B26]" />
                </div>
                <p className="text-xs text-ink/50 leading-relaxed">
                  Be notified of seasonal sales, member-only discounts, and new luxury wig arrivals.
                </p>
              </div>

              <div className="relative inline-flex items-center shrink-0 pt-0.5">
                <input
                  id="notify_promotions"
                  type="checkbox"
                  checked={notifyPromotionsAndDeals}
                  onChange={(e) => setNotifyPromotionsAndDeals(e.target.checked)}
                  className="h-5 w-5 rounded border-ink/20 text-[#8B3A2A] focus:ring-[#8B3A2A] accent-[#8B3A2A] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-[#F7F3EC] p-4 sm:px-6">
          <div className="text-xs text-ink/50">
            {isDirty ? (
              <span className="font-medium text-[#8B3A2A]">You have unsaved changes.</span>
            ) : savedSuccess ? (
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircleIcon width={14} height={14} /> All changes saved.
              </span>
            ) : (
              <span>Your profile information is securely stored.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-xs font-semibold text-ink/70 transition hover:border-ink/30 hover:text-ink disabled:opacity-50"
              >
                Discard
              </button>
            )}

            <button
              type="submit"
              disabled={saving || !isDirty}
              className="flex items-center gap-2 rounded-xl bg-[#8B3A2A] px-6 py-2.5 text-xs font-semibold tracking-wider text-cream uppercase transition hover:opacity-90 disabled:opacity-40 shadow-xs"
            >
              {saving ? (
                <>
                  <RefreshCwIcon width={14} height={14} className="animate-spin" />
                  <span>Saving…</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircleIcon width={14} height={14} />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
