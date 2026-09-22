import React from 'react';
import { PlusIcon } from 'lucide-react';
import { discounts } from '@/data/admin';
import { cx } from '@/utils/format';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';

export function AdminDiscounts() {
  return (
    <>
      <AdminPageHeader
        title="Discounts"
        body="Create and manage discount codes. Codes apply at checkout and show on the customer's order summary."
        actions={
        <Button>
            <PlusIcon width={14} height={14} />
            New Code
          </Button>
        } />
      

      <div className="border border-ink/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left">
                {['Code', 'Type', 'Value', 'Usage', 'Expires', 'Status'].map((header) =>
                <th key={header} className="label-luxe px-5 py-3.5 text-ink/50">
                    {header}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {discounts.map((discount) =>
              <tr key={discount.code} className="transition-colors duration-150 hover:bg-cream/60">
                  <td className="px-5 py-4 font-serif text-base text-ink">{discount.code}</td>
                  <td className="px-5 py-4 text-ink/70">{discount.type}</td>
                  <td className="px-5 py-4 text-ink">{discount.value}</td>
                  <td className="px-5 py-4 text-ink/60">{discount.usage}</td>
                  <td className="px-5 py-4 text-ink/60">{discount.expires}</td>
                  <td className="px-5 py-4">
                    <span
                    className={cx(
                      'px-2.5 py-1 text-[11px]',
                      discount.status === 'Active' ?
                      'bg-emerald-50 text-emerald-800' :
                      'bg-cream-deep text-ink/60'
                    )}>
                    
                      {discount.status}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>);

}