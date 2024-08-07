import { Property } from "../dataAccess/Property";
import { Sensor } from "../dataAccess/Sensor";
import { logError } from "../elasticSearchClient";
import type {
	AssignSensorRequest,
	CreateSensorRequest,
	SensorDTO,
	SensorPropertyDTO,
} from "../utils/types";
import CacheModule from "./redis";

const cache = new CacheModule();
const makeRedisKey = (key: string) => `sensorObject:${key}`;
const allSensorsKey = makeRedisKey("all");

const updateAllSensorsCache = async (): Promise<void> => {
	const sensors = await Sensor.findAll();
	await cache.set(allSensorsKey, JSON.stringify(sensors), 10);
};

export const createSensor = async (
	sensor: CreateSensorRequest,
): Promise<void> => {
	try {
		const createdSensor = await Sensor.create({
			id: sensor.id,
			description: sensor.description,
			serialNumber: sensor.serialNumber,
			brand: sensor.brand,
			direction: sensor.direction,
			date: sensor.date,
			typeOfService: sensor.typeOfService,
			observableProperty: JSON.stringify(sensor.observableProperty),
		});
		await cache.set(makeRedisKey(sensor.id), JSON.stringify(createdSensor), 35);
		await updateAllSensorsCache();
	} catch (error: any) {
		logError(error);
		throw new Error(error.message);
	}
};
export const assignSensor = async (
	body: AssignSensorRequest,
): Promise<void> => {
	try {
		const sensor = await Sensor.findByPk(body.sensorId as string);
		if (!sensor) throw new Error("Sensor not found");
		if (sensor.getDataValue("propertyId"))
			throw new Error("Sensor already assigned");
		const property = await Property.findByPk(body.propertyId);
		if (!property) throw new Error("Property not found");
		await sensor.update({ propertyId: body.propertyId });
		await cache.set(
			makeRedisKey(sensor.getDataValue("id")),
			JSON.stringify(sensor),
			35,
		);
		await updateAllSensorsCache();
	} catch (error: any) {
		logError(error);
		throw new Error(error.message);
	}
};
export const getSensor = async (id: string): Promise<SensorDTO> => {
	try {
		const sensorCache = await cache.get(makeRedisKey(id));
		if (sensorCache) {
			return JSON.parse(sensorCache);
		}
		const sensor = await Sensor.findByPk(id);
		if (!sensor) throw new Error("Sensor not found");
		await cache.set(makeRedisKey(id), JSON.stringify(sensor), 65);
		return {
			sensorId: sensor.getDataValue("id"),
			propertyId: sensor.getDataValue("propertyId"),
			typeOfService: sensor.getDataValue("typeOfService"),
			priority: sensor.getDataValue("priority"),
			observableProperty: sensor.getDataValue("observableProperty"),
		};
	} catch (error: any) {
		logError(error);
		console.error("Error while obtaining sensor", error);
		throw new Error(error.message);
	}
};
export const getSensors = async (type?: string) => {
	try {
		var sensors = [];
		const sensorsCache = await cache.get(allSensorsKey);
		if (sensorsCache) {
			sensors = JSON.parse(sensorsCache);
			if (type) {
				sensors = sensors.filter(
					(sensor: any) => sensor.typeOfService === type,
				);
			}
			return sensors;
		}
		const query: { where?: { typeOfService: string } } = {};
		if (type) {
			query.where = { typeOfService: type };
		}
		sensors = await Sensor.findAll(query);
		await cache.set(allSensorsKey, JSON.stringify(sensors), 10);
		return sensors;
	} catch (error: any) {
		logError(error);
		console.error("Error while obtaining sensors", error);
		throw new Error(error.message);
	}
};

export const getPropertiesSensors = async (
	propertyId: string,
): Promise<SensorPropertyDTO[]> => {
	try {
		const sensors = await Sensor.findAll({ where: { propertyId } });
		return sensors.map((sensor) => ({
			serialNumber: sensor.getDataValue("serialNumber"),
			description: sensor.getDataValue("description"),
			brand: sensor.getDataValue("brand"),
			direction: sensor.getDataValue("direction"),
			typeOfService: sensor.getDataValue("typeOfService"),
			priority: sensor.getDataValue("priority"),
		}));
	} catch (error: any) {
		throw new Error(error.message);
	}
};
