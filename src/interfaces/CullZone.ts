
// https://gtamods.com/wiki/CULL#Attributes
// You can do a simple check for what you're looking for

enum CullZoneType {
	All = -1, // ?
	CamCloseInForPlayer = 1, // III, VC, SA
	CamStairsForPlayer = 2, // III, VC, SA
	Cam1stPersonForPlayer = 4, // III, VC, SA
	PlayerNoRain = 8, // III, VC, SA
	CamNoRain = 8, // III, VC, SA
	NoPolice = 16, // III, VC
	DoINeedToLoadCollision = 64, // III
	UNKNOWN = 128, // III, VC
	PoliceAbondonCars = 256, // III, VC, SA
	InRoomForAudio = 512, // VC, SA
	WaterFudge = 1024, // VC
	MilitaryZone = 4096, // SA
	ExtraAirResistance = 16384, // SA
	FewerCars = 32768, // SA

	// Some unknown zones I've seen
	UNKNOWN2 = 33792, // Seen in LS
}

export default interface CullZone {
	center: { x: number, y: number, z: number }

	// Used to 'skew' the box instead of an outright rotation
	// https://gtamods.com/wiki/Talk:CULL
	xSkewValue: number,
	ySkewValue: number,


	unknown3?: number,

	length: number, // Dimensions of the zone along y-axis.
	width: number, // Dimensions of the zone along x-axis.


	// Unlike length & width we define absolute values
	// Unsure how these related to the center coords,
	top: number,
	bottom: number,

	type: CullZoneType,


	// Mirror stuff is interesting
	// Reading some of the talk on the wiki I get the feeling its a 2D plane that can be translated along a specific axis
	// A vector defines the axis
	mirrorParameters?: {
		x: number,
		y: number,
		z: number,
		Cm: number, // "The Cm value descripes the position of the mirror plane into the direction the direction vector points" -- https://gtamods.com/wiki/Talk:CULL
	}
}