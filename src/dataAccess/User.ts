import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const User = sequelize.define(
	"User",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		documentId: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: "Documents",
				key: "id",
			},
		},
		role: {
			type: DataTypes.ENUM("ADMIN", "OPERATOR", "TENANT", "OWNER"),
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING(30),
			validate: {
				len: [3, 30],
			},
			allowNull: false,
		},
		lastName: {
			type: DataTypes.STRING(30),
			validate: {
				len: [3, 30],
			},
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true,
			},
			unique: true,
			allowNull: false,
		},
		phoneNumber: {
			type: DataTypes.STRING(15),
			validate: {
				len: [8, 15],
			},
			allowNull: false,
		},
		nationality: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: "Users",
		timestamps: false,
		indexes: [
			{
				fields: ["role"],
			},
		],
	},
);
