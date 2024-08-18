// https://gtamods.com/wiki/ZONE#Major_files

export default interface MapZone {
	name: string, // GXT String
	type: number, // 0 = Info (Text), 3 = Map zone (Text & Cop Cars)
	min: { x: number, y: number, z: number },
	max: { x: number, y: number, z: number },
	island: number // LS, SF, LV (Referred to as Level)
	text: string, // Also from GXT
}