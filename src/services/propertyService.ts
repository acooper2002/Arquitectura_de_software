import { type Model, Op } from "sequelize";
import { sequelize } from "../config/database";
import { BookedDates } from "../dataAccess/BookedDates";
import { Booking } from "../dataAccess/Booking";
import { Image } from "../dataAccess/Image";
import { Location } from "../dataAccess/Location";
import { Property } from "../dataAccess/Property";
import { User } from "../dataAccess/User";
import { logError } from "../elasticSearchClient";
import type {
	CreatePropertyRequest,
	GetEarningsByPropertyParams,
	GetPropertiesQueryParams,
	GetPropertiesResponse,
	LocationAttributes,
	PropertyAttributes,
} from "../utils/types";

interface GetIdInterface extends Model {
	id: string;
}

export const createProperty = async (
	property: CreatePropertyRequest,
): Promise<void> => {
	const t = await sequelize.transaction();
	try {
		const newLocation = (await Location.create(
			{
				country: property.country,
				state: property.state,
				zone: property.zone,
				neighborhood: property.neighborhood,
			},
			{ transaction: t },
		)) as GetIdInterface;

		const userId = await User.findOne({
			where: { email: property.ownerEmail },
			attributes: ["id"],
		});
		const newProperty = (await Property.create(
			{
				name: property.name,
				adultsQty: property.adultsQty,
				childrenQty: property.childrenQty,
				doubleBedsQty: property.doubleBedsQty,
				singleBedsQty: property.singleBedsQty,
				hasAirConditioning: property.hasAirConditioning,
				hasWifi: property.hasWifi,
				hasGarage: property.hasGarage,
				isHouseOrApt: property.isHouseOrApt,
				distanceToBeach: property.distanceToBeach,
				pricePerNight: property.pricePerNight,
				locationId: newLocation.id,
				ownerId: userId?.getDataValue("id"),
			},
			{ transaction: t },
		)) as GetIdInterface;

		const images = property.imageRoutes.map((route) => ({
			propertyId: newProperty.id,
			path: route,
		}));

		await Image.bulkCreate(images, { transaction: t });

		await t.commit();
	} catch (error: any) {
		logError(error);
		await t.rollback();
		throw new Error(error.message);
	}
};

export const getProperty = async (id: string): Promise<PropertyAttributes> => {
	try {
		const property = await Property.findByPk(id);
		if (!property) throw new Error("Property not found");
		return property.get();
	} catch (error: any) {
		logError(error);
		throw new Error(error.message);
	}
};

export const getPropertyLocation = async (
	id: string,
): Promise<LocationAttributes> => {
	try {
		const property = await Property.findByPk(id);
		if (!property) throw new Error("Property not found");
		const locationId = property.getDataValue("locationId");
		const location = await Location.findByPk(locationId);
		if (!location) throw new Error("Location not found");
		return location.get();
	} catch (error: any) {
		logError(error);
		throw new Error(error.message);
	}
};

export const getProperties = async (
	params: GetPropertiesQueryParams,
): Promise<GetPropertiesResponse> => {
	let {
		fromDate,
		toDate,
		adultsQty,
		childrenQty,
		doubleBedsQty,
		singleBedsQty,
		hasAirConditioning,
		hasWifi,
		hasGarage,
		isHouseOrApt,
		distanceToBeach,
		state,
		zone,
		neighborhood,
		page = 1,
		pageSize = 10,
	} = params;

	if (!numberParamsAreValid(params)) {
		throw new Error("Invalid number parameters");
	}

	let showCalendar = false; //TODO

	if (
		!fromDate ||
		!toDate ||
		fromDate > toDate ||
		new Date(fromDate) < new Date()
	) {
		fromDate = new Date();
		toDate = new Date(fromDate);
		toDate.setDate(toDate.getDate() + 30);
		showCalendar = true;
	}

	const whereConditions: any = {};
	const locationConditions: any = {};

	if (adultsQty) whereConditions.adultsQty = { [Op.gte]: adultsQty };
	if (childrenQty) whereConditions.childrenQty = { [Op.gte]: childrenQty };
	if (doubleBedsQty)
		whereConditions.doubleBedsQty = { [Op.gte]: doubleBedsQty };
	if (singleBedsQty)
		whereConditions.singleBedsQty = { [Op.gte]: singleBedsQty };
	if (hasAirConditioning)
		whereConditions.hasAirConditioning = hasAirConditioning;
	if (hasWifi) whereConditions.hasWifi = hasWifi;
	if (hasGarage) whereConditions.hasGarage = hasGarage;
	if (isHouseOrApt) whereConditions.isHouseOrApt = isHouseOrApt;
	if (distanceToBeach)
		whereConditions.distanceToBeach = { [Op.lte]: distanceToBeach };

	if (state) locationConditions.state = state;
	if (zone) locationConditions.zone = zone;
	if (neighborhood) locationConditions.neighborhood = neighborhood;

	try {
		const [allProperties, bookedProperties] = await Promise.all([
			Property.findAll({
				where: whereConditions,
				include: [
					{
						model: Location,
						as: "location",
						where: locationConditions,
					},
					{
						model: Image,
						as: "images",
						attributes: ["path"],
					},
				],
			}),
			BookedDates.findAll({
				attributes: ["propertyId"],
				where: {
					day: {
						[Op.between]: [new Date(fromDate), new Date(toDate)],
					},
				},
				group: ["propertyId"],
			}),
		]);

		const bookedPropertyIds = new Set(
			bookedProperties.map((bp) => bp.getDataValue("propertyId")),
		);

		const availableProperties = allProperties.filter(
			(property) => !bookedPropertyIds.has(property.getDataValue("id")),
		) as Model<any, any>[];

		const paginatedProperties = availableProperties.slice(
			(page - 1) * pageSize,
			page * pageSize,
		);

		const results = paginatedProperties.map((property) => ({
			id: property.getDataValue("id"),
			name: property.getDataValue("name"),
			adultsQty: property.getDataValue("adultsQty"),
			childrenQty: property.getDataValue("childrenQty"),
			doubleBedsQty: property.getDataValue("doubleBedsQty"),
			singleBedsQty: property.getDataValue("singleBedsQty"),
			hasAirConditioning: property.getDataValue("hasAirConditioning"),
			hasWifi: property.getDataValue("hasWifi"),
			hasGarage: property.getDataValue("hasGarage"),
			isHouseOrApt: property.getDataValue("isHouseOrApt"),
			distanceToBeach: property.getDataValue("distanceToBeach"),
			location: property.getDataValue("location"),
			images: property.getDataValue("images").map((image: any) => image.path),
		}));

		return {
			count: availableProperties.length,
			pages: Math.ceil(availableProperties.length / pageSize),
			currentPage: page,
			results: results,
		};
	} catch (error: any) {
		logError(error);
		throw new Error(error.message);
	}
};

const numberParamsAreValid = (params: GetPropertiesQueryParams) => {
	return Object.entries(params).every(([_, value]) => {
		if (typeof value === "number" && (value < 0 || value > 99)) return false;
		return true;
	});
};

export const getEarningsByProperty = async (
	params: GetEarningsByPropertyParams,
): Promise<{ data: any[]; totalEarnings: number }> => {
	const { id, fromDate, toDate } = params;
	try {
		const property = await Property.findByPk(id, {
			include: [
				{
					model: Location,
					as: "location",
					attributes: ["country", "zone"],
				},
			],
		});
		if (!property) throw new Error("Property not found");
		const bookings = await Booking.findAll({
			where: {
				propertyId: id,
				checkIn: {
					[Op.between]: [fromDate, toDate],
				},
				checkOut: {
					[Op.between]: [fromDate, toDate],
				},
				status: "PAID",
			},
			include: [
				{
					model: User,
					as: "user",
					attributes: ["name", "lastName"],
				},
			],
		});

		const data = bookings.map((booking) => {
			const checkOut = new Date(booking.getDataValue("checkOut"));
			const checkIn = new Date(booking.getDataValue("checkIn"));
			const totalDays = Math.round(
				(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
			);
			const earnings = totalDays * property.getDataValue("pricePerNight");
			return {
				bookingId: booking.getDataValue("id"),
				propertyName: property.getDataValue("name"),
				country: property.getDataValue("location").country,
				city: property.getDataValue("location").zone,
				tenantName: booking.getDataValue("user").name,
				tenantLastName: booking.getDataValue("user").lastName,
				amount: earnings,
			};
		});

		return {
			data: data,
			totalEarnings: data.reduce(
				(acc: number, curr: any) => acc + curr.amount,
				0,
			),
		};
	} catch (error: any) {
		throw new Error(error.message);
	}
};
