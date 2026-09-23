'use client';
import React, { useState } from 'react';
import { adminMessages } from '@/data/admin';
import { brand } from '@/data/brand';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatDate } from '@/utils/format';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';

export function AdminMessages() {
  const { pushToast } = useStore();
  const [selected, setSelected] = useState(adminMessages[0]);
  const [reply, setReply] = useState('');

  return (
    <>
      <AdminPageHeader
        title="Messages"
        body={`Enquiries submitted through the contact form. Replies are sent from ${brand.email}.`} />
      

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <ul className="divide-y divide-ink/10 border border-ink/10 bg-white">
          {adminMessages.map((message) =>
          <li key={message.id}>
              <button
              type="button"
              onClick={() => setSelected(message)}
              className={cx(
                'w-full px-5 py-4 text-left transition-colors duration-150',
                selected.id === message.id ? 'bg-cream' : 'hover:bg-cream/60'
              )}>
              
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-ink">{message.name}</span>
                  <span
                  className={cx(
                    'px-2 py-0.5 text-[10px] uppercase tracking-wide',
                    message.status === 'Unread' ? 'bg-gold/25 text-ink' : 'bg-cream-deep text-ink/55'
                  )}>
                  
                    {message.status}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-ink/60">{message.subject}</p>
                <p className="mt-1 text-[11px] text-ink/40">{formatDate(message.received)}</p>
              </button>
            </li>
          )}
        </ul>

        <div className="border border-ink/10 bg-white p-6">
          <p className="label-luxe text-ink/50">{selected.id}</p>
          <h2 className="mt-2 font-serif text-2xl text-ink">{selected.subject}</h2>
          <p className="mt-1 text-sm text-ink/55">
            From {selected.name} · {formatDate(selected.received)}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-ink/70">
            The full message body submitted through the contact form appears here, along with the phone number
            and email the customer supplied.
          </p>

          <form
            className="mt-7"
            onSubmit={(event) => {
              event.preventDefault();
              setReply('');
              pushToast({ title: 'Reply sent.', body: selected.name, tone: 'success' });
            }}>
            
            <label htmlFor="admin-reply" className="label-luxe text-ink/60">
              Reply
            </label>
            <textarea
              id="admin-reply"
              rows={5}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              className="mt-1.5 w-full border border-ink/20 px-4 py-3 text-sm focus:border-chestnut focus:outline-none" />
            
            <Button type="submit" className="mt-4" disabled={!reply.trim()}>
              Send Reply
            </Button>
          </form>
        </div>
      </div>
    </>);

}