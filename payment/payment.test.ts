import { expect, test } from "@jest/globals";
import axios from "axios";

// THE PAYMENT SERVER NEEDS TO BE RUNNING

interface PaymentData {
	cardNumber?: string;
	cvv?: string;
	expirationDate?: string;
}

function makePayment(data: PaymentData) {
	return axios.post("http://localhost:3003/api/pay", {
		cardNumber: data.cardNumber,
		cvv: data.cvv,
		expirationDate: data.expirationDate,
	});
}

test("correct payment", async () => {
	const data = {
		cardNumber: "1234567890123456",
		cvv: "123",
		expirationDate: "06/27",
	};
	const response = await makePayment(data);
	expect(response.status).toBe(200);
});

test("incorrect card number", async () => {
	const data = {
		cardNumber: "45",
		cvv: "123",
		expirationDate: "06/27",
	};
	try {
		await makePayment(data);
		fail("Expected makePayment to throw an AxiosError with status code 400");
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 400) {
			expect(error.response.data.message).toBe(
				"El número de la tarjeta de crédito debe tener 16 dígitos",
			);
		} else {
			fail("Expected an AxiosError with status code 400");
		}
	}
});

test("incorrect cvv", async () => {
	const data = {
		cardNumber: "1234567890123456",
		cvv: "1",
		expirationDate: "06/27",
	};
	try {
		await makePayment(data);
		fail("Expected makePayment to throw an AxiosError with status code 400");
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 400) {
			expect(error.response.data.message).toBe("El CVV debe tener 3 dígitos");
		} else {
			fail("Expected an AxiosError with status code 400");
		}
	}
});

test("incorrect expiration date", async () => {
	const data = {
		cardNumber: "1234567890123456",
		cvv: "123",
		expirationDate: "0627",
	};
	try {
		await makePayment(data);
		fail("Expected makePayment to throw an AxiosError with status code 400");
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 400) {
			expect(error.response.data.message).toBe(
				"La fecha de expiración debe tener el formato MM/AA",
			);
		} else {
			fail("Expected an AxiosError with status code 400");
		}
	}
});
