import React from 'react';
import { PlusIcon } from 'lucide-react';
import { cx } from '../../utils/format';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';

const users = [
{ name: 'Store Owner', email: 'dallianltd@gmail.com', role: 'Administrator', status: 'Active' },
{ name: 'Shop Manager', email: 'manager@dallian.example', role: 'Manager', status: 'Active' },
{ name: 'Sales Assistant', email: 'sales@dallian.example', role: 'Staff', status: 'Active' },
{ name: 'Stock Clerk', email: 'stock@dallian.example', role: 'Inventory', status: 'Invited' }];


const permissions = [
{ role: 'Administrator', scope: 'Full access including settings, users and payments' },
{ role: 'Manager', scope: 'Products, orders, customers, discounts and content' },
{ role: 'Staff', scope: 'Orders and messages only' },
{ role: 'Inventory', scope: 'Inventory and product stock levels' }];


export function AdminUsers() {
  return (
    <>
      <AdminPageHeader
        title="Users & Roles"
        body="Control who can access the dashboard and what each role is allowed to change."
        actions={
        <Button>
            <PlusIcon width={14} height={14} />
            Invite User
          </Button>
        } />
      

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <section className="border border-ink/10 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left">
                  {['User', 'Role', 'Status', ''].map((header) =>
                  <th key={header} className="label-luxe px-5 py-3.5 text-ink/50">
                      {header}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {users.map((user) =>
                <tr key={user.email}>
                    <td className="px-5 py-4">
                      <p className="text-ink">{user.name}</p>
                      <p className="text-xs text-ink/50">{user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-ink/70">{user.role}</td>
                    <td className="px-5 py-4">
                      <span
                      className={cx(
                        'px-2.5 py-1 text-[11px]',
                        user.status === 'Active' ? 'bg-emerald-50 text-emerald-800' : 'bg-gold/20 text-ink'
                      )}>
                      
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" className="label-luxe text-chestnut hover:underline">
                        Manage
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Role permissions</h2>
          <ul className="mt-5 divide-y divide-ink/10">
            {permissions.map((permission) =>
            <li key={permission.role} className="py-4">
                <p className="text-sm text-ink">{permission.role}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink/55">{permission.scope}</p>
              </li>
            )}
          </ul>
        </section>
      </div>
    </>);

}