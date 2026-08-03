import { prisma } from '@/lib/db/prisma';
import { BillNotFoundError, BillNotOpenError } from '@/lib/errors/billErrors';

export async function joinBill({ billId, userId }: { billId: string; userId: string }) {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  const isOpen = bill.status === 'open';

  if (!isOpen) throw new BillNotOpenError();

  const existingParticipant = await prisma.participant.findUnique({
    where: { billId_userId: { billId, userId } },
  });

  if (existingParticipant) return { participant: existingParticipant, wasCreated: false };

  const participant = await prisma.participant.create({ data: { billId, userId } });

  return { participant, wasCreated: true };
}