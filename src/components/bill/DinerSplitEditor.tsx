'use client';

import { useState } from 'react';
import type { ApiBillItem, ApiBillParticipant, ApiBillDetail } from '@/types/api';
import { useCreateParticipant } from '@/hooks/useCreateParticipant';
import { useDeleteParticipant } from '@/hooks/useDeleteParticipant';
import { useItemClaim } from '@/hooks/useItemClaim';
import { useCloseBill } from '@/hooks/useCloseBill';
import { centsToDisplayValue } from '@/utils/currency';
import { BillSummaryPanel } from '@/components/bill/BillSummaryPanel';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const DEFAULT_SPLIT_COUNT = 1;

export function DinerSplitEditor({
  billId,
  billStatus,
  items,
  participants,
  onChanged,
}: {
  billId: string;
  billStatus: ApiBillDetail['status'];
  items: ApiBillItem[];
  participants: ApiBillParticipant[];
  onChanged: () => void;
}) {
  const [newDinerName, setNewDinerName] = useState('');
  const [isSummaryVisible, setIsSummaryVisible] = useState(true);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  const { createParticipant, isSubmitting: isCreatingDiner, errorCode: createDinerErrorCode } = useCreateParticipant({ billId });
  const { deleteParticipant } = useDeleteParticipant({ billId });
  const { claimItem, unclaimItem, isSubmitting: isTogglingClaim } = useItemClaim({ billId });
  const { closeBill, isClosing } = useCloseBill({ billId });

  const isOpen = billStatus === 'open';
  const isClosed = billStatus === 'closed';
  const hasNoDiners = participants.length === 0;

  async function handleAddDiner(event: React.FormEvent) {
    event.preventDefault();

    const trimmedName = newDinerName.trim();

    if (!trimmedName) return;

    const createdDiner = await createParticipant({ displayName: trimmedName });

    if (!createdDiner) return;

    setNewDinerName('');
    onChanged();
  }

  async function handleRemoveDiner({ participantId }: { participantId: string }) {
    const hasSucceeded = await deleteParticipant({ participantId });

    if (hasSucceeded) onChanged();
  }

  function isItemClaimedByParticipant({ item, participantId }: { item: ApiBillItem; participantId: string }): boolean {
    return item.claims.some((claim) => claim.participantId === participantId);
  }

  async function toggleClaim({ item, participantId }: { item: ApiBillItem; participantId: string }) {
    const isCurrentlyClaimed = isItemClaimedByParticipant({ item, participantId });

    const hasSucceeded = isCurrentlyClaimed
      ? await unclaimItem({ billItemId: item.id, participantId })
      : await claimItem({ billItemId: item.id, participantId, splitCount: DEFAULT_SPLIT_COUNT });

    if (hasSucceeded) onChanged();
  }

  async function handleConfirmCloseBill() {
    const hasSucceeded = await closeBill();

    setIsCloseDialogOpen(false);

    if (hasSucceeded) onChanged();
  }

  return (
    <div>
      <h1 className="font-display text-2xl tracking-wide mb-4">Quem comeu o quê</h1>

      {isClosed && (
        <p className="mb-4 text-sm font-body text-ink-muted border border-paper-line px-3 py-2">
          Essa conta já foi fechada.
        </p>
      )}

      {isOpen && (
        <>
          <form onSubmit={handleAddDiner} className="flex gap-2 mb-6">
            <input
              value={newDinerName}
              onChange={(event) => setNewDinerName(event.target.value)}
              placeholder="Nome da pessoa"
              className="flex-1 bg-transparent border-b border-paper-line py-2 font-body text-sm focus:outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={isCreatingDiner || !newDinerName.trim()}
              className="bg-ink text-paper font-body text-sm px-4 disabled:opacity-60"
            >
              Adicionar
            </button>
          </form>

          {createDinerErrorCode === 'display_name_already_in_use' && (
            <p className="text-sm font-body text-stamp -mt-4 mb-4">Já existe uma pessoa com esse nome.</p>
          )}
        </>
      )}

      {hasNoDiners && isOpen && (
        <p className="font-body text-sm text-ink-muted mb-6">Adicione as pessoas que participaram dessa conta.</p>
      )}

      {!hasNoDiners && (
        <div className="mb-4 flex flex-wrap gap-2">
          {participants.map((participant) => (
            <span key={participant.id} className="flex items-center gap-1.5 border border-paper-line px-2.5 py-1 text-sm font-body">
              {participant.displayName}
              {isOpen && (
                <button
                  onClick={() => handleRemoveDiner({ participantId: participant.id })}
                  className="text-ink-muted hover:text-stamp"
                  aria-label={`Remover ${participant.displayName}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {!hasNoDiners && (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border-b border-dashed border-paper-line pb-3">
              <div className="flex items-baseline justify-between">
                <span className="font-body text-sm">{item.description}</span>
                <span className="font-money text-sm tabular-nums text-ink-muted">
                  R$ {centsToDisplayValue({ amountInCents: item.priceInCents * item.quantity })}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {participants.map((participant) => {
                  const isSelected = isItemClaimedByParticipant({ item, participantId: participant.id });

                  return (
                    <button
                      key={participant.id}
                      onClick={() => toggleClaim({ item, participantId: participant.id })}
                      disabled={isTogglingClaim || !isOpen}
                      className={`text-xs font-body px-2.5 py-1 border transition-colors ${
                        isSelected ? 'bg-confirmed text-paper border-confirmed' : 'border-paper-line text-ink-muted hover:border-ink'
                      }`}
                    >
                      {participant.displayName}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsSummaryVisible((current) => !current)}
        className="mt-6 w-full border border-ink text-ink font-body text-sm py-2.5 hover:bg-ink hover:text-paper transition-colors"
      >
        {isSummaryVisible ? 'Ocultar resumo' : 'Ver resumo'}
      </button>

      {isSummaryVisible && <BillSummaryPanel billId={billId} />}

      {isOpen && (
        <button
          onClick={() => setIsCloseDialogOpen(true)}
          disabled={hasNoDiners}
          className="mt-4 w-full bg-stamp hover:bg-stamp-dark text-paper font-body font-medium py-2.5 transition-colors disabled:opacity-60"
        >
          Fechar conta
        </button>
      )}

      <ConfirmDialog
        isOpen={isCloseDialogOpen}
        title="Fechar conta"
        description="Depois de fechada, não é mais possível adicionar pessoas ou alterar quem pegou cada item. Quer continuar?"
        confirmLabel="Fechar conta"
        confirmingLabel="Fechando..."
        isConfirming={isClosing}
        onConfirm={handleConfirmCloseBill}
        onCancel={() => setIsCloseDialogOpen(false)}
      />
    </div>
  );
}