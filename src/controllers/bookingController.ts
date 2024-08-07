import type { Request, Response } from "express";
import { logError } from "../elasticSearchClient";
import { RabbitMQQueueAdapter } from "../serverMeasurements/queues-providers/RabbitQueueAdapter";
import * as bookingService from "../services/bookingService";
import type {
	CreateBookingRequest,
	CustomRequest,
	GetBookingGeneralRequest,
	GetBookingRatioRequest,
	GetBookingRequest,
	PayBookingRequest,
	RequestWithUserEmail,
	UpdateBookingRequest,
} from "../utils/types";

const createBookingQueue = new RabbitMQQueueAdapter<CreateBookingRequest>(
	"create_booking_queue",
	false,
);
createBookingQueue.process(async (data) => {
	try {
		await bookingService.createBooking(data);
	} catch (error: any) {
		console.error(error);
	}
});
const payBookingQueue = new RabbitMQQueueAdapter<PayBookingRequest>(
	"pay_booking_queue",
	false,
);
payBookingQueue.process(async (data) => {
	try {
		await bookingService.payBooking(data);
	} catch (error: any) {
		console.error(error);
	}
});

export async function createBooking(req: Request, res: Response) {
	try {
		const body: CreateBookingRequest = req.body;
		createBookingQueue.add(body); //send it to queue
		return res.status(201).send({ message: "The booking is processing" });
	} catch (error: any) {
		logError(error);
		return res.status(400).send({ error: error.message });
	}
}

export async function getBooking(req: CustomRequest, res: Response) {
	try {
		if (!req.query.id || !req.query.email) {
			throw new Error("Missing parameters");
		}

		const query: GetBookingRequest = {
			id: req.query.id as string,
			email: req.query.email as string,
			loggedEmail: req.email as string,
		};

		const bookings = await bookingService.getBooking(query);
		return res.status(200).send(bookings);
	} catch (error: any) {
		logError(error);
		return res.status(400).send({ error: error.message });
	}
}

export async function deleteBooking(req: RequestWithUserEmail, res: Response) {
	try {
		await bookingService.deleteBooking({
			id: req.params.id,
			email: req.email,
		});
		return res.status(200).send({ message: "Booking deleted successfully" });
	} catch (error: any) {
		logError(error);
		return res.status(400).send({ error: error.message });
	}
}

export async function updateBooking(req: CustomRequest, res: Response) {
	try {
		const body: UpdateBookingRequest = {
			loggedEmail: req.email as string,
			...req.body,
		};
		await bookingService.updateBooking(body);
		return res
			.status(200)
			.send({ message: "Succesfully updated available dates" });
	} catch (error: any) {
		logError(error);
		return res.status(400).send({ error: error.message });
	}
}

export async function getBookingGeneral(req: Request, res: Response) {
	try {
		const params: GetBookingGeneralRequest = req.query;
		const bookings = await bookingService.getBookingGeneral(params);
		return res.status(200).send(bookings);
	} catch (error: any) {
		return res.status(400).send({ error: error.message });
	}
}

export async function getBookingRatio(req: Request, res: Response) {
	try {
		if (!req.query.toDate || !req.query.fromDate) {
			throw new Error("Missing parameters");
		}
		const query: GetBookingRatioRequest = {
			fromDate: new Date(req.query.fromDate as string),
			toDate: new Date(req.query.toDate as string),
		};
		const bookings = await bookingService.getBookingRatio(query);
		return res.status(200).send(bookings);
	} catch (error: any) {
		return res.status(400).send({ error: error.message });
	}
}

export async function payBooking(req: Request, res: Response) {
	try {
		const data: PayBookingRequest = {
			id: req.params.id,
			cardNumber: req.body.cardNumber as string,
			cvv: req.body.cvv as string,
			expirationDate: req.body.expirationDate as string,
		};

		payBookingQueue.add(data); //send it to queue
		return res.status(200).send({ message: "The payment is processing" });
	} catch (error: any) {
		return res.status(400).send({ error: error.message });
	}
}
