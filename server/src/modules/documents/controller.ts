import { Request, Response } from "express";
import * as service from "./service";
import { createDocumentSchema, listDocumentsQuerySchema, updateStatusSchema } from "./schemas";

export async function list(req: Request, res: Response) {
  const query = listDocumentsQuerySchema.parse(req.query);
  res.json(await service.list(query));
}

export async function get(req: Request, res: Response) {
  res.json(await service.get(req.params.id));
}

export async function create(req: Request, res: Response) {
  const data = createDocumentSchema.parse(req.body);
  res.status(201).json(await service.create(req.user!.id, data));
}

export async function updateStatus(req: Request, res: Response) {
  const data = updateStatusSchema.parse(req.body);
  res.json(await service.updateStatus(req.params.id, data));
}

export async function convertToInvoice(req: Request, res: Response) {
  res.status(201).json(await service.convertToInvoice(req.params.id, req.user!.id));
}
