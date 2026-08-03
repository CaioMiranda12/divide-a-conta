import { BillOwnershipError } from '@/lib/errors/billErrors';

export function verifyBillOwnership({
  billOwnerId,
  currentUserId,
}: {
  billOwnerId: string;
  currentUserId: string;
}): void {
  const isOwner = billOwnerId === currentUserId;

  if (!isOwner) throw new BillOwnershipError();
}