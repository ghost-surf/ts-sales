import { Request, Response } from "express";
import * as service from "./service";
import { createClientSchema, updateClientSchema } from "./schemas";

export async function list(_req: Request, res: Response) {
  res.json(await service.list());
}

export async function get(req: Request, res: Response) {
  res.json(await service.get(req.params.id));
}

export async function create(req: Request, res: Response) {
  const data = createClientSchema.parse(req.body);
  res.status(201).json(await service.create(data));
}

export async function update(req: Request, res: Response) {
  const data = updateClientSchema.parse(req.body);
  res.json(await service.update(req.params.id, data));
}

export async function remove(req: Request, res: Response) {
  await service.remove(req.params.id);
  res.status(204).send();
}
