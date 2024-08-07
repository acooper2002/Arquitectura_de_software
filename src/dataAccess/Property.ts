import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Property = sequelize.define(
	"Property",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		adultsQty: {
			type: DataTypes.SMALLINT,
			allowNull: false,
			validate: {
				min: 1,
				max: 20,
			},
		},
		childrenQty: {
			type: DataTypes.SMALLINT,
			allowNull: false,
			validate: {
				min: 0,
				max: 20,
			},
		},
		doubleBedsQty: {
			type: DataTypes.SMALLINT,
			allowNull: false,
			validate: {
				min: 0,
				max: 10,
			},
		},
		singleBedsQty: {
			type: DataTypes.SMALLINT,
			validate: {
				min: 0,
				max: 20,
			},
			allowNull: false,
		},
		hasAirConditioning: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		hasWifi: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		hasGarage: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		isHouseOrApt: {
			type: DataTypes.ENUM("1", "2"), // 1 = House, 2 = Apartment
			allowNull: false,
		},
		distanceToBeach: {
			type: DataTypes.SMALLINT,
			allowNull: false,
			validate: {
				min: 50,
				max: 20000,
			},
		},
		locationId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Locations",
				key: "id",
			},
		},
		ownerId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
			},
		},
		pricePerNight: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 0,
				max: 10000,
			},
		},
	},
	{
		tableName: "Properties",
		timestamps: false,
		indexes: [
			{
				fields: ["childrenQty", "adultsQty"],
			},
			{
				fields: ["doubleBedsQty", "singleBedsQty"],
			},
			{
				fields: ["distanceToBeach"],
			},
			{
				fields: ["hasWifi"],
			},
			{
				fields: ["hasAirConditioning"],
			},
			{
				fields: ["hasGarage"],
			},
			{
				fields: ["isHouseOrApt"],
			},
			{
				fields: ["locationId"],
			},
			{
				fields: ["ownerId"],
			},
		],
	},
);
