import { prisma } from '@/lib/db/prisma';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
import { BillNotFoundError } from '@/lib/errors/billErrors';
import type { BillDetail, BillItemWithClaims, BillParticipant } from '@/types/bill';

export async function getBillById({
  billId,
  currentUserId,
}: {
  billId: string;
  currentUserId: string;
}): Promise<{ bill: BillDetail; items: BillItemWithClaims[]; participants: BillParticipant[] }> {
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: { items: { include: { claims: true } }, participants: true },
  });

  if (!bill) throw new BillNotFoundError();

  verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

  return {
    bill: {
      id: bill.id,
      userId: bill.userId,
      imageUrl: bill.imageUrl,
      restaurantName: bill.restaurantName,
      totalAmountInCents: bill.totalAmountInCents,
      serviceFeePercent: bill.serviceFeePercent,
      status: bill.status,
      createdAt: bill.createdAt,
    },
    items: bill.items.map((item) => ({
      id: item.id,
      billId: item.billId,
      description: item.description,
      priceInCents: item.priceInCents,
      quantity: item.quantity,
      claims: item.claims.map((claim) => ({ participantId: claim.participantId, splitCount: claim.splitCount })),
    })),
    participants: bill.participants.map((participant) => ({ id: participant.id, displayName: participant.displayName })),
  };
}