import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/auth";

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);

paymentsRouter.get("/", asyncHandler(controller.list));
paymentsRouter.get("/:id", asyncHandler(controller.get));
paymentsRouter.post("/", asyncHandler(controller.create));
