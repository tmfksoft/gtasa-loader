// https://gta.fandom.com/wiki/Item_Placement#INST
export default interface IPLObject {
	id: number, // Refers to an IDE object
	modelName: string, // DFF file, minus extension
	interior: number,
	position: {
		x: number,
		y: number,
		z: number,
	},
	// Rotation in Quaternions.
	rotation: {
		x: number,
		y: number,
		z: number,
		w: number,
	},
	lod: number,

	lodObject?: IPLObject,

	iplIndex: number,
}