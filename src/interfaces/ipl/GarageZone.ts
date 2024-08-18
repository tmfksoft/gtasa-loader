// https://gtamods.com/wiki/GRGE
// Garages, huzzah!
// They have an... interesting way to define garages.

export default interface GarageZone {
	position: { x: number, y: number, z:number }, // A coordinate of one of the corner marks
	lineX: number, // Those values are added to the first position values. They define one edge of the box
	lineY: number, // ^ See above
	cube: { x: number, y: number, z: number }, // Another world coordinate. Together with the abstract line created with the first 5 coordinates this forms a cube in the world.
	flags: number, // The garage behaviour
	type: number, // Garage Type, See https://gtamods.com/wiki/Garage#San_Andreas
	name: string, // Name for scripts, See https://gtamods.com/wiki/Garage#San_Andreas_2
}
