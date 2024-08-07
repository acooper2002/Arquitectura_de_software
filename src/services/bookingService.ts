import { Booking } from "../dataAccess/Booking";
import type {
	BookingWithUserEmail,
	CreateBookingRequest,
	DeleteBookingRequest,
	GetBookingData,
	GetBookingGeneralRequest,
	GetBookingRatioRequest,
	GetBookingRequest,
	GetEmailsRequest,
	PayBookingRequest,
	ServicesNotificationData,
	UpdateBookingRequest,
} from "../utils/types";

import { get } from "http";
import axios, { AxiosError } from "axios";
import { type Model, Sequelize } from "sequelize";
import { Op } from "sequelize";
import { sequelize } from "../config/database";
import { BookedDates } from "../dataAccess/BookedDates";
import { CancellationPolicy } from "../dataAccess/CancellationPolicy";
import { Document } from "../dataAccess/Document";
import { Location } from "../dataAccess/Location";
import { Property } from "../dataAccess/Property";
import { User } from "../dataAccess/User";
import { logError } from "../elasticSearchClient";
import { Service } from "../utils/types";
import { createBookingSync, deleteBookingSync } from "./bookingSyncService";
import { addServicesNotification } from "./notificationService";

interface PropertyInterface extends Model {
	id: string;
	childrenQty: number;
	adultQty: number;
	User: {
		email: string;
	};
}

interface Booking {
	propertyId: string;
	checkIn: Date;
	checkOut: Date;
}

interface GetIdInterface extends Model {
	id: string;
}
interface GetEmailsInterface extends Model {
	email: string;
}

interface OccupancyInfo {
	neighborhood: string;
	totalProperties: number;
	bookedProperties: number;
	occupancyRatio: number;
}

interface Booking {
	propertyId: string;
	checkIn: Date;
	checkOut: Date;
}

export const createBooking = async (
	booking: CreateBookingRequest,
): Promise<void> => {
	const t = await sequelize.transaction();
	try {
		const existsUser = await Document.findByPk(booking.documentId);
		let newUser: GetIdInterface | undefined;

		const property = (await Property.findByPk(
			booking.propertyId,
		)) as PropertyInterface | null;
		const totalGuests = booking.childrenGuestsQty + booking.adultsGuestsQty;
		if (!property) {
			await sendRejectedBookingEmail(booking);
			throw new Error("The property does not exist");
		}

		if (
			totalGuests >
			(property.getDataValue("childrenQty") ?? 0) +
				(property.getDataValue("adultsQty") ?? 0)
		) {
			await sendRejectedBookingEmail(booking);
			throw new Error(
				"The number of people in the reservation exceeds the capacity of the property",
			);
		}

		const existingBooking = await Booking.findOne({
			where: {
				propertyId: booking.propertyId,
				checkIn: booking.checkIn,
				checkOut: booking.checkOut,
				status: "ACCEPTED" || "PAID",
			},
		});
		if (existingBooking) {
			await sendRejectedBookingEmail(booking);
			throw new Error("The property is already booked for the selected dates");
		}

		if (!existsUser) {
			const newDocument = (await Document.create(
				{
					id: booking.documentId,
					type: booking.type,
				},
				{ transaction: t },
			)) as GetIdInterface;

			newUser = (await User.create(
				{
					name: booking.name,
					lastName: booking.surname,
					documentId: newDocument.id,
					email: booking.email,
					phoneNumber: booking.phoneNumber,
					role: "TENANT",
				},
				{ transaction: t },
			)) as GetIdInterface;
		}

		const locationId = await Location.findByPk(booking.locationId);
		if (!locationId) {
			await sendRejectedBookingEmail(booking);
			throw new Error("The location does not exist");
		}

		if (booking.checkIn > booking.checkOut) {
			await sendRejectedBookingEmail(booking);
			throw new Error("The check-in date must be before the check-out date");
		}

		const bookedDates = await BookedDates.findAll({
			attributes: ["propertyId"],
			where: {
				day: {
					[Op.between]: [new Date(booking.checkIn), new Date(booking.checkOut)],
				},
			},
			group: ["propertyId"],
		});

		const bookedDateIds = new Set(
			bookedDates.map((bp) => bp.getDataValue("propertyId")),
		);

		if (bookedDateIds.has(booking.propertyId)) {
			await sendRejectedBookingEmail(booking);
			throw new Error("The property is already booked for the selected dates");
		}

		const newBooking = (await Booking.create(
			{
				locationId: booking.locationId,
				checkIn: booking.checkIn,
				checkOut: booking.checkOut,
				propertyId: booking.propertyId,
				userId: newUser?.id ?? booking.userId,
				status: "PENDING",
			},
			{ transaction: t },
		)) as GetIdInterface;

		const emails = await getEmails(booking);
		const message =
			"A new booking has been made for the property with id: " +
			booking.propertyId +
			" from " +
			booking.checkIn +
			" to " +
			booking.checkOut +
			" by " +
			booking.email +
			" with " +
			totalGuests +
			" guests.";
		const typeOfService: Service = Service.Booking;

		const servicesNotificationData: ServicesNotificationData = {
			emails: emails,
			message: {
				subject: "RESERVA ACEPTADA",
				content: `Se ha realizado la reserva correctamente para la propiedad ${booking.name} en las siguientes fechas: ${booking.checkIn} hasta ${booking.checkOut}`,
			},
			typeOfService: typeOfService,
		};
		await addServicesNotification(servicesNotificationData);
		await t.commit();
		await createBookingSync({
			checkIn: booking.checkIn,
			checkOut: booking.checkOut,
			propertyId: booking.propertyId,
		});
	} catch (error: any) {
		await t.rollback();
		await sendRejectedBookingEmail(booking);
		throw new Error(error.message);
	}
};

export const sendRejectedBookingEmail = async (
	booking: CreateBookingRequest,
): Promise<void> => {
	const emails = await getEmails(booking);
	const typeOfService: Service = Service.Booking;
	const servicesNotificationData: ServicesNotificationData = {
		emails: emails,
		message: {
			subject: "RESERVA RECHAZADA",
			content: `La reserva ha sido rechazada para la para la propiedad ${booking.name} en las siguientes fechas: ${booking.checkIn} hasta ${booking.checkOut}`,
		},
		typeOfService: typeOfService,
	};
	await addServicesNotification(servicesNotificationData);
};

export const getEmails = async (
	booking: GetEmailsRequest,
): Promise<string[]> => {
	try {
		const property = (await Property.findByPk(
			booking.propertyId,
		)) as PropertyInterface;
		const admins = (await User.findAll({
			attributes: ["email"],
			where: {
				role: "ADMIN",
			},
			raw: true,
		})) as GetEmailsInterface[];
		const adminsEmails = admins.map((user: GetEmailsInterface) => user.email);

		const owner = (await User.findOne({
			attributes: ["email"],
			where: {
				id: property.getDataValue("ownerId"),
			},
			raw: true,
		})) as unknown as { email: string };
		const ownerEmail = owner.email;

		const emails: string[] = [...adminsEmails, ownerEmail];
		return emails;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const deleteBooking = async (
	request: DeleteBookingRequest,
): Promise<void> => {
	const t = await sequelize.transaction();
	try {
		const user = await User.findOne({
			where: {
				email: request.email,
			},
		});

		if (!user) throw new Error("The user does not exist");

		const booking = await Booking.findOne({
			where: {
				id: request.id,
				userId: user.getDataValue("id"),
			},
		});

		if (!booking) {
			throw new Error("The booking does not exist");
		}

		const property = await Property.findByPk(
			booking.getDataValue("propertyId"),
		);
		if (!property) throw new Error("The property does not exist");
		const location = await Location.findByPk(
			property.getDataValue("locationId"),
		);
		if (!location) throw new Error("The location does not exist");

		if (
			booking.getDataValue("status") === "CANCELLED_BY_TENANT" ||
			booking.getDataValue("status") === "CANCELLED_BY_ADMIN"
		) {
			throw new Error("The booking has already been cancelled");
		}

		const cancellationPolicy = await CancellationPolicy.findOne({
			where: {
				country: location.getDataValue("country"),
			},
		});

		if (!!cancellationPolicy) {
			const daysBeforeCheckIn =
				cancellationPolicy.getDataValue("daysBeforeCheckIn");
			const currentDate = new Date();
			const checkInDate = new Date(booking.getDataValue("checkIn"));
			const daysDifference =
				(checkInDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
			if (daysDifference < daysBeforeCheckIn) {
				throw new Error(
					"The booking cannot be cancelled because the check-in date is too close",
				);
			}
		}

		await Booking.update(
			{
				status: "CANCELLED_BY_TENANT",
			},
			{
				where: {
					id: booking.getDataValue("id"),
				},
				transaction: t,
			},
		);

		await t.commit();
		await deleteBookingSync({
			...request,
			propertyId: booking.getDataValue("propertyId"),
			checkIn: booking.getDataValue("checkIn"),
			checkOut: booking.getDataValue("checkOut"),
		});
	} catch (error: any) {
		logError(error);
		await t.rollback();
		throw new Error(error.message);
	}
};

export const getBooking = async (
	bookingRequest: GetBookingRequest,
): Promise<GetBookingData> => {
	try {
		const booking = await Booking.findByPk(bookingRequest.id, {
			include: [
				{
					model: User,
					as: "user",
					attributes: ["name", "lastName", "email", "phoneNumber"],
				},
				{
					model: Property,
					as: "property",
					attributes: ["name", "adultsQty", "childrenQty"],
				},
			],
		});

		if (!booking) throw new Error("Booking not found");
		if (!booking.getDataValue("user")) throw new Error("User not found");
		if (!booking.getDataValue("property"))
			throw new Error("Property not found");

		if (bookingRequest.loggedEmail !== booking.getDataValue("user").email)
			throw new Error("Unauthorized, you are not the owner of this booking");
		const maxNumberOfGuests =
			booking.getDataValue("property").adultsQty +
			booking.getDataValue("property").childrenQty;

		return {
			id: booking.getDataValue("id"),
			name: booking.getDataValue("name"),
			surname: booking.getDataValue("user").lastName,
			email: booking.getDataValue("user").email,
			phoneNumber: booking.getDataValue("user").phoneNumber,
			location: booking.getDataValue("property").name,
			maxNumberOfGuests,
			checkIn: booking.getDataValue("checkIn"),
			checkOut: booking.getDataValue("checkOut"),
			status: booking.getDataValue("status"),
		};
	} catch (error: any) {
		logError(error);
		throw new Error(error.message);
	}
};

export const updateBooking = async (
	bookingData: UpdateBookingRequest,
): Promise<void> => {
	const property = await Property.findByPk(bookingData.propertyId);
	if (!property) throw new Error("The property does not exist");

	const user = await User.findOne({
		where: { email: bookingData.loggedEmail },
	});
	if (!user) throw new Error("The user does not exist");

	if (property.getDataValue("ownerId") !== user.getDataValue("id"))
		throw new Error("You are not the owner of the property");

	if (bookingData.fromDate > bookingData.toDate)
		throw new Error("The from date must be before the to date");
	const bookedDates = await BookedDates.findAll({
		where: {
			propertyId: bookingData.propertyId,
		},
	});

	const totalDays =
		(new Date(bookingData.toDate).getTime() -
			new Date(bookingData.fromDate).getTime()) /
		(1000 * 60 * 60 * 24);
	for (let i = 0; i <= totalDays; i++) {
		const day = new Date(
			new Date(bookingData.fromDate).setDate(
				new Date(bookingData.fromDate).getDate() + i,
			),
		)
			.toISOString()
			.slice(0, 10);
		if (
			bookedDates.some((bookedDate) => bookedDate.getDataValue("day") === day)
		) {
			throw new Error(`The date ${day} is already booked`);
		}
	}

	const booking = {
		userId: user.getDataValue("id"),
		checkIn: bookingData.fromDate,
		checkOut: bookingData.toDate,
		propertyId: bookingData.propertyId,
		status: "CANCELLED_BY_OWNER",
	};

	await Booking.create(booking);
	await createBookingSync({
		checkIn: bookingData.fromDate,
		checkOut: bookingData.toDate,
		propertyId: bookingData.propertyId,
	});
};

export const getBookingGeneral = async (
	filters: GetBookingGeneralRequest,
): Promise<GetBookingData[]> => {
	const { fromDate, toDate, propertyId, userName, userLastName, status } =
		filters;

	// Build the where clause for Booking
	const bookingWhere: any = {};
	if (fromDate) bookingWhere.checkIn = { [Op.gte]: fromDate };
	if (toDate) bookingWhere.checkOut = { [Op.lte]: toDate };
	if (propertyId) bookingWhere.propertyId = propertyId;
	if (status) bookingWhere.status = status;

	// Build the where clause for User
	const userWhere: any = {};
	if (userName) userWhere.name = userName;
	if (userLastName) userWhere.lastName = userLastName;

	const bookings = await Booking.findAll({
		where: bookingWhere,
		include: [
			{
				model: User,
				as: "user",
				where: userWhere,
			},
			{
				model: Property,
				as: "property",
				attributes: ["name", "adultsQty", "childrenQty"],
			},
		],
	});

	return bookings.map((booking) => {
		return {
			id: booking.getDataValue("id"),
			name: booking.getDataValue("user").name,
			surname: booking.getDataValue("user").lastName,
			email: booking.getDataValue("user").email,
			phoneNumber: booking.getDataValue("user").phoneNumber,
			location: booking.getDataValue("property").name,
			maxNumberOfGuests:
				booking.getDataValue("property").adultsQty +
				booking.getDataValue("property").childrenQty,
			checkIn: booking.getDataValue("checkIn"),
			checkOut: booking.getDataValue("checkOut"),
			status: booking.getDataValue("status"),
		};
	});
};

export const getBookingRatio = async (
	bookingData: GetBookingRatioRequest,
): Promise<OccupancyInfo[]> => {
	const { fromDate, toDate } = bookingData;

	try {
		// Consulta para contar el número total de propiedades en cada barrio
		const totalPropertiesQuery = await Location.findAll({
			attributes: [
				"neighborhood",
				[Sequelize.fn("COUNT", Sequelize.col("id")), "total_properties"],
			],
			group: ["neighborhood"],
		});

		const totalPropertiesMap: { [neighborhood: string]: number } = {};
		totalPropertiesQuery.forEach((result) => {
			totalPropertiesMap[result.getDataValue("neighborhood")] =
				result.getDataValue("total_properties");
		});

		// Consulta para contar el número de propiedades alquiladas en cada barrio durante el período especificado
		const bookedPropertiesQuery = await BookedDates.findAll({
			where: {
				day: {
					[Op.between]: [fromDate, toDate],
				},
			},
			include: [
				{
					model: Property,
					as: "property",
					include: [
						{
							model: Location,
							as: "location",
							attributes: ["id", "neighborhood"],
						},
					],
					attributes: [],
				},
			],
			attributes: [
				[Sequelize.col("property.location.id"), "location_id"], // Incluimos 'property.location.id' aquí
				[Sequelize.col("property.location.neighborhood"), "neighborhood"],
				[
					Sequelize.fn(
						"COUNT",
						Sequelize.fn("DISTINCT", Sequelize.col("property.id")),
					),
					"booked_properties",
				], // Usamos DISTINCT para contar cada propiedad solo una vez
			],
			group: ["property.location.id", "property.location.neighborhood"], // Añadimos 'property.location.id' en la cláusula GROUP BY
		});

		const bookedPropertiesCount: { [neighborhood: string]: number } = {};
		bookedPropertiesQuery.forEach((result) => {
			const neighborhood = result.getDataValue("neighborhood");
			if (bookedPropertiesCount[neighborhood]) {
				bookedPropertiesCount[neighborhood] += 1; // Incrementar el contador en 1 por cada propiedad reservada encontrada
			} else {
				bookedPropertiesCount[neighborhood] = 1; // Inicializar el contador en 1 si es la primera propiedad reservada encontrada para este vecindario
			}
		});

		// Formatear los resultados
		const formattedResults: OccupancyInfo[] = Object.keys(
			bookedPropertiesCount,
		).map((neighborhood) => {
			return {
				neighborhood,
				totalProperties: totalPropertiesMap[neighborhood] || 0,
				bookedProperties: bookedPropertiesCount[neighborhood],
				occupancyRatio: Number(
					(
						bookedPropertiesCount[neighborhood] /
						totalPropertiesMap[neighborhood]
					).toFixed(2),
				), // Redondear el ratio a un decimal
			};
		});

		formattedResults.sort((a, b) => b.occupancyRatio - a.occupancyRatio); // Ordenar los resultados por ratio de ocupación descendente

		return formattedResults;
	} catch (error) {
		logError(error);
		console.error(error);
		throw error;
	}
};

export const payBooking = async (data: PayBookingRequest): Promise<void> => {
	try {
		const booking = await Booking.findByPk(data.id, {
			include: [
				{
					model: Property,
					as: "property",
					attributes: ["id", "name"],
				},
			],
		});
		if (!booking) throw new Error("Booking not found");

		if (booking.getDataValue("status") === "PAID")
			throw new Error("The booking has already been paid");
		if (booking.getDataValue("status") !== "ACCEPTED")
			throw new Error("The booking status needs to be accepted");
		await axios.post("http://localhost:3003/api/pay", {
			cardNumber: data.cardNumber,
			cvv: data.cvv,
			expirationDate: data.expirationDate,
		});
		await Booking.update(
			{
				status: "PAID",
			},
			{
				where: {
					id: data.id,
				},
			},
		);
		const emails = await getEmails({
			propertyId: booking.getDataValue("propertyId"),
		});
		const typeOfService: Service = Service.Payment;

		const servicesNotificationData: ServicesNotificationData = {
			emails: emails,
			message: {
				subject: "PAGO ACEPTADO",
				content: `El pago de la reserva fue aceptado para la propiedad ${booking.getDataValue("property").name} para las siguientes fechas: ${booking.getDataValue("checkIn")} hasta ${booking.getDataValue("checkOut")}`,
			},
			typeOfService: typeOfService,
		};
		await addServicesNotification(servicesNotificationData);
	} catch (error: any) {
		logError(error);
		if (axios.isAxiosError(error)) {
			const booking = await Booking.findByPk(data.id, {
				include: [
					{
						model: Property,
						as: "property",
						attributes: ["id", "name"],
					},
				],
			});
			const emails = await getEmails({
				propertyId: booking!.getDataValue("propertyId"),
			});
			const typeOfService: Service = Service.Payment;

			const servicesNotificationData: ServicesNotificationData = {
				emails: emails,
				message: {
					subject: "PAGO RECHAZADO",
					content: `El pago de la reserva fue rechazado para la propiedad ${booking!.getDataValue("property").name} para las siguientes fechas: ${booking!.getDataValue("checkIn")} hasta ${booking!.getDataValue("checkOut")}`,
				},
				typeOfService: typeOfService,
			};
			await addServicesNotification(servicesNotificationData);
			throw new Error(error.response?.data.message as string);
		} else {
			throw new Error(error?.message as string);
		}
	}
};

export const updateBookingAvailability = async (): Promise<void> => {
	const t = await sequelize.transaction();
	try {
		const bookings = (await Booking.findAll({
			where: {
				status: "PENDING",
			},
			transaction: t,
			include: [
				{
					model: User,
					as: "user",
					attributes: ["email"],
				},
			],
			raw: true,
		})) as BookingWithUserEmail[];

		await Booking.update(
			{
				status: "CANCELLED_NOT_PAID",
			},
			{
				where: {
					status: "PENDING",
				},
				transaction: t,
			},
		);

		await t.commit();

		const emails = bookings.map((booking) => booking["user.email"]) as string[];
		if (emails.length) {
			const servicesNotificationData: ServicesNotificationData = {
				emails: emails,
				message: {
					subject: "RESERVA CANCELADA POR FALTA DE PAGO",
					content: `La reserva ha sido cancelada por falta de pago`,
				},
				typeOfService: Service.Payment,
			};

			await addServicesNotification(servicesNotificationData);
		}
	} catch (error: any) {
		logError(error);
		await t.rollback();
		throw new Error(error.message);
	}
};
