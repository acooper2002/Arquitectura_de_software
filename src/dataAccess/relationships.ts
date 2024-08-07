import { BookedDates } from "./BookedDates";
import { Booking } from "./Booking";
import { Document } from "./Document";
import { Image } from "./Image";
import { Location } from "./Location";
import { Property } from "./Property";
import { Sensor } from "./Sensor";
import { User } from "./User";
import { Subscription } from "./UserPropertySubscription";

export const setRelationships = async () => {
	//Booking
	Booking.belongsTo(User, {
		foreignKey: "userId",
		as: "user",
	});
	Booking.belongsTo(Property, {
		foreignKey: "propertyId",
		as: "property",
	});

	//Document
	Document.hasOne(User, {
		foreignKey: "documentId",
		as: "user",
	});

	//Image
	Image.belongsTo(Property, {
		foreignKey: "propertyId",
		as: "property",
	});
	Property.hasMany(Image, {
		foreignKey: "propertyId",
		as: "images",
	});

	//Location
	Location.hasMany(Property, {
		foreignKey: "locationId",
		as: "properties",
	});

	//Property
	Property.belongsTo(Location, {
		foreignKey: "locationId",
		as: "location",
	});
	BookedDates.belongsTo(Property, {
		foreignKey: "propertyId",
		as: "property",
	});
	Property.hasMany(BookedDates, {
		foreignKey: "propertyId",
		as: "bookedDays",
	});

	Property.hasMany(Subscription, {
		foreignKey: "propertyId",
		as: "subscriptions",
	});

	//Sensor
	Sensor.belongsTo(Property, {
		foreignKey: "propertyId",
		as: "property",
	});

	//User
	User.belongsTo(Document, {
		foreignKey: "documentId",
		as: "document",
	});
};
