import { prisma } from '@/lib/db/prisma';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
import { BillNotFoundError, BillNotOpenForClosingError } from '@/lib/errors/billErrors';

export async function closeBill({
  billId,
  currentUserId,
}: {
  billId: string;
  currentUserId: string;
}): Promise<void> {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

  const isOpen = bill.status === 'open';

  if (!isOpen) throw new BillNotOpenForClosingError();

  await prisma.bill.update({ where: { id: billId }, data: { status: 'closed' } });
}