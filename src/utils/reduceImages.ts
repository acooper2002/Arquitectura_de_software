import path from "path";
import type { NextFunction, Response } from "express";
import sharp from "sharp";
import { logError } from "../elasticSearchClient";
import type { CustomRequest } from "./types";

export const reduceImages = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction,
) => {
	if (!req.files) {
		return next();
	}

	const reqFiles = req.files as Express.Multer.File[];

	try {
		await Promise.all(
			reqFiles.map(async (file: Express.Multer.File) => {
				try {
					const newRouteName =
						"propertyImages/" +
						file.originalname.split(".")[0] +
						Date.now() +
						path.extname(file.originalname);
					await sharp(file.buffer).resize(200, 200).toFile(newRouteName);

					req.newImageRoutes = req.newImageRoutes
						? [...req.newImageRoutes, newRouteName]
						: [newRouteName];
				} catch (err) {
					logError(err);
					console.error(`Error processing file ${file.originalname}:`, err);
					throw new Error(`Invalid input for file ${file.originalname}`);
				}
			}),
		);

		next();
	} catch (err: any) {
		logError(err);
		console.error("Error in reduceImages middleware:", err);
		res.status(500).send(err.message);
	}
};
