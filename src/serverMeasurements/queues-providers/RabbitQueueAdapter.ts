import { type Channel, type Connection, connect } from "amqplib";
import { logError } from "../../elasticSearchClient";
import type { IQueue } from "./IQueue";

// Define la clase RabbitMQQueueAdapter que implementa la interfaz IQueue.
export class RabbitMQQueueAdapter<T> implements IQueue<T> {
	private connection: Promise<Connection>;
	private channel: Promise<Channel>;
	private queueName: string;
	private contentBased: boolean;
	private exchangeName: string;

	constructor(queueName: string, contentBased: boolean, exchangeName?: string) {
		this.queueName = queueName;
		this.contentBased = contentBased;
		this.exchangeName = exchangeName || "";
		this.connection = connect("amqp://user:password@localhost");
		this.channel = this.connection.then((conn) => conn.createChannel());

		if (contentBased && exchangeName) {
			this.channel.then((ch) =>
				ch.assertExchange(this.exchangeName, "topic", { durable: true }),
			);
		}
		this.channel.then((ch) =>
			ch.assertQueue(this.queueName, {
				durable: true,
				arguments: { "x-max-priority": 5 }, // Establece la prioridad máxima en 5
			}),
		);
	}

	async add(data: T, topic?: string, priority = 1): Promise<void> {
		const ch = await this.channel;
		if (priority < 1 || priority > 5)
			throw new Error("Priority must be between 1 and 5");
		if (this.contentBased && topic) {
			ch.publish(this.exchangeName, topic, Buffer.from(JSON.stringify(data)), {
				priority,
			});
		} else {
			ch.sendToQueue(this.queueName, Buffer.from(JSON.stringify(data)), {
				priority,
			});
		}
	}

	async process(
		callback: (data: T) => Promise<void>,
		bindingKey?: string,
	): Promise<void> {
		const ch = await this.channel;
		await ch.assertQueue(this.queueName, {
			durable: true,
			arguments: { "x-max-priority": 5 },
		});

		if (this.contentBased && bindingKey) {
			await ch.bindQueue(this.queueName, this.exchangeName, bindingKey);
		}

		ch.consume(this.queueName, async (msg) => {
			if (msg !== null) {
				try {
					const data = JSON.parse(msg.content.toString()) as T;
					await callback(data);
					ch.ack(msg);
				} catch (error) {
					logError(error);
					console.error("Error processing message:", error);
					ch.nack(msg);
				}
			}
		});
	}
}
