import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Document = sequelize.define(
	"Document",
	{
		id: {
			type: DataTypes.STRING(30),
			primaryKey: true,
			validate: {
				is: /^[a-zA-Z0-9.-]+$/,
				len: [1, 30],
			},
		},
		type: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
	},
	{
		tableName: "Documents",
		timestamps: false,
	},
);
