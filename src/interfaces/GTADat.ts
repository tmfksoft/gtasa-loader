export default interface GTADat {
	img: string[],
	ide: string[],
	ipl: string[],
	splash: string[],
	txd: string[],
	dff: string[],

	// GTA III and Vice City list their collision archives here rather than
	// bundling them inside the IMG the way San Andreas does. Empty for SA.
	colFile: string[],

	// GTA III's map zone definition (a single MAPZONE line). Unused by SA.
	mapZone: string[],
}