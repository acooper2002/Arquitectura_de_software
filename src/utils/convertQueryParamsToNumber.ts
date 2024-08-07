import type { NextFunction, Request, Response } from "express";
import type { GetPropertiesQueryParams } from "./types";

export const convertQueryParamsToNumber = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const params: GetPropertiesQueryParams = req.query;

	if (params.adultsQty)
		params.adultsQty = Number.parseInt(params.adultsQty as unknown as string);
	if (params.childrenQty)
		params.childrenQty = Number.parseInt(
			params.childrenQty as unknown as string,
		);
	if (params.doubleBedsQty)
		params.doubleBedsQty = Number.parseInt(
			params.doubleBedsQty as unknown as string,
		);
	if (params.singleBedsQty)
		params.singleBedsQty = Number.parseInt(
			params.singleBedsQty as unknown as string,
		);
	if (params.distanceToBeach)
		params.distanceToBeach = Number.parseInt(
			params.distanceToBeach as unknown as string,
		);

	next();
};
