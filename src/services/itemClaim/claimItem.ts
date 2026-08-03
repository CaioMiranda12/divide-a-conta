import { prisma } from '@/lib/db/prisma';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
import { BillNotFoundError } from '@/lib/errors/billErrors';
import { BillItemNotFoundError } from '@/lib/errors/itemClaimErrors';
import { ParticipantNotFoundError } from '@/lib/errors/participantErrors';

export async function claimItem({
  billId,
  billItemId,
  participantId,
  splitCount,
  currentUserId,
}: {
  billId: string;
  billItemId: string;
  participantId: string;
  splitCount: number;
  currentUserId: string;
}): Promise<void> {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

  const billItem = await prisma.billItem.findFirst({ where: { id: billItemId, billId } });

  if (!billItem) throw new BillItemNotFoundError();

  const participant = await prisma.participant.findFirst({ where: { id: participantId, billId } });

  if (!participant) throw new ParticipantNotFoundError();

  await prisma.itemClaim.upsert({
    where: { billItemId_participantId: { billItemId, participantId } },
    create: { billItemId, participantId, splitCount },
    update: { splitCount },
  });
}