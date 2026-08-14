'use client';

import type { EditableBillItem } from '@/types/billEditor';
import { MoneyInput } from '@/components/form/MoneyInput';

export function BillItemRow({
  item,
  isEditable,
  onFieldChange,
  onRemove,
}: {
  item: EditableBillItem;
  isEditable: boolean;
  onFieldChange: (field: 'description' | 'priceInCents' | 'quantity', value: string | number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-subtle py-2.5">
      <input
        value={item.description}
        onChange={(event) => onFieldChange('description', event.target.value)}
        disabled={!isEditable}
        placeholder="Descrição"
        className="flex-1 bg-transparent font-body text-sm text-primary placeholder:text-secondary focus:outline-none disabled:text-secondary"
      />

      <MoneyInput
        valueInCents={item.priceInCents}
        onChangeInCents={(amountInCents) => onFieldChange('priceInCents', amountInCents)}
        disabled={!isEditable}
        className="w-20 bg-transparent font-money text-sm text-primary text-right tabular-nums focus:outline-none disabled:text-secondary"
      />

      <input
        type="number"
        min={1}
        value={item.quantity}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          onFieldChange('quantity', nextValue < 1 ? 1 : nextValue);
        }}
        disabled={!isEditable}
        className="w-12 bg-transparent font-money text-sm text-primary text-right tabular-nums focus:outline-none disabled:text-secondary"
      />

      {isEditable && (
        <button onClick={onRemove} className="text-negative text-sm font-body hover:opacity-80 shrink-0">
          remover
        </button>
      )}
    </div>
  );
}