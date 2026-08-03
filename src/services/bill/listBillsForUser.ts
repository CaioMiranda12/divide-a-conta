import { prisma } from '@/lib/db/prisma';
import type { BillListItem } from '@/types/bill';

export function listBillsForUser({ userId }: { userId: string }): Promise<BillListItem[]> {
  return prisma.bill.findMany({
    where: { userId },
    select: { id: true, restaurantName: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}