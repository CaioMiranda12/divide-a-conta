type ClaimedItem = {
  billItemId: string;
  description: string;
  priceInCents: number;
  quantity: number;
  claims: { participantId: string; splitCount: number }[];
};

type ParticipantInput = {
  id: string;
  displayName: string;
};

import { distributeCentsByLargestRemainder } from '@/lib/billing/distributeCentsByLargestRemainder';

export function calculateBillSummary({
  items,
  participants,
  serviceFeePercent,
}: {
  items: ClaimedItem[];
  participants: ParticipantInput[];
  serviceFeePercent: number;
}) {
  const subtotalByParticipantId = new Map<string, number>(participants.map((p) => [p.id, 0]));
  const itemsByParticipantId = new Map<string, { billItemId: string; description: string; amountInCents: number }[]>(
    participants.map((p) => [p.id, []]),
  );

  let hasUnclaimedItems = false;

  for (const item of items) {
    const hasNoClaims = item.claims.length === 0;

    if (hasNoClaims) {
      hasUnclaimedItems = true;
      continue;
    }

    const itemTotalInCents = item.priceInCents * item.quantity;
    const weights = item.claims.map((claim) => claim.splitCount);
    const shares = distributeCentsByLargestRemainder({ totalInCents: itemTotalInCents, weights });

    item.claims.forEach((claim, index) => {
      const shareInCents = shares[index];

      subtotalByParticipantId.set(
        claim.participantId,
        (subtotalByParticipantId.get(claim.participantId) ?? 0) + shareInCents,
      );

      itemsByParticipantId.get(claim.participantId)?.push({
        billItemId: item.billItemId,
        description: item.description,
        amountInCents: shareInCents,
      });
    });
  }

  const subtotals = participants.map((participant) => ({
    participantId: participant.id,
    displayName: participant.displayName,
    subtotalInCents: subtotalByParticipantId.get(participant.id) ?? 0,
  }));

  const totalSubtotalInCents = subtotals.reduce((sum, entry) => sum + entry.subtotalInCents, 0);
  const totalServiceFeeInCents = Math.round((totalSubtotalInCents * serviceFeePercent) / 100);
  const serviceFeeShares = distributeCentsByLargestRemainder({
    totalInCents: totalServiceFeeInCents,
    weights: subtotals.map((entry) => entry.subtotalInCents),
  });

  const participantsSummary = subtotals.map((entry, index) => ({
    participantId: entry.participantId,
    displayName: entry.displayName,
    subtotalInCents: entry.subtotalInCents,
    serviceFeeInCents: serviceFeeShares[index],
    amountInCents: entry.subtotalInCents + serviceFeeShares[index],
    items: itemsByParticipantId.get(entry.participantId) ?? [],
  }));

  return { participants: participantsSummary, hasUnclaimedItems };
}