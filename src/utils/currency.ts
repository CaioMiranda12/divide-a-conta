const CENTS_PER_CURRENCY_UNIT = 100;

export function centsToDisplayValue({ amountInCents }: { amountInCents: number }): string {
  return (amountInCents / CENTS_PER_CURRENCY_UNIT).toFixed(2);
}

export function displayValueToCents({ displayValue }: { displayValue: string }): number {
  const parsedValue = Number(displayValue.replace(',', '.'));
  const hasInvalidValue = Number.isNaN(parsedValue);

  if (hasInvalidValue) return 0;

  return Math.round(parsedValue * CENTS_PER_CURRENCY_UNIT);
}