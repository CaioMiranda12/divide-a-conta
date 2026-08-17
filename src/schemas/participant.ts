import { z } from 'zod';

export const createParticipantSchema = z.object({
  displayName: z.string().min(1).max(100),
});

export const setParticipantPaidSchema = z.object({
  hasPaid: z.boolean(),
});