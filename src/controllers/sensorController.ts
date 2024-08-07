import type { Request, Response } from "express";
import { logError } from "../elasticSearchClient";
import * as sensorService from "../services/sensorService";
import type { AssignSensorRequest, CreateSensorRequest } from "../utils/types";

export async function createSensor(req: Request, res: Response) {
	try {
		const body: CreateSensorRequest = req.body;
		await sensorService.createSensor(body);
		return res.status(201).send({ message: "Sensor created successfully" });
	} catch (error: any) {
		logError(error);
		return res.status(400).send({ error: error.message });
	}
}

export async function assignSensor(req: Request, res: Response) {
	try {
		const body: AssignSensorRequest = {
			sensorId: req.params.id,
			propertyId: req.body.propertyId,
		};
		await sensorService.assignSensor(body);
		return res.status(200).send({ message: "Sensor assigned successfully" });
	} catch (error: any) {
		logError(error);
		return res.status(400).send({ error: error.message });
	}
}

export async function getPropertiesSensors(req: Request, res: Response) {
	try {
		const id: string = req.params.id as string;
		const sensors = await sensorService.getPropertiesSensors(id);
		return res.status(200).send(sensors);
	} catch (error: any) {
		return res.status(400).send({ error: error.message });
	}
}
