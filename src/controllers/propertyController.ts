import type { Request, Response } from "express";
import { logError } from "../elasticSearchClient";
import * as propertyService from "../services/propertyService";
import type {
	CreatePropertyRequest,
	CustomRequest,
	GetEarningsByPropertyParams,
	GetPropertiesQueryParams,
} from "../utils/types";

export async function createProperty(req: CustomRequest, res: Response) {
	try {
		const body: CreatePropertyRequest = {
			...req.body,
			imageRoutes: req.newImageRoutes as string[],
			ownerEmail: req.email,
		};
		await propertyService.createProperty(body);
		return res.status(201).send({ message: "Property created successfully" });
	} catch (error: any) {
		logError(error);
		return res.status(400).send({ error: error.message });
	}
}

export async function getProperties(req: Request, res: Response) {
	try {
		const queryParams: GetPropertiesQueryParams = req.query;
		const properties = await propertyService.getProperties(queryParams);
		return res.status(200).send(properties);
	} catch (error: any) {
		logError(error);
		return res.status(400).send({ error: error.message });
	}
}

export async function getPropertyById(req: Request, res: Response) {
	try {
		const data: GetEarningsByPropertyParams = {
			id: req.params.id,
			fromDate: new Date(req.query.fromDate as string),
			toDate: new Date(req.query.toDate as string),
		};
		const property = await propertyService.getEarningsByProperty(data);
		return res.status(200).send(property);
	} catch (error: any) {
		return res.status(400).send({ error: error.message });
	}
}
