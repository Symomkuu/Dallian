'use client';

import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import {
  ALL_COUNTRIES,
  POPULAR_COUNTRIES,
  DEFAULT_COUNTRY,
  type CountryCode,
  parsePhoneNumber,
  formatFullInternationalPhone,
} from '@/data/countryCodes';
import { cx } from '@/utils/format';

export interface PhoneInputProps {
  label?: string;
  value?: string; // Stored as full phone string (e.g. "+254712345678" or "0712345678")
  onChange: (fullNumber: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  autoComplete?: string;
}

export function PhoneInput({
  label,
  value = '',
  onChange,
  error,
  hint,
  placeholder = '712 345 678',
  disabled = false,
  required = false,
  className,
  id: customId,
  autoComplete = 'tel-national',
}: PhoneInputProps) {
  const generatedId = useId();
  const inputId = customId || `phone-input-${generatedId}`;

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
    const parsed = parsePhoneNumber(value);
    const found = ALL_COUNTRIES.find((c) => c.dialCode === parsed.dialCode);
    return found || DEFAULT_COUNTRY;
  });

  // Calculate local display number directly from value without needing an effect
  const localNumber = useMemo(() => {
    if (!value) return '';
    if (value.startsWith(selectedCountry.dialCode)) {
      return value.slice(selectedCountry.dialCode.length);
    }
    return parsePhoneNumber(value, selectedCountry.dialCode).localNumber;
  }, [value, selectedCountry.dialCode]);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    const timer = setTimeout(() => searchInputRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      clearTimeout(timer);
    };
  }, [isOpen]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    const full = formatFullInternationalPhone(country.dialCode, localNumber);
    onChange(full);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    // Check if user pasted a full international number with + (e.g. +256701234567)
    if (rawVal.startsWith('+')) {
      const parsed = parsePhoneNumber(rawVal);
      const foundCountry = ALL_COUNTRIES.find((c) => c.dialCode === parsed.dialCode);
      if (foundCountry) {
        setSelectedCountry(foundCountry);
        const full = formatFullInternationalPhone(foundCountry.dialCode, parsed.localNumber);
        onChange(full);
        return;
      }
    }

    // Keep numbers and spaces/hyphens
    const cleanDigits = rawVal.replace(/[^\d\s\-]/g, '');
    const full = formatFullInternationalPhone(selectedCountry.dialCode, cleanDigits);
    onChange(full);
  };

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return ALL_COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className={cx('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-ink/70"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        <div
          className={cx(
            'flex items-center rounded-xl border bg-white transition focus-within:ring-1',
            error
              ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-400/30'
              : 'border-ink/15 focus-within:border-[#8B3A2A] focus-within:ring-[#8B3A2A]/40'
          )}
        >
          {/* Country Code Selector Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            className="flex items-center gap-1.5 border-r border-ink/15 px-3 py-2.5 text-xs font-semibold text-ink/80 hover:bg-[#FAF7F2] transition-colors rounded-l-xl select-none"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="font-mono text-xs font-medium text-ink">{selectedCountry.dialCode}</span>
            <ChevronDown
              className={cx('h-3.5 w-3.5 text-ink/40 transition-transform duration-200', isOpen && 'rotate-180')}
            />
          </button>

          {/* Local Phone Number Input */}
          <input
            id={inputId}
            type="tel"
            inputMode="tel"
            disabled={disabled}
            value={localNumber}
            onChange={handleNumberChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            className="w-full rounded-r-xl bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Searchable Country Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-80 max-w-[90vw] rounded-2xl border border-ink/10 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
            {/* Search Box */}
            <div className="relative mb-2 px-1">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-ink/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code (e.g. +254, Kenya)..."
                className="w-full rounded-lg border border-ink/10 bg-[#FAF7F2] py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink/40 focus:border-[#8B3A2A] focus:outline-none"
              />
            </div>

            {/* List of Countries */}
            <div className="max-h-60 overflow-y-auto divide-y divide-ink/5 text-xs scrollbar-thin">
              {/* Popular / Priority Section when not searching */}
              {!searchQuery && (
                <div className="pb-1">
                  <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink/40">
                    Frequently Used
                  </p>
                  {POPULAR_COUNTRIES.map((c) => {
                    const isSelected = c.code === selectedCountry.code;
                    return (
                      <button
                        key={`pop-${c.code}-${c.dialCode}`}
                        type="button"
                        onClick={() => handleCountrySelect(c)}
                        className={cx(
                          'flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition hover:bg-[#FAF7F2]',
                          isSelected && 'bg-cream font-semibold text-[#8B3A2A]'
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base leading-none">{c.flag}</span>
                          <span className="truncate text-ink/90">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-ink/60">{c.dialCode}</span>
                          {isSelected && <Check className="h-3 w-3 text-[#8B3A2A]" />}
                        </div>
                      </button>
                    );
                  })}
                  <div className="my-1 border-t border-ink/10" />
                  <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink/40">
                    All Countries
                  </p>
                </div>
              )}

              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => {
                  const isSelected = c.code === selectedCountry.code;
                  return (
                    <button
                      key={`${c.code}-${c.dialCode}`}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={cx(
                        'flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition hover:bg-[#FAF7F2]',
                        isSelected && 'bg-cream font-semibold text-[#8B3A2A]'
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="truncate text-ink/90">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-ink/60">{c.dialCode}</span>
                        {isSelected && <Check className="h-3 w-3 text-[#8B3A2A]" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-ink/50">
                  No country matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {hint && !error && <p className="text-[11px] text-ink/50 leading-normal">{hint}</p>}
      {error && <p className="text-[11px] font-medium text-red-600 leading-normal">{error}</p>}
    </div>
  );
}
