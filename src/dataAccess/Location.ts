import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Location = sequelize.define(
	"Location",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		country: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		state: {
			//Estado
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		zone: {
			//Balneario
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		neighborhood: {
			//Barrio
			type: DataTypes.STRING(100),
			allowNull: false,
		},
	},
	{
		tableName: "Locations",
		timestamps: false,
		indexes: [
			{
				fields: ["country", "state", "zone", "neighborhood"],
			},
			{
				fields: ["country", "state", "zone"],
			},
			{
				fields: ["country", "state"],
			},
			{
				fields: ["country"],
			},
			{
				fields: ["state"],
			},
			{
				fields: ["zone"],
			},
			{
				fields: ["neighborhood"],
			},
		],
	},
);
