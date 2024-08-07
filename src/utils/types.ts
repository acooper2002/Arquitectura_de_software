import type { Request } from "express";

export type Role = "ADMIN" | "OPERATOR" | "TENANT" | "OWNER";

export interface UserAttributes {
	id: string;
	documentId: string;
	role: Role;
	name: string;
	lastName: string;
	email: string;
	phoneNumber: string;
}
export interface PropertyAttributes {
	id: string;
	name: string;
	locationId: string;
}
export interface LocationAttributes {
	id: string;
	country: string;
	state: string;
	zone: string;
	neighborhood: string;
}

export interface CreatePropertyRequest {
	name: string;
	adultsQty: number;
	childrenQty: number;
	doubleBedsQty: number;
	singleBedsQty: number;
	hasAirConditioning: boolean;
	hasWifi: boolean;
	hasGarage: boolean;
	isHouseOrApt: boolean;
	distanceToBeach: number;
	country: string;
	state: string;
	zone: string;
	neighborhood: string;
	imageRoutes: string[];
	ownerEmail: string;
	pricePerNight: number;
}
export interface DeleteBookingRequest {
	id: string;
	email?: string;
	propertyId?: string; //esto no va a venir en el request, pero lo agrego porque se necesita luego para el sync delete.
	checkIn?: Date;
	checkOut?: Date;
}
export interface CreateSensorRequest {
	id: string;
	description: string;
	serialNumber: string;
	brand: string;
	direction: string;
	date: Date;
	typeOfService: string;
	observableProperty: any;
}
export interface AssignSensorRequest {
	sensorId: string;
	propertyId: string;
}
export interface CreateBookingRequest {
	name: string;
	surname: string;
	email: string;
	phoneNumber: string;
	locationId: string;
	nationality: string;
	checkIn: Date;
	checkOut: Date;
	adultsGuestsQty: number;
	childrenGuestsQty: number;
	propertyId: string;
	documentId: string;
	type: string;
	userId: string;
}

export interface GetBookingRequest {
	id: string;
	email: string;
	loggedEmail: string;
}

export interface GetBookingData {
	id: string;
	name: string;
	surname: string;
	email: string;
	phoneNumber: string;
	location: string;
	maxNumberOfGuests: number;
	checkIn: Date;
	checkOut: Date;
	status: string;
}

export interface SubscribeToPropertyRequest {
	propertyId: string;
	userId: string;
	services: string[];
}

export interface CustomRequest extends Request {
	email?: string;
	newImageRoutes?: string[];
}
export interface SensorDTO {
	sensorId: string;
	propertyId: string;
	typeOfService: string;
	priority: number;
	observableProperty: JSON;
}
export interface MsgSensorNotification {
	sensorId: string;
	propertyId: string;
	dateTime: string;
	problem: string;
	[key: string]: number | string;
}
export interface ServicesNotificationData {
	emails: string[];
	message: BookingNotificationData | PaymentNotificationData;
	typeOfService: Service;
}
export interface PaymentNotificationData {
	subject: string;
	content: string;
}
export interface BookingNotificationData {
	subject: string;
	content: string;
}
export enum Service {
	Booking = "Booking",
	Sensor = "Properties",
	Payment = "Payment",
	Security = "Security",
	Others = "Others",
	Manteinance = "Manteinance",
	Administration = "Administration",
}
export interface SubscriptionInstance {
	propertyId: string;
	userId: string;
	service: string;
}
export interface GetPropertiesQueryParams {
	fromDate?: Date;
	toDate?: Date;
	adultsQty?: number;
	childrenQty?: number;
	doubleBedsQty?: number;
	singleBedsQty?: number;
	hasAirConditioning?: boolean;
	hasWifi?: boolean;
	hasGarage?: boolean;
	isHouseOrApt?: string;
	distanceToBeach?: number;
	state?: string;
	zone?: string;
	neighborhood?: string;
	page?: number;
	pageSize?: number;
}
export interface PropertyDTO {
	id: string;
	name: string;
	adultsQty: number;
	childrenQty: number;
	doubleBedsQty: number;
	singleBedsQty: number;
	hasAirConditioning: boolean;
	hasWifi: boolean;
	hasGarage: boolean;
	isHouseOrApt: string;
	distanceToBeach: number;
	location: {
		country: string;
		state: string;
		zone: string;
		neighborhood: string;
	};
	images: string[];
}
export interface GetPropertiesResponse {
	count: number;
	pages: number;
	currentPage: number;
	results: PropertyDTO[];
}
export interface RequestWithUserEmail extends Request {
	email?: string;
}

export interface UpdateBookingRequest {
	loggedEmail?: string;
	fromDate: Date;
	toDate: Date;
	propertyId: string;
}

export interface CreateBookedDatesRequest {
	checkIn: Date;
	checkOut: Date;
	propertyId: string;
}

export interface GetBookingGeneralRequest {
	fromDate?: Date;
	toDate?: Date;
	propertyId?: string;
	userName?: string;
	userLastName?: string;
	status?: string;
}

export interface GetEarningsByPropertyParams {
	id: string;
	fromDate: Date;
	toDate: Date;
}
export interface GetBookingRatioRequest {
	fromDate: Date;
	toDate: Date;
}

export interface PayBookingRequest {
	id: string;
	cardNumber: string;
	cvv: string;
	expirationDate: string;
}

export interface SensorPropertyDTO {
	serialNumber: string;
	description: string;
	brand: string;
	direction: string;
	typeOfService: string;
	priority: number;
}

export interface GetEmailsRequest {
	propertyId: string;
}

export interface BookingWithUserEmail {
	id?: string;
	userId?: string;
	propertyId?: string;
	checkIn?: Date;
	checkOut?: Date;
	status?: string;
	"user.email"?: string;
}
