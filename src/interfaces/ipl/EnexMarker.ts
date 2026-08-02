// https://gtamods.com/wiki/ENEX
// Entrance and exit markers

export default interface EnexMarker {
	entrancePosition: { x: number, y: number, z: number }, // Marker center
	enterAngle: number, // Assumingly used for CJ's walking direction
	entrySize: { x: number, y: number, z: number }, // Z is always 8... Presume this is a spherical trigger area
	exitPosition: { x: number, y: number, z: number },
	exitAngle: number, // Exit rotation in degrees
	targetInterior: number,	// Interior World ID
	flags: EnexFlag, // Marker Flags, See EnexFlag enum
	name: string, // Used to find counter part ENEX and for mission scripts.
	sky: number, // Sky Color changing
	numPedsToSpawn: number, // Number of peds to spawn in interior
	timeOn: number, // Enables the marker at this time
	timeOff: number, // Disables the marker at this time
}

// Some of these flags are.. weird.
export enum EnexFlag {

	// Self Documented
	USE_PAIRED = 0, // Maybe means use the linked marker, or use previously entered marker?
	UNKNOWN_9 = 9, // No idea
	UNKNOWN_6 = 6, // Also, no idea, (Mission related?)

	// Wiki Documented
	// Some info here: https://gtamods.com/wiki/Saves_(GTA_SA)

	UNKNOWN_INTERIOR = 1, // Only used for interior markers
	UNKNOWN_PAIRING = 2, // Used mostly for interior markers. Also Big Ear & LS Skyscraper - Disable "walk through door" task
	CREATE_LINKED_PAIR = 4, // Pair with unflagged mate during new game start
	REWARD_INTERIOR = 8, // Sets flag 0010 on pair mate when used
	USED_REWARD_ENTRANCE = 16, // Set by accessing reward interior
	CARS_AND_AIRCRAFT = 32, // Enable for cars and aircraft
	BIKES_AND_MOTORCYCLES = 64, // Enable for bikes and motorcycles
	DISABLE_ON_FOOT = 128, // No foot traffic. Use for cars and/or bikes only
	ACCEPT_NPC_GROUP = 256, // Group members accepted at destination of pair (passengers stripped)
	FOOD_DATE_FLAG = 512, // Set and cleared by food date (cut-scene related)
	UNKNOWN_BURGLARY = 1024, // Set on Bayside and Temporary Burglary doors
	DISABLE_EXIT = 2048, // Player can enter but cannot exit a two-way pair
	BURGLARY_ACCESS = 4096, // Enabled and disabled during Burglary
	ENTERED_WITHOUT_EXIT = 8192, // Set by Entrance, Cleared by Exit; Applies to one side of a two
	ENABLE_ACCESS = 16384, // Enabled by default; often cleared by scripts
	DELETE_ENEX = 32768, // Enex is deleted when used
}