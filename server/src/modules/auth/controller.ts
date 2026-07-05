import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./schemas";
import * as authService from "./service";
import { UnauthorizedError } from "../../utils/errors";
import { env } from "../../lib/env";

const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: env.jwtRefreshExpiresInDays * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

export async function register(req: Request, res: Response) {
  const { name, email, password } = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.register(name, email, password);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user, accessToken });
}

export async function login(req: Request, res: Response) {
  const credentials = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.login(credentials);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new UnauthorizedError("Sessão não encontrada");

  const { user, accessToken, refreshToken } = await authService.refresh(token);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) await authService.logout(token);
  clearRefreshCookie(res);
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await authService.me(req.user!.id);
  res.json({ user });
}
