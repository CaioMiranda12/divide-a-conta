import { prisma } from '@/lib/db/prisma';
import { BillNotFoundError } from '@/lib/errors/billErrors';
import { calculateBillSummary } from '@/lib/billing/calculateBillSummary';

export async function getBillSummary({ billId }: { billId: string }) {
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: {
      items: { include: { claims: true } },
      participants: true,
    },
  });

  if (!bill) throw new BillNotFoundError();

  const items = bill.items.map((item) => ({
    billItemId: item.id,
    description: item.description,
    priceInCents: item.priceInCents,
    quantity: item.quantity,
    claims: item.claims.map((claim) => ({
      participantId: claim.participantId,
      splitCount: claim.splitCount,
    })),
  }));

  const participants = bill.participants.map((participant) => ({
    id: participant.id,
    displayName: participant.displayName,
  }));

  const { participants: participantsSummary, hasUnclaimedItems } = calculateBillSummary({
    items,
    participants,
    serviceFeePercent: bill.serviceFeePercent,
  });

  const payerParticipant = bill.participants.find((participant) => participant.id === bill.paidByParticipantId);

  const paidParticipantIds = new Set(bill.participants.filter((participant) => participant.hasPaid).map((p) => p.id));

  const itemsForRecalculation = bill.items.map((item) => ({
    billItemId: item.id,
    description: item.description,
    priceInCents: item.priceInCents,
    quantity: item.quantity,
    claims: item.claims
      .filter((claim) => !paidParticipantIds.has(claim.participantId))
      .map((claim) => ({ participantId: claim.participantId, splitCount: claim.splitCount })),
  }));

  const participantsForRecalculation = bill.participants
    .filter((participant) => !participant.hasPaid)
    .map((participant) => ({ id: participant.id, displayName: participant.displayName }));

  const { participants: recalculatedSummary } = calculateBillSummary({
    items: itemsForRecalculation,
    participants: participantsForRecalculation,
    serviceFeePercent: bill.serviceFeePercent,
  });

  const debts = payerParticipant
    ? bill.participants
        .filter((participant) => participant.id !== payerParticipant.id)
        .map((participant) => {
          if (participant.hasPaid) {
            const original = participantsSummary.find((entry) => entry.participantId === participant.id);

            return {
              participantId: participant.id,
              displayName: participant.displayName,
              amountOwedInCents: original?.amountInCents ?? 0,
              hasPaid: true,
            };
          }

          const recalculated = recalculatedSummary.find((entry) => entry.participantId === participant.id);

          return {
            participantId: participant.id,
            displayName: participant.displayName,
            amountOwedInCents: recalculated?.amountInCents ?? 0,
            hasPaid: false,
          };
        })
    : [];

  const totalRemainingInCents = debts
    .filter((debt) => !debt.hasPaid)
    .reduce((sum, debt) => sum + debt.amountOwedInCents, 0);

  const claimedItemsCount = bill.items.filter((item) => item.claims.length > 0).length;
  const totalItemsCount = bill.items.length;

  return {
    bill: {
      id: bill.id,
      restaurantName: bill.restaurantName,
      totalAmountInCents: bill.totalAmountInCents,
      serviceFeePercent: bill.serviceFeePercent,
    },
    participants: participantsSummary,
    hasUnclaimedItems,
    payer: payerParticipant
      ? { participantId: payerParticipant.id, displayName: payerParticipant.displayName }
      : null,
    debts,
    totalRemainingInCents,
    claimStats: { claimedItemsCount, totalItemsCount },
  };
}