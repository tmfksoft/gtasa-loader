// Documented from https://gtamods.com/wiki/Item_Definition#IDE_Flags

// These aren't outright used integers, they're referring to bits within the flag integer

enum IDEFlags {
	IS_ROAD = 0x1, // This model is a road, Possibly used for visual effects?
	DRAW_LAST = 0x4, // Model is/has transparency, draw last. - e.g. Fences, trees
	ADDITIVE = 0x8, // Render with additive blending, enables DRAW_LAST too - e.g. Night windows
	UNKNOWN_ANIM = 0x20, // Works only with animated objects ('anim' section in IDE) - e.g. Doors
	NO_ZBUFFER_WRITE = 0x40, // Disable writing to z-buffer when rendering this model, allowing transparencies of other objects, shadows, and lights to be visible through this object. - e.g. Shadows, Lights
	DONT_RECEIVE_SHADOWS = 0x80, // Don't draw shadows on this object - e.g. Small objects, pickups, lamps, trees
	IS_GLASS_TYPE_1 = 0x200, // Breakable glass type 1 (additional parameters defined inside the object.dat file, otherwise there is no effect) - e.g. Small windows
	IS_GLASS_TYPE_2 = 0x400, // Breakable glass type 2: object first cracks on a strong collision, then it breaks (does also require object.dat registration).	Large windows
	IS_GARAGE_DOOR = 0x800, // Indicates an object as an garage door (for more information see GRGE – requires object.dat registration).
	IS_DAMAGABLE = 0x1000, // Model with ok/dam states. - e.g. Vehicle upgrades, barriers
	IS_TREE = 0x2000, // Trees and some plants. These objects move in wind. e.g. Trees, some plants
	IS_PALM = 0x4000, // Palms. These objects move on wind.
	DOES_NOT_COLLIDE_WITH_FLYER = 0x8000, // Does not collide with flyer (plane or heli). - e.g. Trees, street lights, traffic lights, road signs, telegraph pole

	// These don't have names on the wiki, only examples
	UNKNOWN_EXPLOSIVE = 0x10000, // Explosive things
	UNKNOWN_CHOPCOP = 0x20000, // chopcop_ models (what)
	UNKNOWN_PLEASURE = 0x40000, // pleasure-DL.dff - This appears to be some railings and other decorative stuff from Pleasure Domes
	IS_TAG = 0x100000, // As in Spray Tag, Object will switch from mesh 2 to mesh 1 after getting sprayed by the player.
	DISABLE_BACKFACE_CULLING = 0x200000, // Disables backface culling – as an result the texture will be drawed on both sides of the model. -	e.g. Roads, houses, trees, vehicle parts
	IS_BREAKABLE_STATUE = 0x400000, // Object with this model can't be used as cover, i.e. peds won't try to cover behind this object. - e.g. Statue parts in atrium
}
export default IDEFlags;