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
		await alertManteinanceUsers(data);
	}, serviceType.toLowerCase());
}

async function alertManteinanceUsers(data: MsgSensorNotification) {
	console.log("Alerting manteinance users");
	const users = await getPropertySubscribers(
		data.propertyId,
		Service.Manteinance,
	);
	const property = await getProperty(data.propertyId);
	const location = await getPropertyLocation(data.propertyId);
	users.forEach((user) => {
		if (user.role === "ADMIN" || user.role === "OWNER") {
			console.log(
				"Mailing: " + user.name + " " + user.lastName + " at " + user.email,
			);
			console.log(
				"Property: " +
					property.name +
					" located in: " +
					location.country +
					" " +
					location.state +
					" has detected a Manteinance event",
			);
			console.log(JSON.stringify(data, null, 2));
		}
	});
}

startConsumer("Manteinance").catch(console.error);
