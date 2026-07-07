import { Request, Response } from "express";
import * as service from "./service";
import { createCreditNoteSchema } from "./schemas";

export async function list(_req: Request, res: Response) {
  res.json(await service.list());
}

export async function get(req: Request, res: Response) {
  res.json(await service.get(req.params.id));
}

export async function create(req: Request, res: Response) {
  const data = createCreditNoteSchema.parse(req.body);
  res.status(201).json(await service.create(req.user!.id, data));
}
