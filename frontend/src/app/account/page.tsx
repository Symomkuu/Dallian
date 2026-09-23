'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClockIcon,
  CreditCardIcon,
  HeartIcon,
  LogOutIcon,
  MapPinIcon,
  PackageIcon,
  TruckIcon,
  UserIcon,
} from 'lucide-react';
import { orders as sampleOrders } from '@/data/admin';
import { products } from '@/data/products';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatDate, formatKsh } from '@/utils/format';
import { PageHeader } from '@/components/PageHeader';
import { TextField } from '@/components/ui/TextField';
import { Button, LinkButton } from '@/components/ui/Button';
import { ProductCard } from '@/components/ProductCard';

const sections = [
  { id: 'profile', label: 'My Profile', icon: UserIcon },
  { id: 'orders', label: 'My Orders', icon: PackageIcon },
  { id: 'track', label: 'Track Order', icon: TruckIcon },
  { id: 'wishlist', label: 'Wishlist', icon: HeartIcon },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPinIcon },
  { id: 'payment', label: 'Payment Information', icon: CreditCardIcon },
  { id: 'viewed', label: 'Recently Viewed', icon: ClockIcon },
] as const;

type SectionId = (typeof sections)[number]['id'];

export default function AccountPage() {
  const { user, signOut, lastOrder, wishlist, recentlyViewed, pushToast, addToCart } =
    useStore();
  const router = useRouter();
  const [active, setActive] = useState<SectionId>('profile');

  const displayName = user?.name ?? 'Guest';
  const myOrders = lastOrder
    ? [lastOrder, ...sampleOrders.slice(0, 2)]
    : sampleOrders.slice(0, 3);
  const savedProducts = products.filter((p) => wishlist.includes(p.id));
  const viewedProducts = recentlyViewed
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[number] => Boolean(p));

  const handleBuyAgain = (orderItems: typeof sampleOrders[0]['items']) => {
    console.log('Order items to re-buy:', orderItems);
    console.log('Available products:', products);

    let addedCount = 0;

    orderItems.forEach((item) => {
      const targetName = item.name.trim().toLowerCase();
      const matchedProduct = products.find(
        (p) => p.name.trim().toLowerCase() === targetName
      );

      console.log(`Matching "${item.name}" -> Found:`, matchedProduct);

      if (matchedProduct && addToCart) {
        addToCart(matchedProduct, item.quantity || 1);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      pushToast({ 
        title: 'Items added to bag', 
        body: `${addedCount} product(s) from this order have been added to your bag.`, 
        tone: 'success' 
      });
      router.push('/cart');
    } else {
      pushToast({ 
        title: 'Could not add items', 
        body: 'The products from this order could not be matched to the current catalog.', 
        tone: 'error' 
      });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="My Account"
        title={user ? `Hello, ${displayName.split(' ')[0]}` : 'My Account'}
        body={
          user
            ? 'Manage your details, follow your orders and pick up where you left off.'
            : 'You are browsing as a guest. Sign in to see your saved details and order history.'
        }
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Account' }]}
      />

      <div className="mx-auto grid max-w-page gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[260px_1fr] lg:gap-12 lg:py-14">
        <aside>
          <nav
            aria-label="Account sections"
            className="border border-ink/10 bg-white"
          >
            <ul className="divide-y divide-ink/10">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => setActive(section.id)}
                    aria-current={active === section.id}
                    className={cx(
                      'flex w-full items-center gap-3 px-5 py-4 text-left text-sm transition-colors duration-200',
                      active === section.id
                        ? 'bg-cream text-ink'
                        : 'text-ink/65 hover:bg-cream/60 hover:text-ink'
                    )}
                  >
                    <section.icon
                      width={16}
                      height={16}
                      className="text-chestnut"
                    />
                    {section.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    pushToast({ title: 'Signed out.', tone: 'info' });
                    router.push('/');
                  }}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-ink/65 transition-colors duration-200 hover:text-chestnut"
                >
                  <LogOutIcon
                    width={16}
                    height={16}
                    className="text-chestnut"
                  />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <section aria-live="polite" className="min-w-0">
          {active === 'profile' && (
            <div className="border border-ink/10 bg-white p-7">
              <h2 className="font-serif text-2xl text-ink">My Profile</h2>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Full Name"
                  defaultValue={user?.name ?? ''}
                  className="sm:col-span-2"
                />
                <TextField
                  label="Email"
                  type="email"
                  defaultValue={user?.email ?? ''}
                />
                <TextField
                  label="Phone Number"
                  defaultValue=""
                  inputMode="tel"
                />
              </div>
              <Button
                className="mt-7"
                onClick={() =>
                  pushToast({ title: 'Profile saved.', tone: 'success' })
                }
              >
                Save Changes
              </Button>
            </div>
          )}

          {active === 'orders' && (
            <div>
              <h2 className="font-serif text-2xl text-ink">My Orders</h2>
              <ul className="mt-6 space-y-4">
                {myOrders.map((order) => (
                  <li
                    key={order.id}
                    className="border border-ink/10 bg-white p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="label-luxe text-ink/50">{order.id}</p>
                        <p className="mt-2 font-serif text-xl text-ink">
                          {order.status}
                        </p>
                        <p className="mt-1 text-xs text-ink/55">
                          Placed {formatDate(order.placedAt)}
                        </p>
                      </div>
                      <p className="font-serif text-lg text-ink">
                        {formatKsh(order.total)}
                      </p>
                    </div>

                    <ul className="mt-5 flex flex-wrap gap-3">
                      {order.items.map((item, idx) => (
                        <li
                          key={item.name + (item.options || idx)}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={item.image}
                            alt=""
                            className="h-16 w-13 object-cover"
                            loading="lazy"
                          />
                          <span className="text-xs text-ink/60">
                            {item.name}
                            <span className="block text-ink/45">
                              {item.options}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex items-center gap-2.5">
                      <LinkButton href="/track" size="sm" variant="secondary">
                        Track Order
                      </LinkButton>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleBuyAgain(order.items)}
                      >
                        Buy Again
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {active === 'track' && (
            <div className="border border-ink/10 bg-white p-7">
              <h2 className="font-serif text-2xl text-ink">Track an Order</h2>
              <p className="mt-2 text-sm text-ink/60">
                Use your order number with the phone number or email on the
                order.
              </p>
              <LinkButton href="/track" className="mt-6">
                Open Order Tracking
              </LinkButton>
            </div>
          )}

          {active === 'wishlist' && (
            <div>
              <h2 className="font-serif text-2xl text-ink">Wishlist</h2>
              {savedProducts.length === 0 ? (
                <p className="mt-4 text-sm text-ink/60">
                  Nothing saved yet.{' '}
                  <Link
                    href="/shop"
                    className="text-chestnut underline underline-offset-4"
                  >
                    Browse the collection
                  </Link>
                  .
                </p>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {savedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {active === 'addresses' && (
            <div className="border border-ink/10 bg-white p-7">
              <h2 className="font-serif text-2xl text-ink">Saved Addresses</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Home', body: 'Kilimani, Nairobi' },
                  {
                    label: 'Store Collection',
                    body: 'Mountain Mall, Thika Road, Nairobi',
                  },
                ].map((address) => (
                  <li key={address.label} className="border border-ink/12 p-5">
                    <p className="label-luxe text-gold">{address.label}</p>
                    <p className="mt-2.5 text-sm text-ink/70">
                      {address.body}
                    </p>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="mt-6">
                Add Address
              </Button>
            </div>
          )}

          {active === 'payment' && (
            <div className="border border-ink/10 bg-white p-7">
              <h2 className="font-serif text-2xl text-ink">
                Payment Information
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Available payment methods are configured and shown at checkout. No card or M-Pesa details are stored on your profile.
              </p>
              <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10 text-sm text-ink/70">
                <li className="py-3.5">M-Pesa</li>
                <li className="py-3.5">Card Payment</li>
              </ul>
            </div>
          )}

          {active === 'viewed' && (
            <div>
              <h2 className="font-serif text-2xl text-ink">Recently Viewed</h2>
              {viewedProducts.length === 0 ? (
                <p className="mt-4 text-sm text-ink/60">
                  Pieces you open appear here so you can compare them easily.
                </p>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {viewedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}