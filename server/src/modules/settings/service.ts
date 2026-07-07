import { prisma } from "../../lib/prisma";
import { UpdateSettingsInput } from "./schemas";

const SETTINGS_ID = "company";

export async function get() {
  const settings = await prisma.companySettings.findUnique({ where: { id: SETTINGS_ID } });
  if (settings) return settings;
  return prisma.companySettings.create({ data: { id: SETTINGS_ID } });
}

export async function update(data: UpdateSettingsInput) {
  await get(); // ensures the singleton row exists before updating
  return prisma.companySettings.update({ where: { id: SETTINGS_ID }, data });
}
