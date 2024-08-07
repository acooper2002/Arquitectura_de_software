import type { Request, Response } from "express";
import { logError } from "../elasticSearchClient";
import * as SubscriptionService from "../services/SubscriptionService";
import type { SubscribeToPropertyRequest } from "../utils/types";

export async function subscribeToProperty(req: Request, res: Response) {
	try {
		const body: SubscribeToPropertyRequest = req.body;
		await SubscriptionService.suscribeUserToProperty(
			body.propertyId,
			body.userId,
			body.services,
		);
		return res.status(200).send({ message: "Subscribed successfully" });
	} catch (error: any) {
		logError(error);
		return res.status(400).send({ error: error.message });
	}
}
