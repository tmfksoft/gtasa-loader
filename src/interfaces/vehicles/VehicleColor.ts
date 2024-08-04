export default interface VehicleColor {
	modelName: string, // Refers to the DFF name
	colorPairs: ({
		color1: number,
		color2: number,
	} | {
		color1: number,
		color2: number,
		color3: number,
		color4: number,
	})[],
}