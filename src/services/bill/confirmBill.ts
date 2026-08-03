import { prisma } from '@/lib/db/prisma';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
import { BillNotFoundError, BillNotInDraftError } from '@/lib/errors/billErrors';

export async function confirmBill({
  billId,
  currentUserId,
}: {
  billId: string;
  currentUserId: string;
}): Promise<void> {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

  const isDraft = bill.status === 'draft';

  if (!isDraft) throw new BillNotInDraftError();

  await prisma.bill.update({ where: { id: billId }, data: { status: 'open' } });
}