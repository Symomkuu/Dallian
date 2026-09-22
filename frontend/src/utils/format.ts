export function formatKsh(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function availabilityLabel(availability: string): string {
  if (availability === 'in-stock') return 'In Stock';
  if (availability === 'low-stock') return 'Low Stock';
  return 'Out of Stock';
}