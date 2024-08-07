import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Image = sequelize.define(
	"Image",
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
		path: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: "Images",
		timestamps: false,
	},
);
