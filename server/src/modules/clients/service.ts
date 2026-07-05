import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../utils/errors";
import { CreateClientInput, UpdateClientInput } from "./schemas";

export function list() {
  return prisma.client.findMany({ orderBy: { name: "asc" } });
}

export async function get(id: string) {
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw new NotFoundError("Cliente não encontrado");
  return client;
}

export function create(data: CreateClientInput) {
  return prisma.client.create({ data });
}

export async function update(id: string, data: UpdateClientInput) {
  await get(id);
  return prisma.client.update({ where: { id }, data });
}

export async function remove(id: string) {
  await get(id);
  await prisma.client.delete({ where: { id } });
}
