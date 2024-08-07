import { sleep } from "k6";
import http from "k6/http";

const TOKEN =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Ik1hdGhpYXM5NkBnbWFpbC5jb20iLCJyb2xlIjoiVEVOQU5UIiwiaWF0IjoxNzE4ODUwMzY3LCJleHAiOjE3MTg4NTM5Njd9.k2Ukg3ItlruXfVXelPkZHjUHmLXI3E4xrsKtnOqStFs";

// Configura las opciones del test
export const options = {
	stages: [
		{ duration: "30s", target: 10 }, // ramp up to 10 users over 30 seconds
		{ duration: "30s", target: 20 }, // stay at 10 users for 1 minute
		{ duration: "30s", target: 300 }, // ramp down to 0 users over 30 seconds
	],
};

export default function () {
	//get properties
	http.get("http://localhost:3000/api/properties", {
		headers: {
			Authorization: `Bearer ${TOKEN}`,
		},
	});

	// post booking
	http.post(
		"http://localhost:3000/api/bookings",
		{
			name: "Matias",
			surname: "Gonzalez",
			email: "Mathias96@gmail.com",
			phoneNumber: "0104499843",
			locationId: "712b26e6-566c-4dfa-8edc-b7cb216218ba",
			nationality: "Argentina",
			checkIn: "2026-04-01",
			checkOut: "2026-04-10",
			adultsGuestsQty: 2,
			childrenGuestsQty: 1,
			propertyId: "0002230c-b219-458c-9be5-b8de968a3c97",
			documentId: "mBXTQiGFSKztcwMANXTlrPQhyeuGtT",
			type: "cedula",
			userId: "001d0eb6-dbf4-47c2-8824-984718e1c5b0",
		},
		{
			headers: {
				Authorization: `Bearer ${TOKEN}`,
			},
		},
	);

	//pay booking
	http.patch(
		"http://localhost:3000/api/bookings/000adfd5-680b-4855-b2ff-1685fa3127f2/pay",
		{
			cardNumber: "1234567890123456",
			cvv: "123",
			expirationDate: "06/27",
		},
		{
			headers: {
				Authorization: `Bearer ${TOKEN}`,
			},
		},
	);

	sleep(1);
}
