// https://gtamods.com/wiki/OCCL
export default interface OcclusionZone {
	middleX: number, // Center X of zone
	middleY: number, // Center Y of zone
	bottomZ: number, // Bottom Z of zone
	widthX: number, // X Width in "units"
	widthY: number, // Y Width in "units"
	height: number, // Height of the zone
	rotation: number, // Rotation of the zone in degrees.

	/**
	 * Theres three more parameters mentioned but not explained
	 * H = float
	 * I = float
	 * J = int
	 */
}