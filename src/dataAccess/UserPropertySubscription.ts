import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Subscription = sequelize.define(
	"Subscription",
	{
		propertyId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Properties",
				key: "id",
			},
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
			},
		},
		service: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: "Subscriptions",
		paranoid: true,
		timestamps: false,
	},
);
