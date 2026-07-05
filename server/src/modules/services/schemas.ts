import { z } from "zod";

export const createServiceSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.number().nonnegative(),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
