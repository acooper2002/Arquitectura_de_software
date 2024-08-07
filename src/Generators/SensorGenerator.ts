import { Sensor } from "../dataAccess/Sensor";
import { logError } from "../elasticSearchClient";
import type {
	SensorConfig,
	SensorMeasure,
} from "../serverMeasurements/data-structure/Measure";
import { RabbitMQQueueAdapter } from "../serverMeasurements/queues-providers/RabbitQueueAdapter";
import { getSensors } from "../services/sensorService";

const queueName = "sensor_data";
const rabbitMQQueue = new RabbitMQQueueAdapter<SensorMeasure>(queueName, false);

const scanSensors = async (type?: string) => {
	console.log("Escaneando sensores");
	const sensors = await getSensors(type);
	for (const sensor of sensors) {
		const observableProperty = JSON.parse(sensor.observableProperty);
		const generatedData = generateSensorData(observableProperty);
		for (const data of generatedData) {
			sendToQueue(data);
		}
	}
};

function generateSensorData(sensorConfig: SensorConfig): SensorMeasure[] {
	const sensorId = sensorConfig.sensorId;
	const dateTime = new Date().toISOString();
	var message = "";
	const dataObjects: SensorMeasure[] = [];

	for (const [key, value] of Object.entries(sensorConfig)) {
		if (key !== "sensorId") {
			const dataObject: SensorMeasure = {
				sensorId: sensorId,
				dateTime: dateTime,
			};
			for (const [key2, value2] of Object.entries(value)) {
				if (key2 === "Message") {
					message = value2 as string;
				}
			}
			if (message !== "") {
				dataObject[key] = message;
			} else {
				dataObject[key] = Math.random() * 100;
			}
			dataObjects.push(dataObject);
		}
	}
	return dataObjects;
}

const sendToQueue = async (data: SensorMeasure) => {
	try {
		await rabbitMQQueue.add(data);
		console.log("Dato enviado a la cola", data);
	} catch (error) {
		logError(error);
		console.error("Error al enviar el dato a la cola", error);
	}
};

const type = "";

scanSensors(type);
setInterval(() => scanSensors(type), 2000);
