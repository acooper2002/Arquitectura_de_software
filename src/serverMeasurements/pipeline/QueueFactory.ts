import { BullQueueAdapter } from "../queues-providers/BullQueueAdapter";
import type { IQueue } from "../queues-providers/IQueue";
import { RabbitMQQueueAdapter } from "../queues-providers/RabbitQueueAdapter";

export class QueueFactory {
	static getQueueFactory<T>(
		queueName: string,
		contenBased: boolean,
	): IQueue<T> {
		const queueType = process.env.QUEUE_TYPE;

		switch (queueType) {
			case "BULL":
				// Asegúrate de tener una instancia de Redis corriendo o configurar la conexión de Bull según sea necesario.
				return new BullQueueAdapter<T>(queueName);
			case "RABBITMQ":
				// Asegúrate de que tu instancia de RabbitMQ esté corriendo o configurar la conexión de RabbitMQ según sea necesario.
				return new RabbitMQQueueAdapter<T>(queueName, contenBased);
			default:
				throw new Error(`Unsupported queue type: ${queueType}`);
		}
	}
}
