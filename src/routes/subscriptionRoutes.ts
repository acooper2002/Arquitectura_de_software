import { NextFunction, Request, Response, Router } from "express";
import * as subscriptionController from "../controllers/subscriptionController";
import { requireRole } from "../utils/authorization";

const router = Router();

router.post("/subscriptions", subscriptionController.subscribeToProperty);

export default router;
