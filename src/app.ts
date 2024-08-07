import express from "express";
import { updateUnpaidJob } from "./config/cron";
import { dbSync, sequelize } from "./config/database";
import { logError } from "./elasticSearchClient";
import bookingRoutes from "./routes/bookingRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import sensorRoutes from "./routes/sensorRoutes";
import subscritions from "./routes/subscriptionRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();
const port = 3000;
const main = async () => {
	try {
		updateUnpaidJob.start();
		await dbSync();
	} catch (error: any) {
		logError(error);
	}

	app.use(express.json());
	app.use("/api", userRoutes);
	app.use("/api", propertyRoutes);
	app.use("/api", sensorRoutes);
	app.use("/api", subscritions);
	app.use("/api", bookingRoutes);

	app.listen(port, async () => {
		console.log(`Server running on http://localhost:${port}`);
		try {
			await sequelize.authenticate();
			console.log(
				"La conexión con la base de datos ha sido establecida correctamente.",
			);
		} catch (error) {
			logError(error);
			console.error("No se pudo conectar a la base de datos:", error);
		}
	});
};

main();
