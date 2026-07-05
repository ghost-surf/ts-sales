import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Dados inválidos",
      issues: err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Recurso não encontrado" });
    }
    if (err.code === "P2003") {
      return res.status(409).json({ error: "Este registo está a ser usado por outros dados e não pode ser removido/alterado" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Já existe um registo com esse valor único" });
    }
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor" });
}
