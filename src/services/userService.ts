import type { Model } from "sequelize";
import { User } from "../dataAccess/User";
import type { UserAttributes } from "../utils/types";

export const getUser = async (
	email: string,
): Promise<Model<UserAttributes> | null> => {
	if (!email) throw new Error("Email is required");
	return await User.findOne({ where: { email } });
};

export const getUserById = async (id: string): Promise<UserAttributes> => {
	if (!id) throw new Error("Id is required");
	const user = await User.findByPk(id);
	if (!user) throw new Error("User not found");
	return user.get();
};
