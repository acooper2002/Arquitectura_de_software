import { logSensorNotification } from "../elasticSearchClient";
import { addSensorNotification } from "../services/notificationService";
import type { MsgSensorNotification } from "./data-structure/Measure";
import type {
	MeasureData,
	MeasureDataComplete,
	SensorMeasure,
} from "./data-structure/Measure";
import {
	filter1,
	filter2,
	filter3,
	filter4,
	filter5,
	filter6,
} from "./filters/filters";
import { Pipeline } from "./pipeline/Pipeline";
import { RabbitMQQueueAdapter } from "./queues-providers/RabbitQueueAdapter";
require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());

const queueName = "sensor_data";
const queueFactory = (name: string) =>
	new RabbitMQQueueAdapter<MeasureData>(name, true);
const rabbitMQQueue = new RabbitMQQueueAdapter<SensorMeasure>(queueName, false);

const pipeline = new Pipeline<MeasureData>(
	[filter1, filter2, filter3, filter4, filter5, filter6],
	queueFactory,
);

pipeline.on("finalOutput", (data: MeasureDataComplete) => {
	console.log(`Correct data ${JSON.stringify(data, null, 2)}`);
	console.log("Sending notification");
	const dataToSend: MsgSensorNotification = {
		sensorId: data.sensorId,
		propertyId: data.propertyId,
		dateTime: data.dateTime,
		problem: "",
	};
	for (const key in data) {
		if (
			(data.hasOwnProperty(key) && typeof data[key] === "number") ||
			typeof data[key] === "string"
		) {
			dataToSend[key] = data[key];
			if (
				key != "sensorId" &&
				key != "dateTime" &&
				key != "priority" &&
				key != "service" &&
				key != "propertyId"
			) {
				dataToSend.problem = key;
				console.log(key);
			}
		}
	}
	logSensorNotification(dataToSend);
	addSensorNotification(dataToSend, data.service, data.priority);
});

pipeline.on(
	"errorInFilter",
	({ error, data }: { error: Error; data: MeasureData }) => {
		console.log(`Incorrect data`);
	},
);

function validateCustomData(customData: SensorMeasure): boolean {
	for (const key of Object.keys(customData)) {
		if (customData[key as keyof MeasureData] === "") {
			return false;
		}
	}
	return true;
}

// Procesar mensajes de la cola RabbitMQ
rabbitMQQueue.process(async (data: SensorMeasure) => {
	if (validateCustomData(data)) {
		const newData = {
			...data,
			priority: 1,
		};
		pipeline.processInput(newData);
	} else {
		console.log(`Invalid data received: ${data}`);
	}
});
