import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const BookedDates = sequelize.define(
	"BookedDates",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		propertyId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Properties",
				key: "id",
			},
		},
		day: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
	},
	{
		tableName: "BookedDates",
		timestamps: false,
		indexes: [
			{
				fields: ["propertyId", "day"],
			},
			{
				fields: ["day"],
			},
		],
	},
);
