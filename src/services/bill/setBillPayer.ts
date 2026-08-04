import { prisma } from '@/lib/db/prisma';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
import { BillNotFoundError } from '@/lib/errors/billErrors';
import { ParticipantNotFoundError } from '@/lib/errors/participantErrors';

export async function setBillPayer({
  billId,
  currentUserId,
  participantId,
}: {
  billId: string;
  currentUserId: string;
  participantId: string | null;
}): Promise<void> {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

  const isClearingPayer = participantId === null;

  if (!isClearingPayer) {
    const participant = await prisma.participant.findFirst({ where: { id: participantId, billId } });

    if (!participant) throw new ParticipantNotFoundError();
  }

  await prisma.bill.update({ where: { id: billId }, data: { paidByParticipantId: participantId } });
}