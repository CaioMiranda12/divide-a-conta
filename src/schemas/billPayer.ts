import { z } from 'zod';

export const setBillPayerSchema = z.object({
  participantId: z.string().nullable(),
});