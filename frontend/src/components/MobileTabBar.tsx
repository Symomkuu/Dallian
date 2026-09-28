import React, { useSyncExternalStore } from 'react';
import { Link, useLocation } from '@/components/RouterCompat';
import { HeartIcon, HomeIcon, MessageCircleIcon, ShoppingBagIcon, StoreIcon } from 'lucide-react';
import { brand } from '../data/brand';
import { useStore } from '../contexts/StoreContext';
import { cx } from '../utils/format';

const emptySubscribe = () => () => {};

export function MobileTabBar() {
  const { cartCount, setCartOpen } = useStore();
  const { pathname } = useLocation();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const items = [
    { label: 'Home', to: '/home', icon: HomeIcon },
    { label: 'Shop', to: '/', icon: StoreIcon },
    { label: 'Saved', to: '/wishlist', icon: HeartIcon },
  ];

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-cream/97 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {items.map((item) => {
          const active =
            item.to === '/'
              ? pathname === '/' || pathname.startsWith('/product/') || pathname.startsWith('/category/')
              : item.to === '/home'
              ? pathname === '/home'
              : pathname === item.to || pathname.startsWith(`${item.to}/`);

          return (
            <li key={item.label} className="flex-1 relative">
              {active && (
                <span className="absolute top-0 inset-x-3 h-[2.5px] rounded-full bg-gradient-to-r from-[#D99B26] to-[#8B3A2A] shadow-xs" />
              )}
              <Link
                to={item.to}
                className={cx(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[10px] tracking-wide transition-colors duration-200',
                  active ? 'text-[#8B3A2A] font-bold' : 'text-ink/60 hover:text-ink'
                )}
              >
                <item.icon width={19} height={19} className={active ? 'stroke-[2.5]' : 'stroke-2'} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={mounted && cartCount > 0 ? `Shopping bag, ${cartCount} items` : 'Shopping bag'}
            suppressHydrationWarning
            className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium tracking-wide text-ink/75"
          >
            <div className="relative">
              <ShoppingBagIcon width={23} height={23} strokeWidth={2} />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink shadow-xs ring-2 ring-cream">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Bag</span>
          </button>
        </li>
        <li className="flex-1">
          <a
            href={`https://wa.me/${brand.phoneIntl}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-16 flex-col items-center justify-center gap-1 bg-ink text-[10px] tracking-wide text-gold">
            
            <MessageCircleIcon width={19} height={19} />
            WhatsApp
          </a>
        </li>
      </ul>
    </nav>);

}