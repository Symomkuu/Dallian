import React from 'react';
import { Link, useLocation } from '@/components/RouterCompat';
import { HeartIcon, HomeIcon, MessageCircleIcon, ShoppingBagIcon, StoreIcon } from 'lucide-react';
import { brand } from '../data/brand';
import { useStore } from '../contexts/StoreContext';
import { cx } from '../utils/format';

export function MobileTabBar() {
  const { cartCount, setCartOpen } = useStore();
  const { pathname } = useLocation();

  const items = [
  { label: 'Home', to: '/home', icon: HomeIcon },
  { label: 'Shop', to: '/', icon: StoreIcon },
  { label: 'Saved', to: '/wishlist', icon: HeartIcon }];


  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-cream/97 backdrop-blur lg:hidden">
      
      <ul className="mx-auto flex max-w-md items-stretch">
        {items.map((item) => {
          const active = pathname === item.to;
          return (
            <li key={item.label} className="flex-1">
              <Link
                to={item.to}
                className={cx(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[10px] tracking-wide transition-colors duration-200',
                  active ? 'text-chestnut' : 'text-ink/60'
                )}>
                
                <item.icon width={19} height={19} />
                {item.label}
              </Link>
            </li>);

        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[10px] tracking-wide text-ink/60">
            
            <ShoppingBagIcon width={19} height={19} />
            Bag
            {cartCount > 0 &&
            <span className="absolute right-4 top-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-ink">
                {cartCount}
              </span>
            }
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