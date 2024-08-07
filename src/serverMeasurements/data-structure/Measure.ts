export interface MeasureData {
	sensorId: string;
	dateTime: string;
	priority: number;
	[key: string]: number | string;
}
export interface SensorMeasure {
	sensorId: string;
	dateTime: string;
	[key: string]: number | string;
}

export interface MeasureDataComplete {
	sensorId: string;
	dateTime: string;
	service: string;
	priority: number;
	propertyId: string;
	[key: string]: number | string;
}

export interface SensorConfig {
	sensorId: string;
	alert?: AlertConfig;
	[key: string]: any; // Permite cualquier propiedad adicional
}

export interface AlertConfig {
	regex: string;
}
export interface MsgSensorNotification {
	sensorId: string;
	propertyId: string;
	dateTime: string;
	problem: string;
	[key: string]: number | string;
}
