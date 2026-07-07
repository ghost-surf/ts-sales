import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";

export const stockMovementsRouter = Router();

stockMovementsRouter.use(requireAuth, requireRole("admin"));

stockMovementsRouter.get("/", asyncHandler(controller.list));
