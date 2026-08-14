// src/services/bill/getBillSummary.ts
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

  const debts = payerParticipant
    ? participantsSummary
        .filter((participant) => participant.participantId !== payerParticipant.id)
        .map((participant) => ({
          participantId: participant.participantId,
          displayName: participant.displayName,
          amountOwedInCents: participant.amountInCents,
        }))
    : [];

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
    claimStats: { claimedItemsCount, totalItemsCount },
  };
}