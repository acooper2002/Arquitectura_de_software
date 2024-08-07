import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const CancellationPolicy = sequelize.define(
	"CancellationPolicy",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		country: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		daysBeforeCheckIn: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		percentage: {
			type: DataTypes.INTEGER,
			validate: {
				min: 0,
				max: 100,
			},
			allowNull: false,
		},
	},
	{
		tableName: "CancellationPolicies",
		timestamps: false,
	},
);
