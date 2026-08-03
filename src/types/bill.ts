import type { BillStatus } from '@/generated/prisma/client';

export type BillDetail = {
  id: string;
  userId: string;
  imageUrl: string;
  restaurantName: string | null;
  totalAmountInCents: number;
  serviceFeePercent: number;
  status: BillStatus;
  createdAt: Date;
};

export type BillItemWithClaims = {
  id: string;
  billId: string;
  description: string;
  priceInCents: number;
  quantity: number;
  claims: { participantId: string; splitCount: number }[];
};

export type BillParticipant = {
  id: string;
  displayName: string;
};

export type BillListItem = {
  id: string;
  restaurantName: string | null;
  status: BillStatus;
  createdAt: Date;
};