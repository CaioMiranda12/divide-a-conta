import { prisma } from '@/lib/db/prisma';
import { BillNotFoundError } from '@/lib/errors/billErrors';
import { calculateBillSummary } from '@/lib/billing/calculateBillSummary';

export async function getBillSummary({ billId }: { billId: string }) {
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: {
      items: { include: { claims: true } },
      participants: { include: { user: { select: { name: true } } } },
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
    displayName: participant.user.name,
  }));

  const { participants: participantsSummary, hasUnclaimedItems } = calculateBillSummary({
    items,
    participants,
    serviceFeePercent: bill.serviceFeePercent,
  });

  return {
    bill: {
      id: bill.id,
      restaurantName: bill.restaurantName,
      totalAmountInCents: bill.totalAmountInCents,
    },
    participants: participantsSummary,
    hasUnclaimedItems,
  };
}