'use client';

import { centsToDisplayValue } from '@/utils/currency';

const NON_DIGIT_CHARACTERS_REGEX = /\D/g;

export function MoneyInput({
  valueInCents,
  onChangeInCents,
  onBlur,
  disabled,
  className,
}: {
  valueInCents: number;
  onChangeInCents: (amountInCents: number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(NON_DIGIT_CHARACTERS_REGEX, '');
    const hasNoDigits = digitsOnly.length === 0;

    onChangeInCents(hasNoDigits ? 0 : Number(digitsOnly));
  }

  return (
    <input
      inputMode="numeric"
      value={centsToDisplayValue({ amountInCents: valueInCents })}
      onChange={handleChange}
      onBlur={onBlur}
      disabled={disabled}
      className={className}
      placeholder="0,00"
    />
  );
}