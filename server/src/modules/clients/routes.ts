import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/auth";

export const clientsRouter = Router();

clientsRouter.use(requireAuth);

clientsRouter.get("/", asyncHandler(controller.list));
clientsRouter.get("/:id", asyncHandler(controller.get));
clientsRouter.post("/", asyncHandler(controller.create));
clientsRouter.patch("/:id", asyncHandler(controller.update));
clientsRouter.delete("/:id", asyncHandler(controller.remove));
