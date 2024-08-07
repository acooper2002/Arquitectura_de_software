import type { NextFunction, Response } from "express";
import jwt, { type VerifyErrors } from "jsonwebtoken";
import type { Role } from "./types";
import type { CustomRequest } from "./types";

export const requireRole =
	(roles: Role[]) => (req: CustomRequest, res: Response, next: NextFunction) =>
		authenticateToken(roles, req, res, next);

const authenticateToken = (
	roles: Role[],
	req: CustomRequest,
	res: Response,
	next: NextFunction,
) => {
	const token: string | undefined = req.headers?.authorization?.split(" ")[1];

	if (!token) {
		return res.status(401).send({ message: "JWT token is required" });
	}

	jwt.verify(
		token,
		process.env.JWT_SECRET as string,
		(err: VerifyErrors | null, decoded: any) => {
			if (err) {
				return res.status(403).send({ message: "JWT token not valid" });
			}

			const role = decoded.role;
			if (!roles.includes(role)) {
				return res.status(403).send({
					message: "You do not have permission to access this resource",
				});
			}

			req.email = decoded.email; // Add the email to the request object, to access it in the controllers
			next();
		},
	);
};
