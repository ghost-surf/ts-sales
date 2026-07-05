import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../utils/errors";
import { CreateCategoryInput, UpdateCategoryInput } from "./schemas";

export function list() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function create(data: CreateCategoryInput) {
  return prisma.category.create({ data });
}

export async function update(id: string, data: UpdateCategoryInput) {
  await ensureExists(id);
  return prisma.category.update({ where: { id }, data });
}

export async function remove(id: string) {
  await ensureExists(id);
  await prisma.category.delete({ where: { id } });
}

async function ensureExists(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new NotFoundError("Categoria não encontrada");
  return category;
}
