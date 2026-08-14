'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ApiBillDetail, ApiBillItem, ApiBillParticipant } from '@/types/api';
import type { EditableBillItem } from '@/types/billEditor';
import { useUpdateBillItems } from '@/hooks/useUpdateBillItems';
import { useConfirmBill } from '@/hooks/useConfirmBill';
import { BillItemRow } from '@/components/bill/BillItemRow';
import { DinerSplitEditor } from '@/components/bill/DinerSplitEditor';
import { MoneyInput } from '@/components/form/MoneyInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { generateTempId } from '@/utils/generateTempId';
import { centsToDisplayValue } from '@/utils/currency';
import { getBillTotalMismatchInCents } from '@/utils/billValidation';

type EditorStep = 'items' | 'split';

export function OwnerBillEditor({
  bill,
  items,
  participants,
  onBillChanged,
}: {
  bill: ApiBillDetail;
  items: ApiBillItem[];
  participants: ApiBillParticipant[];
  onBillChanged: () => void;
}) {
  const [step, setStep] = useState<EditorStep>(bill.status === 'open' ? 'split' : 'items');
  const [restaurantName, setRestaurantName] = useState(bill.restaurantName ?? '');
  const [totalAmountInCents, setTotalAmountInCents] = useState(bill.totalAmountInCents);
  const [serviceFeePercent, setServiceFeePercent] = useState(bill.serviceFeePercent);
  const [editableItems, setEditableItems] = useState<EditableBillItem[]>(items);
  const [isMismatchDialogOpen, setIsMismatchDialogOpen] = useState(false);

  const { updateBillItems, isSubmitting } = useUpdateBillItems({ billId: bill.id });
  const { confirmBill, isConfirming } = useConfirmBill({ billId: bill.id });

  const isDraft = bill.status === 'draft';
  const hasNegativeServiceFee = serviceFeePercent < 0;

  const mismatchInCents = getBillTotalMismatchInCents({
    items: editableItems,
    totalAmountInCents,
  });
  const hasMismatch = mismatchInCents !== 0;

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

  function addItem() {
    setEditableItems((currentItems) => [
      ...currentItems,
      { id: generateTempId(), description: '', priceInCents: 0, quantity: 1 },
    ]);
  }

  function removeItem({ itemId }: { itemId: string }) {
    setEditableItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  }

  async function saveAndProceedToSplitStep() {
    const savedItems = await updateBillItems({
      restaurantName: restaurantName || null,
      totalAmountInCents,
      serviceFeePercent,
      items: editableItems.map((item) => ({
        description: item.description,
        priceInCents: item.priceInCents,
        quantity: item.quantity,
      })),
    });

    if (!savedItems) return;

    const shouldConfirmFirst = isDraft;

    if (shouldConfirmFirst) {
      const hasSucceeded = await confirmBill();

      if (!hasSucceeded) return;
    }

    onBillChanged();
    setStep('split');
  }

  function handleDivideBillClick() {
    if (hasNegativeServiceFee) return;

    if (hasMismatch) {
      setIsMismatchDialogOpen(true);
      return;
    }

    saveAndProceedToSplitStep();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-sm font-body text-secondary hover:text-primary">
          ← Minhas contas
        </Link>

        {step === 'split' && (
          <button onClick={() => setStep('items')} className="text-sm font-body text-secondary hover:text-primary">
            Editar itens
          </button>
        )}
      </div>

      {step === 'items' ? (
        <div className="bg-panel border border-subtle rounded-3xl p-5">
          <input
            value={restaurantName}
            onChange={(event) => setRestaurantName(event.target.value)}
            placeholder="Nome do restaurante"
            className="w-full bg-transparent font-body text-2xl font-semibold tracking-tight text-primary focus:outline-none placeholder:text-secondary"
          />

          <div className="mt-6">
            {editableItems.map((item) => (
              <BillItemRow
                key={item.id}
                item={item}
                isEditable
                onFieldChange={(field, value) => updateItemField({ itemId: item.id, field, value })}
                onRemove={() => removeItem({ itemId: item.id })}
              />
            ))}
          </div>

          <button onClick={addItem} className="mt-3 text-sm font-body text-mint hover:text-mint-mid">
            + adicionar item
          </button>

          <div className="mt-6 flex items-center justify-between font-body text-sm text-secondary border-t border-subtle pt-4">
            Taxa de serviço (%)
            <input
              type="number"
              min={0}
              value={serviceFeePercent}
              onChange={(event) => setServiceFeePercent(Number(event.target.value))}
              className={`w-16 bg-panel-raised border rounded-lg px-2 py-1 font-money text-primary text-right tabular-nums focus:outline-none ${
                hasNegativeServiceFee ? 'border-negative' : 'border-subtle focus:border-mint'
              }`}
            />
          </div>

          {hasNegativeServiceFee && (
            <p className="mt-1 text-xs font-body text-negative text-right">
              A taxa de serviço não pode ser negativa.
            </p>
          )}

          <div className="mt-3 flex items-center justify-between font-body text-sm text-secondary">
            Total da conta
            <MoneyInput
              valueInCents={totalAmountInCents}
              onChangeInCents={setTotalAmountInCents}
              className={`w-24 bg-panel-raised border rounded-lg px-2 py-1 font-money text-primary text-right tabular-nums focus:outline-none ${
                hasMismatch ? 'border-negative' : 'border-subtle focus:border-mint'
              }`}
            />
          </div>

          {hasMismatch && (
            <p className="mt-2 text-xs font-money text-negative tabular-nums text-right">
              {mismatchInCents > 0
                ? `faltam R$ ${centsToDisplayValue({ amountInCents: mismatchInCents })}`
                : `R$ ${centsToDisplayValue({ amountInCents: -mismatchInCents })} a mais`}
            </p>
          )}

          <button
            onClick={handleDivideBillClick}
            disabled={isSubmitting || isConfirming || editableItems.length === 0 || hasNegativeServiceFee}
            className="mt-8 w-full bg-mint hover:bg-mint-mid text-on-accent font-body font-semibold rounded-xl py-2.5 transition-colors disabled:opacity-60"
          >
            {isSubmitting || isConfirming ? 'Salvando...' : 'Dividir a conta →'}
          </button>

          <ConfirmDialog
            isOpen={isMismatchDialogOpen}
            title="Os valores não batem"
            description={
              mismatchInCents > 0
                ? `A soma dos itens está R$ ${centsToDisplayValue({ amountInCents: mismatchInCents })} menor que o total da conta. Corrija os valores antes de continuar.`
                : `A soma dos itens está R$ ${centsToDisplayValue({ amountInCents: -mismatchInCents })} maior que o total da conta. Corrija os valores antes de continuar.`
            }
            confirmLabel="Voltar"
            isConfirming={false}
            hideCancelButton
            onConfirm={() => setIsMismatchDialogOpen(false)}
            onCancel={() => setIsMismatchDialogOpen(false)}
          />
        </div>
      ) : (
        <DinerSplitEditor
          billId={bill.id}
          billStatus={bill.status}
          billPayerParticipantId={bill.paidByParticipantId}
          items={items}
          participants={participants}
          onChanged={onBillChanged}
        />
      )}
    </div>
  );
}