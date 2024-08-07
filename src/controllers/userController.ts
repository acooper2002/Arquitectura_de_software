import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { logError } from "../elasticSearchClient";
import * as userService from "../services/userService";

export const login = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		const user = await userService.getUser(email);

		if (!user) throw new Error("User not found");

		const token = jwt.sign(
			{
				email: user.getDataValue("email"),
				role: user.getDataValue("role"),
			},
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		res.status(200).send({ message: "User logged in", token: token });
	} catch (error: any) {
		logError(error);
		res.status(401).send({ message: error.message });
	}
};
