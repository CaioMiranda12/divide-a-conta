export function calculateItemsSubtotalInCents({
  items,
}: {
  items: { priceInCents: number; quantity: number }[];
}): number {
  return items.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0);
}

export function getBillTotalMismatchInCents({
  items,
  totalAmountInCents,
}: {
  items: { priceInCents: number; quantity: number }[];
  totalAmountInCents: number;
}): number {
  const itemsSubtotalInCents = calculateItemsSubtotalInCents({ items });

  return totalAmountInCents - itemsSubtotalInCents;
}