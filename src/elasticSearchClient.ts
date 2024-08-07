import fs from "fs";
import { Client } from "@elastic/elasticsearch";
import type { MsgSensorNotification } from "./utils/types";

export const elasticSearchClient = new Client({
	node: "https://localhost:9200",
	auth: {
		username: "elastic",
		password: "my_elastic_password",
	},
	tls: {
		ca: fs.readFileSync("./es/tmp/ca.crt"),
	},
});

export const logError = (error: any) => {
	elasticSearchClient
		.index({
			index: "error-log",
			body: {
				error: error.message,
				timestamp: new Date(),
			},
		})
		.catch((err) => console.error("Error sending log entry:", err));
};

export const logSensorNotification = (info: MsgSensorNotification) => {
	elasticSearchClient
		.index({
			index: "sensor-notification-log",
			body: {
				info: info,
				timestamp: new Date(),
			},
		})
		.catch((err) => console.error("Error sending log entry:", err));
};
