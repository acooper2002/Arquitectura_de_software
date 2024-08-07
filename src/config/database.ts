import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();

const sequelize = new Sequelize(
	`postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
);

import { BookedDates } from "../dataAccess/BookedDates";
import { Booking } from "../dataAccess/Booking";
import { CancellationPolicy } from "../dataAccess/CancellationPolicy";
import { Document } from "../dataAccess/Document";
import { Image } from "../dataAccess/Image";
import { Location } from "../dataAccess/Location";
import { Property } from "../dataAccess/Property";
import { Sensor } from "../dataAccess/Sensor";
import { User } from "../dataAccess/User";
import { Subscription } from "../dataAccess/UserPropertySubscription";
import { setRelationships } from "../dataAccess/relationships";
import { logError } from "../elasticSearchClient";

const syncTables = async () => {
	try {
		if (process.env.DB_SYNC === "true") {
			await Document.sync();
			await Location.sync();
			await User.sync();
			await Property.sync();
			await Image.sync();
			await Sensor.sync();
			await Booking.sync();
			await BookedDates.sync();
			await Subscription.sync();
			await CancellationPolicy.sync();
			console.log("Los modelos fueron sincronizados con la base de datos.");
		}
	} catch (error) {
		logError(error);
		console.error(
			"Error al sincronizar los modelos con la base de datos:",
			error,
		);
	}
};

const dbSync = async () => {
	await setRelationships();
	await syncTables();
};

export { sequelize, dbSync };
