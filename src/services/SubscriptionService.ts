import { Model } from "sequelize";
import { Property } from "../dataAccess/Property";
import { User } from "../dataAccess/User";
import { Subscription } from "../dataAccess/UserPropertySubscription";
import { logError } from "../elasticSearchClient";
import {
	type Service,
	SubscriptionInstance,
	type UserAttributes,
} from "../utils/types";
import { getUserById } from "./userService";

export const suscribeUserToProperty = async (
	propertyId: string,
	userId: string,
	services: string[],
): Promise<void> => {
	try {
		const property = await Property.findByPk(propertyId);
		if (!property) throw new Error("Property not found");
		const user = await User.findByPk(userId);
		if (!user) throw new Error("User not found");
		for (const service of services) {
			await Subscription.create({ userId, propertyId, service });
		}
	} catch (error: any) {
		logError(error);
		throw new Error(error.message);
	}
};

export const getPropertySubscribers = async (
	propertyId: string,
	service: Service,
	role?: string,
): Promise<UserAttributes[]> => {
	try {
		const subscriptions = await Subscription.findAll({
			where: { propertyId, service },
			attributes: ["userId"],
		});
		const userIds: string[] = subscriptions.map((subscription) =>
			subscription.getDataValue("userId"),
		);
		const users = await Promise.all(userIds.map((id) => getUserById(id)));
		if (role) return users.filter((user) => user.role === role);
		return users;
	} catch (error: any) {
		logError(error);
		throw new Error(error.message);
	}
};
