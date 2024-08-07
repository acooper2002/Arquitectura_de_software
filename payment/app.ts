import express from "express";

const app = express();
const port = 3003;
const main = async () => {
	app.use(express.json());
	app.listen(port, async () => {
		console.log(`Server running on http://localhost:${port}`);
	});

	app.post("/api/pay", async (req, res) => {
		const { cardNumber, cvv, expirationDate } = req.body;
		if (cardNumber.length !== 16) {
			res.status(400).json({
				message: "El número de la tarjeta de crédito debe tener 16 dígitos",
			});
			return;
		}
		if (!/^\d+$/.test(cardNumber)) {
			res.status(400).json({
				message:
					"El número de la tarjeta de crédito solo puede contener dígitos",
			});
			return;
		}
		if (cvv.length !== 3) {
			res.status(400).json({ message: "El CVV debe tener 3 dígitos" });
			return;
		}
		if (!/^\d+$/.test(cvv)) {
			res.status(400).json({ message: "El CVV solo puede contener dígitos" });
			return;
		}
		if (!/^\d{2}\/\d{2}$/.test(expirationDate)) {
			res.status(400).json({
				message: "La fecha de expiración debe tener el formato MM/AA",
			});
			return;
		}
		const [month, year] = expirationDate.split("/");
		if (Number.parseInt(month) < 1 || Number.parseInt(month) > 12) {
			res
				.status(400)
				.json({ message: "El mes de expiración debe estar entre 1 y 12" });
			return;
		}
		if (Number.parseInt(year) < 24) {
			res
				.status(400)
				.json({ message: "El año de expiración no puede ser menor al actual" });
			return;
		}
		if (
			Number.parseInt(month) > new Date().getMonth() + 1 &&
			Number.parseInt(year) === new Date().getFullYear() - 2000
		) {
			res
				.status(400)
				.json({ message: "El año de expiración no puede ser menor al actual" });
			return;
		}

		res.status(200).json({ message: "Pago realizado con éxito" });
	});
};

main();
