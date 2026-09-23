'use client';
import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { formatKsh } from '@/utils/format';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

interface Zone {
  id: string;
  name: string;
  fee: number;
  timeline: string;
  active: boolean;
}

export function AdminDelivery() {
  const { pushToast } = useStore();
  const [zones, setZones] = useState<Zone[]>([
  { id: 'z1', name: 'Store Collection — Mountain Mall', fee: 0, timeline: 'Same day, during store hours', active: true },
  { id: 'z2', name: 'Nairobi Delivery', fee: 500, timeline: 'Set by the store', active: true },
  { id: 'z3', name: 'Countrywide Courier', fee: 700, timeline: 'Set by the store', active: true }]
  );

  return (
    <>
      <AdminPageHeader
        title="Delivery"
        body="Delivery options shown at checkout. Fees and timelines entered here are what customers see before they pay."
        actions={
        <Button>
            <PlusIcon width={14} height={14} />
            Add Option
          </Button>
        } />
      

      <form
        className="border border-ink/10 bg-white"
        onSubmit={(event) => {
          event.preventDefault();
          pushToast({ title: 'Delivery options saved.', tone: 'success' });
        }}>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left">
                {['Option', 'Fee (KSh)', 'Timeline', 'Active'].map((header) =>
                <th key={header} className="label-luxe px-5 py-3.5 text-ink/50">
                    {header}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {zones.map((zone, index) =>
              <tr key={zone.id}>
                  <td className="px-5 py-4 text-ink">{zone.name}</td>
                  <td className="px-5 py-4">
                    <input
                    type="number"
                    min={0}
                    value={zone.fee}
                    aria-label={`Fee for ${zone.name}`}
                    onChange={(event) =>
                    setZones((prev) =>
                    prev.map((item, i) =>
                    i === index ? { ...item, fee: Number(event.target.value) } : item
                    )
                    )
                    }
                    className="h-10 w-28 border border-ink/20 px-3 text-sm focus:border-chestnut focus:outline-none" />
                  
                  </td>
                  <td className="px-5 py-4">
                    <input
                    value={zone.timeline}
                    aria-label={`Timeline for ${zone.name}`}
                    onChange={(event) =>
                    setZones((prev) =>
                    prev.map((item, i) => i === index ? { ...item, timeline: event.target.value } : item)
                    )
                    }
                    className="h-10 w-full min-w-48 border border-ink/20 px-3 text-sm focus:border-chestnut focus:outline-none" />
                  
                  </td>
                  <td className="px-5 py-4">
                    <label className="flex items-center gap-2 text-xs text-ink/60">
                      <input
                      type="checkbox"
                      checked={zone.active}
                      onChange={() =>
                      setZones((prev) =>
                      prev.map((item, i) => i === index ? { ...item, active: !item.active } : item)
                      )
                      }
                      className="h-3.5 w-3.5 accent-chestnut" />
                    
                      Shown at checkout
                    </label>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-5 border-t border-ink/10 p-6 sm:grid-cols-2">
          <TextField label="Free delivery threshold (KSh)" placeholder="Leave blank for none" />
          <TextField label="Dispatch cut-off time" placeholder="e.g. 15:00" />
        </div>

        <div className="border-t border-ink/10 px-6 py-5">
          <Button type="submit">Save Delivery Settings</Button>
          <p className="mt-3 text-xs text-ink/50">
            Current Nairobi fee shown to customers: {formatKsh(zones[1].fee)}
          </p>
        </div>
      </form>
    </>);

}