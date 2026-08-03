'use client';

import type { EditableBillItem } from '@/types/billEditor';
import { centsToDisplayValue, displayValueToCents } from '@/utils/currency';

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
    <div>
      <input
        value={item.description}
        onChange={(event) => onFieldChange('description', event.target.value)}
        onBlur={onBlur}
        disabled={!isEditable}
        placeholder="Descrição"
      />

      <input
        value={centsToDisplayValue({ amountInCents: item.priceInCents })}
        onChange={(event) =>
          onFieldChange('priceInCents', displayValueToCents({ displayValue: event.target.value }))
        }
        onBlur={onBlur}
        disabled={!isEditable}
        placeholder="Preço"
      />

      <input
        type="number"
        min={1}
        value={item.quantity}
        onChange={(event) => onFieldChange('quantity', Number(event.target.value))}
        onBlur={onBlur}
        disabled={!isEditable}
      />

      {isEditable && <button onClick={onRemove}>Remover</button>}
    </div>
  );
}