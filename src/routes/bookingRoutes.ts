import { Router } from "express";
import * as bookingController from "../controllers/bookingController";
import { requireRole } from "../utils/authorization";

const router = Router();

router.post(
	"/bookings",
	requireRole(["TENANT"]),
	bookingController.createBooking,
);
router.patch(
	"/bookings",
	requireRole(["OWNER"]),
	bookingController.updateBooking,
); //TODO: ver si hay una forma mas RESTful
router.get("/bookings", requireRole(["TENANT"]), bookingController.getBooking);
router.get(
	"/bookings/general",
	requireRole(["ADMIN", "OPERATOR"]),
	bookingController.getBookingGeneral,
);
router.delete(
	"/bookings/:id",
	requireRole(["TENANT"]),
	bookingController.deleteBooking,
);
router.get(
	"/bookings/ratio",
	requireRole(["TENANT", "OPERATOR"]),
	bookingController.getBookingRatio,
);
router.patch(
	"/bookings/:id/pay",
	requireRole(["TENANT"]),
	bookingController.payBooking,
);

export default router;
