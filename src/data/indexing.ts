export const INDEXABLE_GUEST_COUNTS = [25, 50, 75, 100, 150, 200];

export function isIndexable(guestCount: number): boolean {
  return INDEXABLE_GUEST_COUNTS.includes(guestCount);
}
