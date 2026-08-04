import { prisma } from '@/lib/db/prisma';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
import { BillNotFoundError } from '@/lib/errors/billErrors';
import { ParticipantNotFoundError, ParticipantIsPayerError } from '@/lib/errors/participantErrors';

export async function deleteParticipant({
  billId,
  participantId,
  currentUserId,
}: {
  billId: string;
  participantId: string;
  currentUserId: string;
}): Promise<void> {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

  const participant = await prisma.participant.findFirst({ where: { id: participantId, billId } });

  if (!participant) throw new ParticipantNotFoundError();

  const isCurrentPayer = bill.paidByParticipantId === participantId;

  if (isCurrentPayer) throw new ParticipantIsPayerError();

  await prisma.participant.delete({ where: { id: participantId } });
}