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

	// GTA III and Vice City store a per-instance scale that San Andreas
	// dropped. Absent (rather than 1,1,1) on SA placements so callers can
	// tell "not scaled" from "no scale in this format".
	scale?: {
		x: number,
		y: number,
		z: number,
	},

	// San Andreas only - index of the lower detail instance to swap to.
	// -1 where the format has no LOD concept (III and Vice City).
	lod: number,

	lodObject?: IPLObject,

	iplIndex: number,
}