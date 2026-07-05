import { z } from "zod";

export const dateRangeQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const topClientsQuerySchema = dateRangeQuerySchema.extend({
  limit: z.coerce.number().int().positive().max(100).default(10),
});
