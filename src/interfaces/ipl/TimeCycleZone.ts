// https://gtamods.com/wiki/TCYC
// Overrides/Modifies the current 'weather' in that zone.

export default interface TimeCycleZone {
	position1: { x: number, y: number, z: number },
	position2: { x: number, y: number, z: number },

	farClip: number, // Overrides the current far clip
	extraColor: number, // Selects an ExtraColour from the timecyc.dat
	extraColorIntensity: number, // Interpolation value between current weather and extraColor, 0 = Current Weather
	fallOffDist: number, // "the size of the region around the box in which to interpolate between the box' and the outside weather (default 100.0)."
	lodDistMultiplier: number, // Multiplies the "low LOD draw distance"
}