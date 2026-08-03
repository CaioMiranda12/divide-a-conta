import { prisma } from '@/lib/db/prisma';
import { BillNotFoundError } from '@/lib/errors/billErrors';
import type { BillWithOwnership } from '@/types/bill';

export async function getBillById({
  billId,
  currentUserId,
}: {
  billId: string;
  currentUserId: string;
}): Promise<{ bill: BillWithOwnership; items: Awaited<ReturnType<typeof prisma.billItem.findMany>> }> {
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: { items: true },
  });

  if (!bill) throw new BillNotFoundError();

  return {
    bill: { ...bill, isOwner: bill.userId === currentUserId },
    items: bill.items,
  };
}