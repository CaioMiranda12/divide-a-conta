import { prisma } from '@/lib/db/prisma';
import { BillNotFoundError } from '@/lib/errors/billErrors';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';

export async function deleteBill({
  billId,
  currentUserId,
}: {
  billId: string;
  currentUserId: string;
}): Promise<void> {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

  await prisma.bill.delete({ where: { id: billId } });
}