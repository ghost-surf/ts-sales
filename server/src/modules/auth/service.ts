import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import {
  generateRefreshTokenValue,
  hashRefreshToken,
  refreshTokenExpiry,
  signAccessToken,
} from "../../lib/jwt";
import { ConflictError, UnauthorizedError } from "../../utils/errors";

interface Credentials {
  email: string;
  password: string;
}

async function issueTokens(userId: string, role: "admin" | "operador") {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = generateRefreshTokenValue();
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshTokenExpiry(),
    },
  });
  return { accessToken, refreshToken };
}

function toPublicUser(user: { id: string; name: string; email: string; role: string; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function register(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError("Já existe um utilizador com este email");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "operador" },
  });

  const tokens = await issueTokens(user.id, user.role);
  return { user: toPublicUser(user), ...tokens };
}

export async function login({ email, password }: Credentials) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError("Email ou palavra-passe incorretos");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError("Email ou palavra-passe incorretos");

  const tokens = await issueTokens(user.id, user.role);
  return { user: toPublicUser(user), ...tokens };
}

export async function refresh(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Sessão expirada, faça login novamente");
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) throw new UnauthorizedError();

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokens(user.id, user.role);
  return { user: toPublicUser(user), ...tokens };
}

export async function logout(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new UnauthorizedError();
  return toPublicUser(user);
}
