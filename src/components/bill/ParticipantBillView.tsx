'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ApiBillItem } from '@/types/api';
import { useItemClaim } from '@/hooks/useItemClaim';
import { centsToDisplayValue } from '@/utils/currency';
import { BillSummaryPanel } from '@/components/bill/BillSummaryPanel';

export function ParticipantBillView({ billId, items }: { billId: string; items: ApiBillItem[] }) {
  const { claimItem, unclaimItem, isSubmitting } = useItemClaim({ billId });
  const [claimedItemIds, setClaimedItemIds] = useState<Set<string>>(new Set());
  const [splitCountByItemId, setSplitCountByItemId] = useState<Record<string, number>>({});
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);

  function getSplitCount({ itemId }: { itemId: string }): number {
    return splitCountByItemId[itemId] ?? 1;
  }

  async function handleClaim({ itemId }: { itemId: string }) {
    const hasSucceeded = await claimItem({ billItemId: itemId, splitCount: getSplitCount({ itemId }) });

    if (!hasSucceeded) return;

    setClaimedItemIds((current) => new Set(current).add(itemId));
  }

  async function handleUnclaim({ itemId }: { itemId: string }) {
    const hasSucceeded = await unclaimItem({ billItemId: itemId });

    if (!hasSucceeded) return;

    setClaimedItemIds((current) => {
      const nextSet = new Set(current);
      nextSet.delete(itemId);
      return nextSet;
    });
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="font-display text-2xl tracking-wide mb-6">Escolha o que você pediu</h1>

      <div className="space-y-3">
        {items.map((item) => {
          const isClaimedByMe = claimedItemIds.has(item.id);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`border p-3 flex items-center gap-3 ${
                isClaimedByMe ? 'border-confirmed bg-confirmed/5' : 'border-paper-line'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm truncate">{item.description}</p>
                <p className="font-money text-sm tabular-nums text-ink-muted">
                  R$ {centsToDisplayValue({ amountInCents: item.priceInCents * item.quantity })}
                </p>
              </div>

              <input
                type="number"
                min={1}
                value={getSplitCount({ itemId: item.id })}
                onChange={(event) =>
                  setSplitCountByItemId((current) => ({ ...current, [item.id]: Number(event.target.value) }))
                }
                disabled={isClaimedByMe}
                className="w-12 bg-transparent font-money text-sm text-right tabular-nums border-b border-paper-line focus:outline-none disabled:text-ink-muted"
              />

              {isClaimedByMe ? (
                <button
                  onClick={() => handleUnclaim({ itemId: item.id })}
                  disabled={isSubmitting}
                  className="shrink-0 text-sm font-body text-stamp hover:text-stamp-dark"
                >
                  remover
                </button>
              ) : (
                <button
                  onClick={() => handleClaim({ itemId: item.id })}
                  disabled={isSubmitting}
                  className="shrink-0 bg-confirmed hover:bg-confirmed/90 text-paper text-sm font-body px-3 py-1.5"
                >
                  peguei
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => setIsSummaryVisible(true)}
        className="mt-6 w-full border border-ink text-ink font-body text-sm py-2.5 hover:bg-ink hover:text-paper transition-colors"
      >
        Ver resumo
      </button>

      {isSummaryVisible && <BillSummaryPanel billId={billId} />}
    </div>
  );
}