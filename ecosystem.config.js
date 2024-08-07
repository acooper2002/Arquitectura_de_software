module.exports = {
	apps: [
		{
			name: "backend",
			script: "dist/src/app.js",
			instances: 8, // se puede cambiar
		},
		{
			name: "payment",
			script: "dist/payment/app.js",
			instances: 2, // se puede cambiar
		},
	],
};
