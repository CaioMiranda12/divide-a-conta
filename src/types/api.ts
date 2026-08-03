import type { BillStatus } from '@/generated/prisma/client';

export type ApiUser = {
  id: string;
  name: string;
  email: string;
};

export type ApiBillListItem = {
  id: string;
  restaurantName: string | null;
  status: BillStatus;
  createdAt: string;
};

export type ApiBillItem = {
  id: string;
  billId: string;
  description: string;
  priceInCents: number;
  quantity: number;
};

export type ApiBillDetail = {
  id: string;
  userId: string;
  imageUrl: string;
  restaurantName: string | null;
  totalAmountInCents: number;
  serviceFeePercent: number;
  status: BillStatus;
  createdAt: string;
  isOwner: boolean;
};

export type ApiBillSummaryParticipant = {
  participantId: string;
  displayName: string;
  amountInCents: number;
  items: { billItemId: string; description: string; amountInCents: number }[];
};

export type ApiBillSummary = {
  bill: { id: string; restaurantName: string | null; totalAmountInCents: number };
  participants: ApiBillSummaryParticipant[];
  hasUnclaimedItems: boolean;
};