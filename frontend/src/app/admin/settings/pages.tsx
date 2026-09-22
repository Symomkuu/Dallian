import React from 'react';
import { brand } from '../../data/brand';
import { useStore } from '../../contexts/StoreContext';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { SelectField } from '../../components/ui/SelectField';

export function AdminSettings() {
  const { pushToast } = useStore();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        body="Store details, contact channels and the notifications customers receive." />
      

      <form
        className="grid gap-5 xl:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          pushToast({ title: 'Settings saved.', tone: 'success' });
        }}>
        
        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Store details</h2>
          <div className="mt-6 space-y-4">
            <TextField label="Business Name" defaultValue={brand.name} />
            <TextField label="Tagline" defaultValue={brand.tagline} />
            <TextField label="Announcement Bar" defaultValue={brand.announcement} />
            <TextField label="Address Line 1" defaultValue={brand.addressLine1} />
            <TextField label="Address Line 2" defaultValue={brand.addressLine2} />
          </div>
        </section>

        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Contact</h2>
          <div className="mt-6 space-y-4">
            <TextField label="Phone Number" defaultValue={brand.phone} />
            <TextField label="WhatsApp Number" defaultValue={brand.phone} />
            <TextField label="Email" type="email" defaultValue={brand.email} />
            <TextField label="Google Maps Embed URL" placeholder="Paste the embed URL for the store location" />
          </div>
        </section>

        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Store hours</h2>
          <div className="mt-6 space-y-4">
            {brand.hours.map((entry) =>
            <TextField key={entry.day} label={entry.day} defaultValue={entry.time} />
            )}
          </div>
        </section>

        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Notifications & currency</h2>
          <div className="mt-6 space-y-4">
            <SelectField
              label="Currency"
              defaultValue="KES"
              options={[
              { value: 'KES', label: 'Kenyan Shilling (KSh)' },
              { value: 'USD', label: 'US Dollar ($)' }]
              } />
            
            <SelectField
              label="Order Confirmation Channel"
              defaultValue="both"
              options={[
              { value: 'both', label: 'SMS and Email' },
              { value: 'sms', label: 'SMS only' },
              { value: 'email', label: 'Email only' }]
              } />
            
            <SelectField
              label="Low Stock Alert Threshold"
              defaultValue="5"
              options={[
              { value: '3', label: '3 units' },
              { value: '5', label: '5 units' },
              { value: '10', label: '10 units' }]
              } />
            
            <SelectField
              label="Guest Checkout"
              defaultValue="enabled"
              options={[
              { value: 'enabled', label: 'Enabled' },
              { value: 'disabled', label: 'Disabled' }]
              } />
            
          </div>
        </section>

        <div className="xl:col-span-2">
          <Button type="submit" size="lg">
            Save Settings
          </Button>
        </div>
      </form>
    </>);

}