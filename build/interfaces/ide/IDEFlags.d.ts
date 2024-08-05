declare enum IDEFlags {
    IS_ROAD = 1,// This model is a road, Possibly used for visual effects?
    DRAW_LAST = 4,// Model is/has transparency, draw last. - e.g. Fences, trees
    ADDITIVE = 8,// Render with additive blending, enables DRAW_LAST too - e.g. Night windows
    UNKNOWN_ANIM = 32,// Works only with animated objects ('anim' section in IDE) - e.g. Doors
    NO_ZBUFFER_WRITE = 64,// Disable writing to z-buffer when rendering this model, allowing transparencies of other objects, shadows, and lights to be visible through this object. - e.g. Shadows, Lights
    DONT_RECEIVE_SHADOWS = 128,// Don't draw shadows on this object - e.g. Small objects, pickups, lamps, trees
    IS_GLASS_TYPE_1 = 512,// Breakable glass type 1 (additional parameters defined inside the object.dat file, otherwise there is no effect) - e.g. Small windows
    IS_GLASS_TYPE_2 = 1024,// Breakable glass type 2: object first cracks on a strong collision, then it breaks (does also require object.dat registration).	Large windows
    IS_GARAGE_DOOR = 2048,// Indicates an object as an garage door (for more information see GRGE – requires object.dat registration).
    IS_DAMAGABLE = 4096,// Model with ok/dam states. - e.g. Vehicle upgrades, barriers
    IS_TREE = 8192,// Trees and some plants. These objects move in wind. e.g. Trees, some plants
    IS_PALM = 16384,// Palms. These objects move on wind.
    DOES_NOT_COLLIDE_WITH_FLYER = 32768,// Does not collide with flyer (plane or heli). - e.g. Trees, street lights, traffic lights, road signs, telegraph pole
    UNKNOWN_EXPLOSIVE = 65536,// Explosive things
    UNKNOWN_CHOPCOP = 131072,// chopcop_ models (what)
    UNKNOWN_PLEASURE = 262144,// pleasure-DL.dff - This appears to be some railings and other decorative stuff from Pleasure Domes
    IS_TAG = 1048576,// As in Spray Tag, Object will switch from mesh 2 to mesh 1 after getting sprayed by the player.
    DISABLE_BACKFACE_CULLING = 2097152,// Disables backface culling – as an result the texture will be drawed on both sides of the model. -	e.g. Roads, houses, trees, vehicle parts
    IS_BREAKABLE_STATUE = 4194304
}
export default IDEFlags;
