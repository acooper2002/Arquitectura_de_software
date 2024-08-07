const amqp = require("amqplib/callback_api");

const queuesToDelete = [
	"filter-queue-0",
	"filter-queue-1",
	"filter-queue-2",
	"filter-queue-4",
	"filter-queue-3",
	"filter-queue-5",
	"filter-queue-6",
	"service_queue_security",
	"service_queue_others",
	"service_queue_manteinance",
	"sensor_data",
	"sensor_exchange",
	"delete-queue",
	"create-queue",
];

amqp.connect("amqp://user:password@localhost", (error0, connection) => {
	if (error0) {
		throw error0;
	}
	connection.createChannel((error1, channel) => {
		if (error1) {
			throw error1;
		}

		queuesToDelete.forEach((queue) => {
			channel.deleteQueue(queue, {}, (error2, ok) => {
				if (error2) {
					console.error(`Failed to delete queue ${queue}:`, error2.message);
				} else {
					console.log(`Queue ${queue} deleted successfully`);
				}
			});
		});

		setTimeout(() => {
			connection.close();
			process.exit(0);
		}, 500); // Espera 500 ms para asegurar que todas las colas se eliminen antes de cerrar la conexión
	});
});
