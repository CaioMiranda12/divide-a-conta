import { prisma } from '@/lib/db/prisma';

export async function createManualBill({ userId }: { userId: string }): Promise<{ billId: string }> {
  const bill = await prisma.bill.create({
    data: { userId, status: 'draft' },
  });

  return { billId: bill.id };
}