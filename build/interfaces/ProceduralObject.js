"use strict";
/**
 * The definition for proceedurally placed objects.
 * What isn't clear is how many objects per surface, maybe this is calculated on the fly?
 * How we know what the surface of an object is and what surface types relate to.
 *
 * The object name refers to the object defined in maps/generic/procobj.ide
 * procobj.ide seems to follow the same format as standard IDE files.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurfaceType = void 0;
// All known surface types
exports.SurfaceType = [
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
//# sourceMappingURL=ProceduralObject.js.map