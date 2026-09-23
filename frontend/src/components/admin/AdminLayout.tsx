import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from '@/components/RouterCompat';
import {
  BarChart3Icon,
  BoxesIcon,
  ClipboardListIcon,
  CreditCardIcon,
  FileTextIcon,
  HeartIcon,
  LayoutDashboardIcon,
  MailIcon,
  MenuIcon,
  MessageSquareIcon,
  ExternalLinkIcon,
  ShieldIcon,
  ShoppingCartIcon,
  StarIcon,
  TagIcon,
  TruckIcon,
  UsersIcon,
  XIcon } from
'lucide-react';
import { brand } from '../../data/brand';
import { cx } from '../../utils/format';

const navGroups = [
{
  heading: 'Overview',
  items: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboardIcon }]
},
{
  heading: 'Catalogue',
  items: [
  { label: 'Products', to: '/admin/products', icon: BoxesIcon },
  { label: 'Categories', to: '/admin/categories', icon: TagIcon },
  { label: 'Inventory', to: '/admin/inventory', icon: ClipboardListIcon },
  { label: 'Discounts', to: '/admin/discounts', icon: TagIcon }]

},
{
  heading: 'Selling',
  items: [
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCartIcon },
  { label: 'Payments', to: '/admin/payments', icon: CreditCardIcon },
  { label: 'Delivery', to: '/admin/delivery', icon: TruckIcon },
  { label: 'Customers', to: '/admin/customers', icon: UsersIcon }]

},
{
  heading: 'Engagement',
  items: [
  { label: 'Reviews', to: '/admin/reviews', icon: StarIcon },
  { label: 'Wishlist Analytics', to: '/admin/wishlist', icon: HeartIcon },
  { label: 'Messages', to: '/admin/messages', icon: MailIcon },
  { label: 'Content', to: '/admin/content', icon: FileTextIcon }]

},
{
  heading: 'Administration',
  items: [
  { label: 'Reports', to: '/admin/reports', icon: BarChart3Icon },
  { label: 'Settings', to: '/admin/settings', icon: MessageSquareIcon },
  { label: 'Users & Roles', to: '/admin/users', icon: ShieldIcon }]

}];


export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const sidebar =
  <div className="flex h-full flex-col bg-ink text-cream">
      <div className="flex items-center gap-3 border-b border-cream/10 px-5 py-5">
        <img src={brand.logo} alt="" className="h-9 w-9 border border-gold/40 object-cover" />
        <div className="leading-none">
          <p className="font-serif text-sm tracking-[0.12em]">DALLIAN</p>
          <p className="mt-1 text-[9px] tracking-[0.3em] text-gold">ADMIN</p>
        </div>
        <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close admin menu"
        className="ml-auto p-1 text-cream/60 lg:hidden">
        
          <XIcon width={18} height={18} />
        </button>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-5">
        {navGroups.map((group) =>
      <div key={group.heading} className="mb-6">
            <p className="label-luxe px-2 text-cream/35">{group.heading}</p>
            <ul className="mt-2 space-y-0.5">
              {group.items.map((item) =>
          <li key={item.to}>
                  <NavLink
              to={item.to}
              onClick={() => setOpen(false)}
              end={item.to === '/admin'}
              className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-sm px-2.5 py-2.5 text-sm transition-colors duration-200',
                isActive ?
                'bg-cream/10 text-cream' :
                'text-cream/60 hover:bg-cream/5 hover:text-cream'
              )
              }>
              
                    <item.icon width={16} height={16} className="shrink-0 text-gold/80" />
                    {item.label}
                  </NavLink>
                </li>
          )}
            </ul>
          </div>
      )}
      </nav>

      <div className="border-t border-cream/10 px-5 py-4">
        <Link
        to="/"
        className="flex items-center gap-2 text-xs text-cream/55 transition-colors duration-200 hover:text-gold">
        
          <ExternalLinkIcon width={13} height={13} />
          View storefront
        </Link>
      </div>
    </div>;


  return (
    <div className="flex min-h-screen w-full bg-cream">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">{sidebar}</div>
      </aside>

      {open &&
      <div className="fixed inset-0 z-50 lg:hidden">
          <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-ink/60" />
        
          <div className="relative h-full w-72">{sidebar}</div>
        </div>
      }

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-ink/10 bg-cream/95 px-5 py-3.5 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
            className="-ml-1 p-2 text-ink lg:hidden">
            
            <MenuIcon width={20} height={20} />
          </button>
          <p className="label-luxe text-ink/50">Store Administration</p>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-ink/55 sm:block">{brand.email}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-chestnut-deep text-xs font-medium text-cream">
              DL
            </span>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>);

}