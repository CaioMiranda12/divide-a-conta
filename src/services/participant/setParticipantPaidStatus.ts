import { prisma } from '@/lib/db/prisma';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
import { BillNotFoundError } from '@/lib/errors/billErrors';
import { ParticipantNotFoundError } from '@/lib/errors/participantErrors';

export async function setParticipantPaidStatus({
  billId,
  participantId,
  currentUserId,
  hasPaid,
}: {
  billId: string;
  participantId: string;
  currentUserId: string;
  hasPaid: boolean;
}): Promise<void> {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

  const participant = await prisma.participant.findFirst({ where: { id: participantId, billId } });

  if (!participant) throw new ParticipantNotFoundError();

  await prisma.participant.update({ where: { id: participantId }, data: { hasPaid } });
}