import { Op } from "sequelize";
import { BookedDates } from "../dataAccess/BookedDates";
import { RabbitMQQueueAdapter } from "../serverMeasurements/queues-providers/RabbitQueueAdapter";
import {
	type CreateBookedDatesRequest,
	CreateBookingRequest,
	type DeleteBookingRequest,
} from "../utils/types";

export const createQueueSync =
	new RabbitMQQueueAdapter<CreateBookedDatesRequest>("booking-create", false);
export const deleteQueueSync = new RabbitMQQueueAdapter<DeleteBookingRequest>(
	"booking-delete",
	false,
);

export const createBookingSync = async (booking: CreateBookedDatesRequest) => {
	await createQueueSync.add(booking, "", 1);
};

createQueueSync.process(async (job) => {
	const totalDays =
		(new Date(job.checkOut).getTime() - new Date(job.checkIn).getTime()) /
		(1000 * 60 * 60 * 24);
	const rows = Array.from({ length: totalDays + 1 }, (_, i) => {
		return {
			propertyId: job.propertyId,
			day: new Date(
				new Date(job.checkIn).setDate(new Date(job.checkIn).getDate() + i),
			)
				.toISOString()
				.slice(0, 10),
		};
	});
	await BookedDates.bulkCreate(rows);
});

export const deleteBookingSync = async (booking: DeleteBookingRequest) => {
	await deleteQueueSync.add(booking, "", 1);
};

deleteQueueSync.process(async (job) => {
	await BookedDates.destroy({
		where: {
			propertyId: job.propertyId,
			day: {
				[Op.between]: [job.checkIn, job.checkOut],
			},
		},
		force: true,
	});
});
