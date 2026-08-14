'use client';

import { useEffect, useState } from 'react';
import type { ApiBillItem, ApiBillParticipant, ApiBillDetail } from '@/types/api';
import { useSaveBillSplit } from '@/hooks/useSaveBillSplit';
import { useCloseBill } from '@/hooks/useCloseBill';
import { centsToDisplayValue } from '@/utils/currency';
import { BillSummaryPanel } from '@/components/bill/BillSummaryPanel';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { generateTempId } from '@/utils/generateTempId';

const DEFAULT_SPLIT_COUNT = 1;

type LocalParticipant = { id: string; displayName: string };
type LocalClaim = { billItemId: string; participantId: string };

export function DinerSplitEditor({
  billId,
  billStatus,
  billRestaurantName,
  billPayerParticipantId,
  items,
  participants,
  onChanged,
}: {
  billId: string;
  billStatus: ApiBillDetail['status'];
  billRestaurantName: string | null;
  billPayerParticipantId: string | null;
  items: ApiBillItem[];
  participants: ApiBillParticipant[];
  onChanged: () => void;
}) {
  const [localParticipants, setLocalParticipants] = useState<LocalParticipant[]>(participants);
  const [localClaims, setLocalClaims] = useState<LocalClaim[]>(
    items.flatMap((item) => item.claims.map((claim) => ({ billItemId: item.id, participantId: claim.participantId }))),
  );
  const [localPayerId, setLocalPayerId] = useState<string | null>(billPayerParticipantId);
  const [isDirty, setIsDirty] = useState(false);

  const [newDinerName, setNewDinerName] = useState('');
  const [hasDuplicateNameError, setHasDuplicateNameError] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(true);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);

  const { saveBillSplit, isSubmitting: isSaving, errorCode: saveErrorCode } = useSaveBillSplit({ billId });
  const { closeBill, isClosing } = useCloseBill({ billId });

  useEffect(() => {
    if (isDirty) return;

    setLocalParticipants(participants);
    setLocalClaims(
      items.flatMap((item) => item.claims.map((claim) => ({ billItemId: item.id, participantId: claim.participantId }))),
    );
    setLocalPayerId(billPayerParticipantId);
  }, [participants, items, billPayerParticipantId, isDirty]);

  const isOpen = billStatus === 'open';
  const isClosed = billStatus === 'closed';
  const hasNoDiners = localParticipants.length === 0;

  function handleAddDiner(event: React.FormEvent) {
    event.preventDefault();

    const trimmedName = newDinerName.trim();

    if (!trimmedName) return;

    const isDuplicate = localParticipants.some(
      (participant) => participant.displayName.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      setHasDuplicateNameError(true);
      return;
    }

    setHasDuplicateNameError(false);
    setLocalParticipants((current) => [...current, { id: generateTempId(), displayName: trimmedName }]);
    setNewDinerName('');
    setIsDirty(true);
  }

  function handleRemoveDiner({ participantId }: { participantId: string }) {
    setLocalParticipants((current) => current.filter((participant) => participant.id !== participantId));
    setLocalClaims((current) => current.filter((claim) => claim.participantId !== participantId));
    setLocalPayerId((current) => (current === participantId ? null : current));
    setIsDirty(true);
  }

  function isItemClaimedByParticipant({ billItemId, participantId }: { billItemId: string; participantId: string }): boolean {
    return localClaims.some((claim) => claim.billItemId === billItemId && claim.participantId === participantId);
  }

  function toggleClaim({ billItemId, participantId }: { billItemId: string; participantId: string }) {
    const isCurrentlyClaimed = isItemClaimedByParticipant({ billItemId, participantId });

    setLocalClaims((current) =>
      isCurrentlyClaimed
        ? current.filter((claim) => !(claim.billItemId === billItemId && claim.participantId === participantId))
        : [...current, { billItemId, participantId }],
    );
    setIsDirty(true);
  }

  function handleTogglePayer({ participantId }: { participantId: string }) {
    setLocalPayerId((current) => (current === participantId ? null : participantId));
    setIsDirty(true);
  }

  async function handleSave() {
    const displayNameById = new Map(localParticipants.map((participant) => [participant.id, participant.displayName]));

    const hasSucceeded = await saveBillSplit({
      participants: localParticipants.map((participant) => ({ displayName: participant.displayName })),
      claims: localClaims.map((claim) => ({
        billItemId: claim.billItemId,
        participantDisplayName: displayNameById.get(claim.participantId) ?? '',
        splitCount: DEFAULT_SPLIT_COUNT,
      })),
      payerDisplayName: localPayerId ? displayNameById.get(localPayerId) ?? null : null,
    });

    if (!hasSucceeded) return;

    setIsDirty(false);
    setSummaryRefreshKey((current) => current + 1);
    onChanged();
  }

  async function handleConfirmCloseBill() {
    const hasSucceeded = await closeBill();

    setIsCloseDialogOpen(false);

    if (hasSucceeded) onChanged();
  }

  return (
    <div className="bg-panel border border-subtle rounded-3xl p-5">
      <p className="font-body text-xs uppercase tracking-widest text-secondary mb-1">
        {billRestaurantName ?? 'Conta sem nome'}
      </p>
      <h1 className="font-body text-xl font-semibold tracking-tight text-primary mb-4">Lista de Produtos</h1>

      {isClosed && (
        <p className="mb-4 text-sm font-body text-secondary border border-subtle rounded-xl px-3 py-2">
          Essa conta já foi fechada.
        </p>
      )}

      {isOpen && (
        <>
          <form onSubmit={handleAddDiner} className="flex gap-2 mb-2">
            <input
              value={newDinerName}
              onChange={(event) => {
                setNewDinerName(event.target.value);
                setHasDuplicateNameError(false);
              }}
              placeholder="Nome da pessoa"
              className="flex-1 bg-panel-raised border border-subtle rounded-lg px-3 py-2 font-body text-sm text-primary placeholder:text-secondary focus:outline-none focus:border-mint"
            />
            <button
              type="submit"
              disabled={!newDinerName.trim()}
              className="bg-mint text-on-accent font-body font-semibold text-sm rounded-lg px-4 disabled:opacity-60"
            >
              Adicionar
            </button>
          </form>

          {hasDuplicateNameError && (
            <p className="text-sm font-body text-negative mb-4">Já existe uma pessoa com esse nome.</p>
          )}
        </>
      )}

      {hasNoDiners && isOpen && (
        <p className="font-body text-sm text-secondary mb-6 mt-4">Adicione as pessoas que participaram dessa conta.</p>
      )}

      {!hasNoDiners && (
        <div className="mb-4 mt-4 flex flex-wrap gap-2">
          {localParticipants.map((participant) => (
            <span key={participant.id} className="flex items-center gap-1.5 border border-subtle rounded-full px-3 py-1 text-sm font-body text-primary">
              {participant.displayName}
              {isOpen && (
                <button
                  onClick={() => handleRemoveDiner({ participantId: participant.id })}
                  className="text-secondary hover:text-negative"
                  aria-label={`Remover ${participant.displayName}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {!hasNoDiners && isOpen && (
        <div className="mb-6">
          <p className="font-body text-xs uppercase tracking-widest text-secondary mb-2">Quem pagou a conta?</p>

          <div className="flex flex-wrap gap-2">
            {localParticipants.map((participant) => {
              const isPayer = localPayerId === participant.id;

              return (
                <button
                  key={participant.id}
                  onClick={() => handleTogglePayer({ participantId: participant.id })}
                  className={`text-xs font-body px-2.5 py-1 rounded-full border transition-colors ${
                    isPayer ? 'bg-mint text-on-accent border-mint font-semibold' : 'border-subtle text-secondary hover:border-mint/50'
                  }`}
                >
                  {participant.displayName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!hasNoDiners && (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border-b border-subtle pb-3">
              <div className="flex items-baseline justify-between">
                <span className="font-body text-sm text-primary">{item.description}</span>
                <span className="font-money text-sm tabular-nums text-secondary">
                  R$ {centsToDisplayValue({ amountInCents: item.priceInCents * item.quantity })}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {localParticipants.map((participant) => {
                  const isSelected = isItemClaimedByParticipant({ billItemId: item.id, participantId: participant.id });

                  return (
                    <button
                      key={participant.id}
                      onClick={() => toggleClaim({ billItemId: item.id, participantId: participant.id })}
                      disabled={!isOpen}
                      className={`text-xs font-body px-2.5 py-1 rounded-full border transition-colors ${
                        isSelected ? 'bg-mint-dim text-mint border-mint/50' : 'border-subtle text-secondary hover:border-mint/30'
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

      {isOpen && (
        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="mt-6 w-full bg-mint hover:bg-mint-mid text-on-accent font-body font-semibold rounded-xl py-2.5 transition-colors disabled:opacity-60"
        >
          {isSaving ? 'Salvando...' : isDirty ? 'Salvar' : 'Salvo'}
        </button>
      )}

      {saveErrorCode && (
        <p className="mt-2 text-sm font-body text-negative text-center">Não foi possível salvar. Tente novamente.</p>
      )}

      <button
        onClick={() => setIsSummaryVisible((current) => !current)}
        className="mt-4 w-full border border-subtle text-primary font-body text-sm rounded-xl py-2.5 hover:border-mint/50 transition-colors"
      >
        {isSummaryVisible ? 'Ocultar resumo' : 'Ver resumo'}
      </button>

      {isDirty && isSummaryVisible && (
        <p className="mt-2 text-xs font-body text-secondary text-center">
          O resumo abaixo reflete a última versão salva, não as alterações pendentes.
        </p>
      )}

      {isSummaryVisible && <BillSummaryPanel billId={billId} refreshKey={summaryRefreshKey} />}

      {isOpen && (
        <button
          onClick={() => setIsCloseDialogOpen(true)}
          disabled={hasNoDiners || isDirty}
          className="mt-4 w-full bg-mint hover:bg-mint-mid text-on-accent font-body font-semibold rounded-xl py-2.5 transition-colors disabled:opacity-60"
        >
          Fechar conta
        </button>
      )}

      {isOpen && isDirty && (
        <p className="mt-2 text-xs font-body text-secondary text-center">Salve as alterações antes de fechar a conta.</p>
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