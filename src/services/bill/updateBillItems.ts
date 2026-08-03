// import { prisma } from '@/lib/db/prisma';
// import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
// import { BillNotFoundError, BillNotEditableError } from '@/lib/errors/billErrors';

// export async function updateBillItems({
//   billId,
//   currentUserId,
//   restaurantName,
//   totalAmountInCents,
//   serviceFeePercent,
//   items,
// }: {
//   billId: string;
//   currentUserId: string;
//   restaurantName?: string | null;
//   totalAmountInCents: number;
//   serviceFeePercent: number;
//   items: { description: string; priceInCents: number; quantity: number }[];
// }) {
//   const bill = await prisma.bill.findUnique({ where: { id: billId } });

//   if (!bill) throw new BillNotFoundError();

//   verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

//   const isDraft = bill.status === 'draft';

//   if (!isDraft) throw new BillNotEditableError();

//   await prisma.billItem.deleteMany({ where: { billId } });

//   await prisma.bill.update({
//     where: { id: billId },
//     data: { restaurantName, totalAmountInCents, serviceFeePercent, items: { create: items } },
//   });

//   return prisma.billItem.findMany({ where: { billId } });
// }

import { prisma } from '@/lib/db/prisma';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
import { BillNotFoundError, BillNotEditableError } from '@/lib/errors/billErrors';

const EDITABLE_BILL_STATUSES = ['draft', 'open'] as const;

export async function updateBillItems({
  billId,
  currentUserId,
  restaurantName,
  totalAmountInCents,
  serviceFeePercent,
  items,
}: {
  billId: string;
  currentUserId: string;
  restaurantName?: string | null;
  totalAmountInCents: number;
  serviceFeePercent: number;
  items: { description: string; priceInCents: number; quantity: number }[];
}) {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

  const isEditable = EDITABLE_BILL_STATUSES.includes(bill.status as (typeof EDITABLE_BILL_STATUSES)[number]);

  if (!isEditable) throw new BillNotEditableError();

  await prisma.billItem.deleteMany({ where: { billId } });

  await prisma.bill.update({
    where: { id: billId },
    data: { restaurantName, totalAmountInCents, serviceFeePercent, items: { create: items } },
  });

  return prisma.billItem.findMany({ where: { billId } });
}