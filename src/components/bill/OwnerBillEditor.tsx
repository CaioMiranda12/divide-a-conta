'use client';

import { useState } from 'react';
import type { ApiBillDetail, ApiBillItem } from '@/types/api';
import type { EditableBillItem } from '@/types/billEditor';
import { useUpdateBillItems } from '@/hooks/useUpdateBillItems';
import { useConfirmBill } from '@/hooks/useConfirmBill';
import { BillItemRow } from '@/components/bill/BillItemRow';
import { BillSummaryPanel } from '@/components/bill/BillSummaryPanel';
import { generateTempId } from '@/utils/generateTempId';

export function OwnerBillEditor({
  bill,
  items,
  onBillChanged,
}: {
  bill: ApiBillDetail;
  items: ApiBillItem[];
  onBillChanged: () => void;
}) {
  const [restaurantName, setRestaurantName] = useState(bill.restaurantName ?? '');
  const [totalAmountInCents, setTotalAmountInCents] = useState(bill.totalAmountInCents);
  const [serviceFeePercent, setServiceFeePercent] = useState(bill.serviceFeePercent);
  const [editableItems, setEditableItems] = useState<EditableBillItem[]>(items);

  const { updateBillItems, isSubmitting } = useUpdateBillItems({ billId: bill.id });
  const { confirmBill, isConfirming } = useConfirmBill({ billId: bill.id });

  const isDraft = bill.status === 'draft';
  const canEditItems = bill.status === 'draft' || bill.status === 'open';

  async function persistChanges({
    nextItems,
    nextRestaurantName,
    nextTotalAmountInCents,
    nextServiceFeePercent,
  }: {
    nextItems: EditableBillItem[];
    nextRestaurantName: string;
    nextTotalAmountInCents: number;
    nextServiceFeePercent: number;
  }) {
    const savedItems = await updateBillItems({
      restaurantName: nextRestaurantName || null,
      totalAmountInCents: nextTotalAmountInCents,
      serviceFeePercent: nextServiceFeePercent,
      items: nextItems.map((item) => ({
        description: item.description,
        priceInCents: item.priceInCents,
        quantity: item.quantity,
      })),
    });

    const hasSucceeded = Boolean(savedItems);

    if (hasSucceeded) onBillChanged();
  }

  function updateItemField({
    itemId,
    field,
    value,
  }: {
    itemId: string;
    field: 'description' | 'priceInCents' | 'quantity';
    value: string | number;
  }) {
    setEditableItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    );
  }

  function handleItemBlur({ itemId }: { itemId: string }) {
    persistChanges({
      nextItems: editableItems,
      nextRestaurantName: restaurantName,
      nextTotalAmountInCents: totalAmountInCents,
      nextServiceFeePercent: serviceFeePercent,
    });
  }

  function addItem() {
    const newItem: EditableBillItem = {
      id: generateTempId(),
      description: '',
      priceInCents: 0,
      quantity: 1,
    };

    const nextItems = [...editableItems, newItem];

    setEditableItems(nextItems);
  }

  function removeItem({ itemId }: { itemId: string }) {
    const nextItems = editableItems.filter((item) => item.id !== itemId);

    setEditableItems(nextItems);
    persistChanges({
      nextItems,
      nextRestaurantName: restaurantName,
      nextTotalAmountInCents: totalAmountInCents,
      nextServiceFeePercent: serviceFeePercent,
    });
  }

  function handleHeaderFieldBlur() {
    persistChanges({
      nextItems: editableItems,
      nextRestaurantName: restaurantName,
      nextTotalAmountInCents: totalAmountInCents,
      nextServiceFeePercent: serviceFeePercent,
    });
  }

  return (
    <div>
      <input
        value={restaurantName}
        onChange={(event) => setRestaurantName(event.target.value)}
        onBlur={handleHeaderFieldBlur}
        placeholder="Nome do restaurante"
        disabled={!canEditItems}
      />

      {editableItems.map((item) => (
        <BillItemRow
          key={item.id}
          item={item}
          isEditable={canEditItems}
          onFieldChange={(field, value) => updateItemField({ itemId: item.id, field, value })}
          onBlur={() => handleItemBlur({ itemId: item.id })}
          onRemove={() => removeItem({ itemId: item.id })}
        />
      ))}

      {canEditItems && <button onClick={addItem}>Adicionar item</button>}

      <label>
        Taxa de serviço (%)
        <input
          type="number"
          value={serviceFeePercent}
          onChange={(event) => setServiceFeePercent(Number(event.target.value))}
          onBlur={handleHeaderFieldBlur}
          disabled={!canEditItems}
        />
      </label>

      {isSubmitting && <span>Salvando...</span>}

      {isDraft && (
        <button onClick={() => confirmBill().then((hasSucceeded) => hasSucceeded && onBillChanged())} disabled={isConfirming}>
          Confirmar e abrir conta
        </button>
      )}

      {bill.status === 'open' && <BillSummaryPanel billId={bill.id} />}
    </div>
  );
}