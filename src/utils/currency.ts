const CENTS_PER_CURRENCY_UNIT = 100;

export function centsToDisplayValue({ amountInCents }: { amountInCents: number }): string {
  return (amountInCents / CENTS_PER_CURRENCY_UNIT).toFixed(2).replace('.', ',');
}