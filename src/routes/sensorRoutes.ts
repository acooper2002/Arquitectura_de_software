import { Router } from "express";
import * as sensorController from "../controllers/sensorController";
import { requireRole } from "../utils/authorization";

const router = Router();

router.post("/sensors", requireRole(["ADMIN"]), sensorController.createSensor);
router.put(
	"/sensors/:id",
	requireRole(["ADMIN"]),
	sensorController.assignSensor,
);
router.get(
	"/properties/:id/sensors",
	requireRole(["ADMIN"]),
	sensorController.getPropertiesSensors,
);

export default router;
