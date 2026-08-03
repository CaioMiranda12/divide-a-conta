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
    <div>
      {items.map((item) => {
        const isClaimedByMe = claimedItemIds.has(item.id);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <span>{item.description}</span>
            <span> R$ {centsToDisplayValue({ amountInCents: item.priceInCents * item.quantity })}</span>

            <input
              type="number"
              min={1}
              value={getSplitCount({ itemId: item.id })}
              onChange={(event) =>
                setSplitCountByItemId((current) => ({ ...current, [item.id]: Number(event.target.value) }))
              }
              disabled={isClaimedByMe}
            />

            {isClaimedByMe ? (
              <button onClick={() => handleUnclaim({ itemId: item.id })} disabled={isSubmitting}>
                Remover minha parte
              </button>
            ) : (
              <button onClick={() => handleClaim({ itemId: item.id })} disabled={isSubmitting}>
                Eu peguei esse item
              </button>
            )}
          </motion.div>
        );
      })}

      <button onClick={() => setIsSummaryVisible(true)}>Ver resumo</button>

      {isSummaryVisible && <BillSummaryPanel billId={billId} />}
    </div>
  );
}