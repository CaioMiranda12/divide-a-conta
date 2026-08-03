import type { BillStatus } from '@/generated/prisma/client';

export type BillWithOwnership = {
  id: string;
  userId: string;
  imageUrl: string;
  restaurantName: string | null;
  totalAmountInCents: number;
  serviceFeePercent: number;
  status: BillStatus;
  createdAt: Date;
  isOwner: boolean;
};

export type BillListItem = {
  id: string;
  restaurantName: string | null;
  status: BillStatus;
  createdAt: Date;
};