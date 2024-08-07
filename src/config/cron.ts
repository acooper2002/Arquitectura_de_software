import { CronJob } from "cron";
import { logError } from "../elasticSearchClient";
import { updateBookingAvailability } from "../services/bookingService";

export const updateUnpaidJob = new CronJob(
	"0 0 0 * * *", //every midnight
	async () => {
		try {
			await updateBookingAvailability();
		} catch (error: any) {
			logError(error);
		}
	},
	null,
	true,
	"America/Montevideo",
);
