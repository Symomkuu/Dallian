'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LockIcon,
  MailIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/contexts/StoreContext';
import { ApiError } from '@/utils/api';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

function maskEmail(email: string): string {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return email;
  if (user.length <= 2) {
    return `${user[0] || ''}•••@${domain}`;
  }
  const prefix = user.slice(0, 2);
  const suffix = user.slice(-1);
  return `${prefix}•••${suffix}@${domain}`;
}

function getPasswordStrength(pass: string): { score: number; label: string; barColor: string; textColor: string } {
  if (!pass) return { score: 0, label: '', barColor: 'bg-ink/10', textColor: 'text-ink/40' };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 10) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score === 1) return { score: 1, label: 'Weak', barColor: 'bg-rose-500', textColor: 'text-rose-600' };
  if (score === 2) return { score: 2, label: 'Fair', barColor: 'bg-amber-500', textColor: 'text-amber-600' };
  if (score === 3) return { score: 3, label: 'Good', barColor: 'bg-blue-500', textColor: 'text-blue-600' };
  return { score: 4, label: 'Strong', barColor: 'bg-emerald-500', textColor: 'text-emerald-600' };
}

export function ResetPasswordModal({ isOpen, onClose, email }: ResetPasswordModalProps) {
  const { forgotPassword, resetPassword } = useStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Form fields
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset internal state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
      setLoading(false);
      setResending(false);
    }
  }, [isOpen]);

  // Handle countdown timer for resend code
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSendCode = async () => {
    if (!email) {
      toast.error('No email address provided.');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await forgotPassword(email);
      toast.success(`Verification code sent to ${email}`);
      setCountdown(59);
      setStep(2);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not send verification code. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await forgotPassword(email);
      toast.success(`New verification code sent to ${email}`);
      setCountdown(59);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not resend code. Please try again.';
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      nextErrors.code = 'Please enter the 6-digit code.';
    } else if (trimmedCode.length < 4) {
      nextErrors.code = 'Code must be at least 4 digits.';
    }

    if (!newPassword) {
      nextErrors.newPassword = 'Please enter a new password.';
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await resetPassword(email, trimmedCode, newPassword);
      toast.success('Password reset successfully!');
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to reset password. Please check your code and try again.';
      
      if (message.toLowerCase().includes('code')) {
        setErrors({ code: message });
      } else if (message.toLowerCase().includes('password')) {
        setErrors({ newPassword: message });
      } else {
        setErrors({ general: message });
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const masked = maskEmail(email);
  const strength = getPasswordStrength(newPassword);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl sm:rounded-3xl border border-ink/10 bg-white p-6 sm:p-8 shadow-2xl"
          >
            {/* Close Button on top right */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 sm:right-6 sm:top-6 flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/5 hover:text-ink focus:outline-none"
              aria-label="Close modal"
            >
              <XIcon width={18} height={18} />
            </button>

            {step === 1 ? (
              /* ================= STEP 1: FORGOT YOUR PASSWORD? ================= */
              <div>
                {/* Brand Icon Header */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B3A2A]/10 text-[#8B3A2A]">
                  <LockIcon width={22} height={22} />
                </div>

                <div className="mt-5">
                  <h3 className="font-serif text-2xl font-bold tracking-tight text-ink">
                    Forgot your password?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    No worries — we'll email a verification code to{' '}
                    <span className="font-semibold text-ink">{masked}</span>.
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSendCode}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B3A2A] py-3.5 px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#702d20] focus:outline-none focus:ring-2 focus:ring-[#8B3A2A]/20 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Sending code...</span>
                      </div>
                    ) : (
                      'Send verification code'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 text-center text-sm font-medium text-ink/60 transition hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ================= STEP 2: CHECK YOUR EMAIL ================= */
              <div>
                {/* Brand Icon Header */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B3A2A]/10 text-[#8B3A2A]">
                  <MailIcon width={22} height={22} />
                </div>

                <div className="mt-5">
                  <h3 className="font-serif text-2xl font-bold tracking-tight text-ink">
                    Check your email
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    Enter the 6-digit code sent to{' '}
                    <span className="font-semibold text-ink">{masked}</span>, then choose a new password.
                  </p>
                </div>

                <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">
                  {/* General Error */}
                  {errors.general && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                      {errors.general}
                    </div>
                  )}

                  {/* Verification Code */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold tracking-wider text-ink/60 uppercase">
                        Verification Code
                      </label>
                      {countdown > 0 ? (
                        <span className="text-[11px] font-medium text-ink/45">
                          Resend ({countdown}s)
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={resending}
                          onClick={handleResendCode}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#8B3A2A] hover:underline disabled:opacity-50 cursor-pointer"
                        >
                          <RotateCcwIcon width={10} height={10} className={resending ? 'animate-spin' : ''} />
                          Resend code
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={8}
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
                      }}
                      placeholder="· · · · · ·"
                      className={`w-full rounded-xl border bg-[#FBF9F5]/70 px-4 py-3 text-base font-mono tracking-widest text-ink transition placeholder:text-ink/30 focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.code
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                          : 'border-ink/15 focus:border-[#8B3A2A] focus:ring-[#8B3A2A]/15'
                      }`}
                    />
                    {errors.code && (
                      <p className="mt-1 text-xs text-rose-600">{errors.code}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-ink/60 uppercase mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                        }}
                        placeholder="At least 6 characters"
                        className={`w-full rounded-xl border bg-[#FBF9F5]/70 px-4 py-3 pr-11 text-sm text-ink transition placeholder:text-ink/30 focus:bg-white focus:outline-none focus:ring-2 ${
                          errors.newPassword
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                            : 'border-ink/15 focus:border-[#8B3A2A] focus:ring-[#8B3A2A]/15'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 transition hover:text-ink focus:outline-none"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? (
                          <EyeOffIcon width={16} height={16} />
                        ) : (
                          <EyeIcon width={16} height={16} />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-xs text-rose-600">{errors.newPassword}</p>
                    )}

                    {/* Password Strength Meter */}
                    {newPassword.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                level <= strength.score ? strength.barColor : 'bg-ink/10'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="mt-1 flex justify-between items-center text-[10px]">
                          <span className={`font-semibold ${strength.textColor}`}>{strength.label}</span>
                          <span className="text-ink/40">Min 6 characters</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-ink/60 uppercase mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                        }}
                        placeholder="Repeat your password"
                        className={`w-full rounded-xl border bg-[#FBF9F5]/70 px-4 py-3 pr-11 text-sm text-ink transition placeholder:text-ink/30 focus:bg-white focus:outline-none focus:ring-2 ${
                          errors.confirmPassword
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                            : 'border-ink/15 focus:border-[#8B3A2A] focus:ring-[#8B3A2A]/15'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 transition hover:text-ink focus:outline-none"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon width={16} height={16} />
                        ) : (
                          <EyeIcon width={16} height={16} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 flex flex-col gap-2.5">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B3A2A] py-3.5 px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#702d20] focus:outline-none focus:ring-2 focus:ring-[#8B3A2A]/20 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Resetting password...</span>
                        </div>
                      ) : (
                        'Reset password'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full py-1 text-center text-xs font-medium text-ink/50 transition hover:text-ink cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
