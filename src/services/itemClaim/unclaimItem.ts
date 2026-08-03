import { prisma } from '@/lib/db/prisma';
import { BillNotFoundError, BillNotOpenError } from '@/lib/errors/billErrors';
import { BillItemNotFoundError } from '@/lib/errors/itemClaimErrors';
import { ParticipantNotFoundError } from '@/lib/errors/participantErrors';

export async function unclaimItem({
  billId,
  billItemId,
  userId,
}: {
  billId: string;
  billItemId: string;
  userId: string;
}): Promise<void> {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  const isOpen = bill.status === 'open';

  if (!isOpen) throw new BillNotOpenError();

  const billItem = await prisma.billItem.findFirst({ where: { id: billItemId, billId } });

  if (!billItem) throw new BillItemNotFoundError();

  const participant = await prisma.participant.findUnique({
    where: { billId_userId: { billId, userId } },
  });

  if (!participant) throw new ParticipantNotFoundError();

  await prisma.itemClaim.deleteMany({ where: { billItemId, participantId: participant.id } });
}