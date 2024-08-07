import { faker } from "@faker-js/faker";
import { BookedDates } from "../dataAccess/BookedDates";
import { Booking } from "../dataAccess/Booking";
import { CancellationPolicy } from "../dataAccess/CancellationPolicy";
import { Document } from "../dataAccess/Document";
import { Location } from "../dataAccess/Location";
import { Property } from "../dataAccess/Property";
import { Sensor } from "../dataAccess/Sensor";
import { User } from "../dataAccess/User";
import { Subscription } from "../dataAccess/UserPropertySubscription";
import { logError } from "../elasticSearchClient";

export const seed = async () => {
	const documents = Array.from({ length: 1000 }, () => ({
		id: faker.string.alpha(30),
		type: faker.helpers.arrayElement(["cedula", "pasaporte", "licencia"]),
	}));

	const users = Array.from({ length: 1000 }, (_, i) => ({
		id: faker.string.uuid(),
		documentId: documents[i].id,
		role: faker.helpers.arrayElement(["ADMIN", "OPERATOR", "TENANT", "OWNER"]),
		name: faker.person.firstName(),
		lastName: faker.person.lastName(),
		email: faker.internet.email(),
		phoneNumber: faker.string.numeric(10),
		nationality: faker.location.country(),
	}));

	//make an array of unique countries, given the users nationality
	const countries = Array.from(new Set(users.map((user) => user.nationality)));

	const firstTenTenants = users
		.filter((user) => user.role === "TENANT")
		.slice(0, 10);
	const firstTenOwners = users
		.filter((user) => user.role === "OWNER")
		.slice(0, 10);

	const firstHundredTenants = users
		.filter((user) => user.role === "TENANT")
		.slice(0, 100);
	const firstHundredOwners = users
		.filter((user) => user.role === "OWNER")
		.slice(0, 100);

	const locations = Array.from({ length: 200 }, () => ({
		id: faker.string.uuid(),
		country: faker.location.country(),
		state: faker.location.state(),
		zone: faker.location.city(),
		neighborhood: faker.location.streetAddress(),
	}));

	const properties = Array.from({ length: 200 }, (_, i) => ({
		id: faker.string.uuid(),
		name: faker.word.noun(),
		adultsQty: faker.number.int({ min: 1, max: 20 }),
		childrenQty: faker.number.int({ min: 0, max: 20 }),
		doubleBedsQty: faker.number.int({ min: 0, max: 10 }),
		singleBedsQty: faker.number.int({ min: 0, max: 20 }),
		hasAirConditioning: faker.datatype.boolean(),
		hasWifi: faker.datatype.boolean(),
		hasGarage: faker.datatype.boolean(),
		isHouseOrApt: faker.helpers.arrayElement(["1", "2"]),
		distanceToBeach: faker.number.int({ min: 50, max: 20000 }),
		locationId: faker.helpers.arrayElement(locations).id,
		ownerId: faker.helpers.arrayElement(firstHundredOwners).id,
		pricePerNight: faker.number.int({ min: 20, max: 1000 }),
	}));

	const measurements = [
		{
			HumidityEnvironment: {
				Unit: "%",
				Alert: "^([6-9][0-9]|[1-9][0-9]{2,})%$",
			},
		},
		{
			Temperature: {
				Unit: "°C",
				max: "100",
				min: "-30",
				Alert: "^(?:-(1[0-9]|20)|([5-9][0-9]|[1-9][0-9]{2,}))$",
			},
		},
		{
			WindSpeed: {
				Unit: "m/s",
				max: "20",
				min: "0",
				Alert: "^(1[5-9])$",
			},
		},
		{
			Rain: {
				Unit: "mm",
				max: "70",
				min: "0",
				Alert: "^(5[0-9]|6[0-9]|70)$",
			},
		},
		{
			Pressure: {
				Unit: "hPa",
				max: "120",
				min: "15",
				Alert: "^(9[1-9]|[1-9][0-9]{2,})$",
			},
		},
		{
			Smoke: {
				Unit: "ppm",
				max: "100",
				min: "0",
				Alert: "^(6[0-9]|7[0-9]|8[0-9]|9[0-9]|100)$",
			},
		},
		{
			"Long grass": {
				Message: "The grass is too long",
			},
		},
		{
			Electricity: {
				Message: "No light at the kitchen",
			},
		},
		{
			Water: {
				Message: "No water in the bathroom",
			},
		},
		{
			Plumber: {
				Message: "Broken pipe in the kitchen",
			},
		},
		{
			Keys: {
				Message: "Lost keys",
			},
		},
	];

	const daysStay = Array.from({ length: 1000 }, () =>
		faker.number.int({ min: 1, max: 30 }),
	);

	const bookings = Array.from({ length: 1000 }, (_, i) => {
		const checkIn = new Date(
			faker.date
				.between({ from: new Date(), to: new Date(2026, 1, 1) })
				.setHours(0, 0, 0, 0),
		);
		const checkOut = new Date(checkIn);
		checkOut.setDate(checkOut.getDate() + daysStay[i]);

		return {
			id: faker.string.uuid(),
			userId: firstHundredTenants[faker.number.int(99)].id,
			propertyId: faker.helpers.arrayElement(properties).id,
			checkIn: checkIn,
			checkOut: checkOut,
			status: faker.helpers.arrayElement([
				"PENDING",
				"ACCEPTED",
				"PAID",
				"CANCELLED_BY_TENANT",
				"CANCELLED_BY_ADMIN",
			]),
		};
	});
	const priority = [2, 5, 3, 3, 2, 5, 1, 2, 2, 3, 1];
	const topics = [
		"Others",
		"Security",
		"Security",
		"Security",
		"Security",
		"Security",
		"Manteinance",
		"Manteinance",
		"Manteinance",
		"Manteinance",
		"Administration",
	];

	const sensors = Array.from({ length: 1000 }, (_, i) => {
		var randomIndex = faker.number.int({ min: 0, max: 10 });
		var id = faker.string.alphanumeric(15);
		return {
			id: id,
			propertyId: faker.helpers.arrayElement(properties).id,
			description: faker.lorem.sentence(),
			serialNumber: faker.string.alphanumeric(45),
			brand: faker.company.name(),
			direction: faker.string.alphanumeric(1000),
			date: faker.date.past(),
			typeOfService: topics[randomIndex],
			priority: priority[randomIndex],
			observableProperty: JSON.stringify({
				sensorId: id,
				...measurements[randomIndex],
			}),
		};
	});

	const subscriptions = Array.from({ length: 1000 }, (_, i) => ({
		propertyId: faker.helpers.arrayElement(properties).id,
		userId: faker.helpers.arrayElement(users).id,
		service: faker.helpers.arrayElement([
			"Security",
			"Manteinance",
			"Administration",
			"Others",
		]),
	}));

	const bookedDates: {
		id: string;
		propertyId: string;
		day: number;
	}[] = [];
	bookings.forEach((booking) => {
		if (booking.status === "ACCEPTED" || booking.status === "PAID") {
			const days = Math.floor(
				(booking.checkOut.getTime() - booking.checkIn.getTime()) /
					(1000 * 60 * 60 * 24),
			);
			for (let i = 0; i < days; i++) {
				bookedDates.push({
					id: faker.string.uuid(),
					propertyId: booking.propertyId,
					day: new Date(
						booking.checkIn.getTime() + 1000 * 60 * 60 * 24 * i,
					).setHours(0, 0, 0, 0),
				});
			}
		}
	});

	const cancellationPolicies = countries.map((country) => ({
		id: faker.string.uuid(),
		country: country,
		daysBeforeCheckIn: faker.number.int({ min: 1, max: 30 }),
		percentage: faker.number.int({ min: 0, max: 100 }),
	}));

	await Document.bulkCreate(documents);
	await User.bulkCreate(users);
	await Location.bulkCreate(locations);
	await Property.bulkCreate(properties);
	await Sensor.bulkCreate(sensors);
	await Booking.bulkCreate(bookings);
	await BookedDates.bulkCreate(bookedDates);
	await CancellationPolicy.bulkCreate(cancellationPolicies);
	await Subscription.bulkCreate(subscriptions);
};

(async () => {
	try {
		await seed();
		console.log("Database seeded successfully");
	} catch (error) {
		logError(error);
		console.error("Failed to seed database", error);
	}
})();
