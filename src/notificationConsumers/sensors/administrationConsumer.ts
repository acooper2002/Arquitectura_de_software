import { RabbitMQQueueAdapter } from "../../serverMeasurements/queues-providers/RabbitQueueAdapter";
import { getPropertySubscribers } from "../../services/SubscriptionService";
import {
	getProperty,
	getPropertyLocation,
} from "../../services/propertyService";
import { type MsgSensorNotification, Service } from "../../utils/types";

const exchange = "sensor_exchange";

async function startConsumer(serviceType: string) {
	const queueName = "service_queue_" + serviceType.toLowerCase();
	const rabbitSensorQueue = new RabbitMQQueueAdapter<MsgSensorNotification>(
		queueName,
		true,
		exchange,
	);
	console.log("Starting consumer " + queueName);
	rabbitSensorQueue.process(async (data: MsgSensorNotification) => {
		await alertAdministrationUsers(data);
	}, serviceType.toLowerCase());
}

async function alertAdministrationUsers(data: MsgSensorNotification) {
	console.log("Alerting administration users");
	const users = await getPropertySubscribers(
		data.propertyId,
		Service.Administration,
		"ADMIN",
	);
	const property = await getProperty(data.propertyId);
	const location = await getPropertyLocation(data.propertyId);
	users.forEach((user) => {
		console.log(
			"Messaging: " +
				user.name +
				" " +
				user.lastName +
				" at " +
				user.phoneNumber,
		);
		console.log(
			"Property: " +
				property.name +
				" located in: " +
				location.country +
				" " +
				location.state +
				" has detected an Administrative event",
		);
		console.log(JSON.stringify(data, null, 2));
	});
}

startConsumer("Administration").catch(console.error);
