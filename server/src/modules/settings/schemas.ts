import { z } from "zod";

export const updateSettingsSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  address: z.string().max(500).optional().nullable(),
  email: z.string().email("Email inválido").optional().or(z.literal("")).nullable(),
  nuit: z.string().max(50).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  website: z.string().max(200).optional().nullable(),
  // Data URI (base64) or external URL — capped well above a reasonably sized logo image.
  logo: z.string().max(5_000_000, "Imagem demasiado grande").optional().nullable(),
  bankName: z.string().max(200).optional().nullable(),
  bankAccountHolder: z.string().max(200).optional().nullable(),
  bankIban: z.string().max(100).optional().nullable(),
  notificationEmail: z.string().email("Email inválido").optional().or(z.literal("")).nullable(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
