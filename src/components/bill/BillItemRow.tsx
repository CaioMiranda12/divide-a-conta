'use client';

import type { EditableBillItem } from '@/types/billEditor';
import { MoneyInput } from '@/components/form/MoneyInput';

export function BillItemRow({
  item,
  isEditable,
  onFieldChange,
  onBlur,
  onRemove,
}: {
  item: EditableBillItem;
  isEditable: boolean;
  onFieldChange: (field: 'description' | 'priceInCents' | 'quantity', value: string | number) => void;
  onBlur: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-dashed border-paper-line py-2">
      <input
        value={item.description}
        onChange={(event) => onFieldChange('description', event.target.value)}
        onBlur={onBlur}
        disabled={!isEditable}
        placeholder="Descrição"
        className="flex-1 bg-transparent font-body text-sm focus:outline-none disabled:text-ink-muted"
      />

      <MoneyInput
        valueInCents={item.priceInCents}
        onChangeInCents={(amountInCents) => onFieldChange('priceInCents', amountInCents)}
        onBlur={onBlur}
        disabled={!isEditable}
        className="w-20 bg-transparent font-money text-sm text-right tabular-nums focus:outline-none disabled:text-ink-muted"
      />

      <input
        type="number"
        min={1}
        value={item.quantity}
        onChange={(event) => onFieldChange('quantity', Number(event.target.value))}
        onBlur={() => {
          const hasInvalidQuantity = item.quantity < 1;

          if (hasInvalidQuantity) onFieldChange('quantity', 1);

          onBlur();
        }}
        disabled={!isEditable}
        className="w-12 bg-transparent font-money text-sm text-right tabular-nums focus:outline-none disabled:text-ink-muted"
      />

      {isEditable && (
        <button onClick={onRemove} className="text-stamp text-sm font-body hover:text-stamp-dark shrink-0">
          remover
        </button>
      )}
    </div>
  );
}