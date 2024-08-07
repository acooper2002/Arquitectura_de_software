import { getSensor } from "../../services/sensorService";
import {
	AlertConfig,
	type MeasureData,
	type MeasureDataComplete,
	type SensorConfig,
} from "../data-structure/Measure";

//Se fija que cada uno de los datos de entrada no sean nulos
export const filter1 = async (input: MeasureData): Promise<MeasureData> => {
	for (const key of Object.keys(input)) {
		if (input[key as keyof MeasureData] === "") {
			throw new Error("Some fields are empty. Please fill all fields.");
		}
	}
	return input;
};

//Se fija que el sensorId sea correcto y que este asociado a una propiedad
export const filter2 = async (input: MeasureData): Promise<MeasureData> => {
	const sensor = await getSensor(input.sensorId);
	if (!sensor) {
		throw new Error("Sensor not found");
	}
	if (!sensor.propertyId) {
		throw new Error("Sensor not assigned to a property");
	}
	return input;
};

//Le pone prioridad a los datos para que vayan más rapido por el pipeline
export const filter3 = async (input: MeasureData): Promise<MeasureData> => {
	const sensor = await getSensor(input.sensorId);
	return {
		...input,
		priority: sensor.priority,
	};
};

//Se fija que los valores sean correctos (Entre min y max)
export const filter4 = async (input: MeasureData): Promise<MeasureData> => {
	if (input.priority === 1) {
		return input;
	}
	const sensor = await getSensor(input.sensorId);
	const sensorConfig = sensor.observableProperty;
	evaluateMinMaxValue(input, { sensorId: sensor.sensorId, sensorConfig });
	return input;
};

//Se fija que la medida cumpla con la expresion regular de la alerta
export const filter5 = async (input: MeasureData): Promise<MeasureData> => {
	if (input.priority === 1) {
		return input;
	}
	const sensor = await getSensor(input.sensorId);
	const measureDataValue = takeMeasureData(input);
	if (typeof measureDataValue[1] === "number") {
		measureDataValue[1] = Math.floor(measureDataValue[1]);
		measureDataValue[1] = measureDataValue[1].toString();
	}
	const configJson = takeSensorConfigSpecificData(input, {
		sensorId: sensor.sensorId,
		sensorConfig: sensor.observableProperty,
	});
	const config = configJson as unknown as SensorConfig;
	let alert = "";
	let unit = "";
	for (const key in config) {
		if (key === "Unit") {
			unit = config[key];
		}
		if (key === "Alert") {
			alert = config[key];
		}
	}
	if (alert !== "") {
		if (unit !== "") {
			if (alert.includes(unit)) {
				measureDataValue[1] = measureDataValue[1] + unit;
			}
		}
		const regex = new RegExp(alert);
		if (regex.test(measureDataValue[1])) {
			return input;
		} else {
			throw new Error("Measure does not match with alert");
		}
	}
	throw new Error("Alert not found");
};

//Le pone el tipo de servicio y la propiedadId a los datos
export const filter6 = async (
	input: MeasureData,
): Promise<MeasureDataComplete> => {
	const sensor = await getSensor(input.sensorId);
	const output = {
		...input,
		service: sensor.typeOfService,
		propertyId: sensor.propertyId,
	};
	return output;
};

function takeSensorConfigSpecificData(
	data: MeasureData,
	config: SensorConfig,
): JSON {
	const dataValues = takeMeasureData(data);
	const measure = dataValues[0];
	for (const key in data) {
		if (key === measure) {
			for (const key2 in config) {
				if (key2 === "sensorConfig") {
					const specificConfig = JSON.parse(config[key2]);
					for (const key3 in specificConfig) {
						if (key3 === measure) {
							return specificConfig[key3];
						}
					}
				}
			}
		}
	}
	throw new Error("Dint find the measure");
}

function takeMeasureData(
	data: MeasureData,
): [string | number, string | number] {
	const dataValues = [];
	for (const key in data) {
		dataValues.push(key);
		dataValues.push(data[key]);
	}
	const measure = dataValues[4];
	const dataMeasure = dataValues[5];
	return [measure, dataMeasure];
}

function evaluateMinMaxValue(data: MeasureData, config: SensorConfig): void {
	const dataValues = takeMeasureData(data);
	const dataMeasure = dataValues[1] as number;
	var min: number | undefined = undefined;
	var max: number | undefined = undefined;
	const sensorConfigData = takeSensorConfigSpecificData(data, config) as {
		[key: string]: any;
	};
	for (const key in sensorConfigData) {
		if (key === "min") min = sensorConfigData[key];
		if (key === "max") max = sensorConfigData[key];
	}
	if (min !== undefined && max !== undefined) {
		if (dataMeasure < min || dataMeasure > max) {
			throw new Error("Some values are out of range.");
		}
	}
}
