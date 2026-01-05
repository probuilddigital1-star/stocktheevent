import type { GuestCount } from '../lib/types';

export const guestCounts: GuestCount[] = [
  { value: 10, label: '10 guests', tier: 'small' },
  { value: 20, label: '20 guests', tier: 'small' },
  { value: 25, label: '25 guests', tier: 'small' },
  { value: 30, label: '30 guests', tier: 'small' },
  { value: 40, label: '40 guests', tier: 'medium' },
  { value: 50, label: '50 guests', tier: 'medium' },
  { value: 75, label: '75 guests', tier: 'medium' },
  { value: 100, label: '100 guests', tier: 'large' },
  { value: 150, label: '150 guests', tier: 'large' },
  { value: 200, label: '200 guests', tier: 'xlarge' },
  { value: 250, label: '250 guests', tier: 'xlarge' },
  { value: 300, label: '300 guests', tier: 'xlarge' },
];

export const getGuestCountByValue = (value: number): GuestCount | undefined => {
  return guestCounts.find(gc => gc.value === value);
};
