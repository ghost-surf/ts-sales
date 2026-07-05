import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../utils/errors";
import { CreateTaxInput, UpdateTaxInput } from "./schemas";

export function list() {
  return prisma.tax.findMany({ orderBy: { name: "asc" } });
}

export function create(data: CreateTaxInput) {
  return prisma.tax.create({ data });
}

export async function update(id: string, data: UpdateTaxInput) {
  await ensureExists(id);
  return prisma.tax.update({ where: { id }, data });
}

export async function remove(id: string) {
  await ensureExists(id);
  await prisma.tax.delete({ where: { id } });
}

async function ensureExists(id: string) {
  const tax = await prisma.tax.findUnique({ where: { id } });
  if (!tax) throw new NotFoundError("Imposto não encontrado");
  return tax;
}
