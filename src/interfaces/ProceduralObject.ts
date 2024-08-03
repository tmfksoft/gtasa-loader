/**
 * The definition for proceedurally placed objects.
 * What isn't clear is how many objects per surface, maybe this is calculated on the fly?
 * How we know what the surface of an object is and what surface types relate to.
 * 
 * The object name refers to the object defined in maps/generic/procobj.ide
 * procobj.ide seems to follow the same format as standard IDE files.
 */


// All known surface types
export const SurfaceType = [
	"P_SAND",
	"P_SAND_DENSE",
	"P_SAND_ARID",
	"P_SAND_COMPACT",

	"P_GRASS_SHORT",
	"P_GRASS_DRY",
	"P_GRASSBRNMIX",

	"P_GRASSMID1",
	"P_ROADSIDE",
	"P_BUSHYDRY",
	"P_WOODLAND",
	"P_FORESTSTUMPS",
	"P_FLOWERBED",
	"P_WASTEGROUND",
	"P_MOUNTAIN",
	"P_UNDERWATERBARREN",
];

// Documentation taken literally from procobj.dat
export default interface ProceduralObject {
	surfaceType: string, // the name of the surface to apply the objects to
	objectName: string, // the name of the object to be generated
	spacing: number, // the average spacing of the objects, the objects will be placed on average of 1 object every n square metres
	minDist: number, // no objects created closer than this
	minRot: number, // the minimum rotation in degrees
	maxRot: number, // the maximum rotation in degrees
	minScale: number, // the min scale of the object in x and y (ignored if the object is dynamic) - NOTE: the collision will not be scaled
	maxScale: number, // the max scale of the object in x and y  (ignored if the object is dynamic) - NOTE: the collision will not be scaled
	minScaleZ: number, // the min scale of the object in z (ignored if the object is dynamic) - NOTE: the collision will not be scaled
	maxScaleZ: number, // the max scale of the object in z (ignored if the object is dynamic) - NOTE: the collision will not be scaled
	zOffsetMin: number, // min offset to add to the object's height
	zOffsetMax: number, // maxoffset to add to the object's height
	alignNormal: boolean, // whether to align the object to the surface normal
	useGrid: boolean, // whether to place the objects in a rigid grid formation or randomly across the triangle
}