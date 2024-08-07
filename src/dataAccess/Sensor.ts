import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Sensor = sequelize.define(
	"Sensor",
	{
		id: {
			type: DataTypes.STRING(15),
			primaryKey: true,
			validate: {
				len: [1, 15],
			},
		},
		propertyId: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "Properties",
				key: "id",
			},
		},
		description: {
			type: DataTypes.STRING(200),
			validate: {
				len: [1, 200],
			},
			allowNull: false,
		},
		serialNumber: {
			type: DataTypes.STRING(45),
			validate: {
				len: [1, 45],
			},
			allowNull: false,
		},
		brand: {
			type: DataTypes.STRING(50),
			validate: {
				max: 50,
			},
			allowNull: false,
		},
		direction: {
			type: DataTypes.STRING(1000),
			validate: {
				len: [1, 1000],
			},
			allowNull: false,
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		typeOfService: {
			type: DataTypes.STRING(),
			allowNull: false,
		},
		priority: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		observableProperty: {
			type: DataTypes.JSON,
			allowNull: false,
		},
	},
	{
		tableName: "Sensors",
		timestamps: false,
		indexes: [
			{
				fields: ["propertyId"],
			},
		],
	},
);
