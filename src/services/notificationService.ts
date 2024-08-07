import { Channel, Connection, connect } from "amqplib";
import { RabbitMQQueueAdapter } from "../serverMeasurements/queues-providers/RabbitQueueAdapter";
import type {
	MsgSensorNotification,
	ServicesNotificationData,
} from "../utils/types";

const sensor_exchangeName = "sensor_exchange";
const notif_exchangeName = "notif_exchange";

export const rabbitSensorQueue =
	new RabbitMQQueueAdapter<MsgSensorNotification>(
		sensor_exchangeName,
		true,
		sensor_exchangeName,
	);
export const rabbitNotificationQueue =
	new RabbitMQQueueAdapter<ServicesNotificationData>(
		notif_exchangeName,
		true,
		notif_exchangeName,
	);

export const addSensorNotification = async (
	msj: MsgSensorNotification,
	topic: string,
	priority: number,
) => {
	console.log("Adding sensor notification");
	await rabbitSensorQueue.add(msj, topic.toLowerCase(), priority);
	console.log("Sensor notification added" + msj + topic + priority);
};

export const addServicesNotification = async (
	data: ServicesNotificationData,
) => {
	console.log("Adding services notification");
	await rabbitNotificationQueue.add(data, data.typeOfService.toLowerCase(), 3);
	console.log("Services Notification added" + data);
};
