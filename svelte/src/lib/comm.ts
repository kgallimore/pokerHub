export interface SensorUpdate {
	commPort: number;
	sensor: number;
	value: string;
}

export interface CommPortUpdate {
	commPort: number;
	connected: boolean;
	numberOfSensors?: number;
}
