import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ConflictError, NotFoundError } from "../../utils/errors";
import { CreateUserInput, UpdateUserInput } from "./schemas";

const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function list() {
  return prisma.user.findMany({ select: publicSelect, orderBy: { name: "asc" } });
}

export async function get(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicSelect });
  if (!user) throw new NotFoundError("Utilizador não encontrado");
  return user;
}

export async function create(data: CreateUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ConflictError("Já existe um utilizador com este email");

  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash, role: data.role },
    select: publicSelect,
  });
}

export async function update(id: string, data: UpdateUserInput) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Utilizador não encontrado");

  const { password, ...rest } = data;
  return prisma.user.update({
    where: { id },
    data: {
      ...rest,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    },
    select: publicSelect,
  });
}

export async function remove(id: string) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Utilizador não encontrado");
  await prisma.user.delete({ where: { id } });
}
