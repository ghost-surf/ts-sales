import { z } from "zod";

export const createCategorySchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    type: z.enum(["product", "service"]),
    unit: z.enum(["metros", "pcs", "kg", "litros"]).optional().nullable(),
  })
  .transform((data) => ({ ...data, unit: data.type === "service" ? null : data.unit }))
  .refine((data) => data.type !== "product" || !!data.unit, {
    message: "Unidade de medida é obrigatória para categorias de produtos",
    path: ["unit"],
  });

export const updateCategorySchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório").optional(),
    type: z.enum(["product", "service"]).optional(),
    unit: z.enum(["metros", "pcs", "kg", "litros"]).optional().nullable(),
  })
  .transform((data) => (data.type === "service" ? { ...data, unit: null } : data))
  .refine((data) => data.type !== "product" || data.unit === undefined || !!data.unit, {
    message: "Unidade de medida é obrigatória para categorias de produtos",
    path: ["unit"],
  });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
