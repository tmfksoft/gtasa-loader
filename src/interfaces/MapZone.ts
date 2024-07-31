// https://gtamods.com/wiki/ZONE#Major_files

export default interface MapZone {
	name: string,
	type: 0 | 3, // 0 = Info (Text), 3 = Map zone (Text & Cop Cars)
	min: { x: number, y: number, z: number },
	max: { x: number, y: number, z: number },
	island: 1 | 2 | 3 // LS, SF, LV
}