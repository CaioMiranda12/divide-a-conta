import { prisma } from '@/lib/db/prisma';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
import { BillNotFoundError } from '@/lib/errors/billErrors';
import { calculateBillSummary } from '@/lib/billing/calculateBillSummary';
import { calculateMinimalTransfers, calculateNetBalances } from '@/lib/billing/calculateMinimalTransfers';

type CombinedParticipant = {
  displayName: string;
  totalAmountInCents: number;
  bills: { billId: string; restaurantName: string | null; amountInCents: number }[];
};

export async function getMergedBillSummary({
  billIds,
  currentUserId,
}: {
  billIds: string[];
  currentUserId: string;
}) {
  const bills = await prisma.bill.findMany({
    where: { id: { in: billIds } },
    include: { items: { include: { claims: true } }, participants: true },
  });

  const hasMissingBill = bills.length !== billIds.length;

  if (hasMissingBill) throw new BillNotFoundError();

  bills.forEach((bill) => verifyBillOwnership({ billOwnerId: bill.userId, currentUserId }));

  const combinedParticipantsByName = new Map<string, CombinedParticipant>();

  const billSummaries = bills.map((bill) => {
    const items = bill.items.map((item) => ({
      billItemId: item.id,
      description: item.description,
      priceInCents: item.priceInCents,
      quantity: item.quantity,
      claims: item.claims.map((claim) => ({ participantId: claim.participantId, splitCount: claim.splitCount })),
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

    const debts = payerParticipant
      ? participantsSummary
          .filter((participant) => participant.participantId !== payerParticipant.id)
          .map((participant) => ({
            participantId: participant.participantId,
            displayName: participant.displayName,
            amountOwedInCents: participant.amountInCents,
          }))
      : [];

    participantsSummary.forEach((participant) => {
      const billEntry = { billId: bill.id, restaurantName: bill.restaurantName, amountInCents: participant.amountInCents };
      const existing = combinedParticipantsByName.get(participant.displayName);

      if (existing) {
        existing.totalAmountInCents += participant.amountInCents;
        existing.bills.push(billEntry);
        return;
      }

      combinedParticipantsByName.set(participant.displayName, {
        displayName: participant.displayName,
        totalAmountInCents: participant.amountInCents,
        bills: [billEntry],
      });
    });

    return {
      billId: bill.id,
      restaurantName: bill.restaurantName,
      totalAmountInCents: bill.totalAmountInCents,
      hasUnclaimedItems,
      payer: payerParticipant
        ? { participantId: payerParticipant.id, displayName: payerParticipant.displayName }
        : null,
      debts,
    };
  });

  const balanceByName = calculateNetBalances({
    bills: billSummaries.map((bill) => ({ payer: bill.payer, debts: bill.debts })),
  });

  const balances = Array.from(balanceByName.entries()).map(([displayName, balanceInCents]) => ({
    displayName,
    balanceInCents,
  }));

  const minimalTransfers = calculateMinimalTransfers({ balances });

  const combinedTotalInCents = bills.reduce((sum, bill) => sum + bill.totalAmountInCents, 0);

  return {
    bills: billSummaries,
    combinedParticipants: Array.from(combinedParticipantsByName.values()).sort(
      (a, b) => b.totalAmountInCents - a.totalAmountInCents,
    ),
    combinedTotalInCents,
    balances,
    minimalTransfers,
  };
}