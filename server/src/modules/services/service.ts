import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../utils/errors";
import { CreateServiceInput, UpdateServiceInput } from "./schemas";

const include = { category: true } as const;

export function list() {
  return prisma.service.findMany({ include, orderBy: { name: "asc" } });
}

export async function get(id: string) {
  const service = await prisma.service.findUnique({ where: { id }, include });
  if (!service) throw new NotFoundError("Serviço não encontrado");
  return service;
}

export function create(data: CreateServiceInput) {
  return prisma.service.create({ data, include });
}

export async function update(id: string, data: UpdateServiceInput) {
  await get(id);
  return prisma.service.update({ where: { id }, data, include });
}

export async function remove(id: string) {
  await get(id);
  await prisma.service.delete({ where: { id } });
}
