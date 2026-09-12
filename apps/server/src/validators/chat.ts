import { z } from 'zod';

export const chatRequestSchema = z.object({
  question: z.string().trim().min(3).max(500)
});
