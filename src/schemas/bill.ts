import { z } from 'zod';

const MAX_SERVICE_FEE_PERCENT = 100;

export const billItemSchema = z.object({
  description: z.string().min(1),
  priceInCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

export const updateBillSchema = z.object({
  restaurantName: z.string().min(1).max(200).nullable().optional(),
  totalAmountInCents: z.number().int().nonnegative(),
  serviceFeePercent: z.number().int().min(0).max(MAX_SERVICE_FEE_PERCENT),
  items: z.array(billItemSchema),
});