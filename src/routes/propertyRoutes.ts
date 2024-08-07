import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from "express";
import * as propertyController from "../controllers/propertyController";
import { requireRole } from "../utils/authorization";
import { convertQueryParamsToNumber } from "../utils/convertQueryParamsToNumber";
import { reduceImages } from "../utils/reduceImages";
import { uploadImageMemory } from "../utils/uploadImage";

const router = Router();

router.post(
	"/properties",
	requireRole(["OWNER"]), //middleware 1
	uploadImageMemory.array("image", 10), //middleware 2
	reduceImages, //middleware 3
	propertyController.createProperty,
	(error: any, req: Request, res: Response, next: NextFunction) => {
		res.status(400).send({ error: error.message });
	},
);

router.get(
	"/properties",
	requireRole(["TENANT"]),
	convertQueryParamsToNumber,
	propertyController.getProperties,
);

router.get(
	"/properties/:id",
	requireRole(["ADMIN", "OPERATOR"]),
	propertyController.getPropertyById,
);

export default router;
