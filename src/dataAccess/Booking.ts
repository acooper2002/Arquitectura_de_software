import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Booking = sequelize.define(
	"Booking",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
			},
		},
		propertyId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Properties",
				key: "id",
			},
		},
		checkIn: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		checkOut: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM(
				"PENDING",
				"ACCEPTED",
				"PAID",
				"CANCELLED_BY_TENANT",
				"CANCELLED_BY_ADMIN",
				"CANCELLED_BY_OWNER",
				"CANCELLED_NOT_PAID",
			),
			allowNull: false,
		},
	},
	{
		tableName: "Bookings",
		paranoid: true,
		timestamps: false,
		indexes: [
			{
				fields: ["checkIn", "checkOut"],
			},
			{
				fields: ["userId"],
			},
			{
				fields: ["propertyId"],
			},
		],
	},
);
