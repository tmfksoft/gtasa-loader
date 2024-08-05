"use strict";
// Documented from https://gtamods.com/wiki/Item_Definition#IDE_Flags
Object.defineProperty(exports, "__esModule", { value: true });
// These aren't outright used integers, they're referring to bits within the flag integer
var IDEFlags;
(function (IDEFlags) {
    IDEFlags[IDEFlags["IS_ROAD"] = 1] = "IS_ROAD";
    IDEFlags[IDEFlags["DRAW_LAST"] = 4] = "DRAW_LAST";
    IDEFlags[IDEFlags["ADDITIVE"] = 8] = "ADDITIVE";
    IDEFlags[IDEFlags["UNKNOWN_ANIM"] = 32] = "UNKNOWN_ANIM";
    IDEFlags[IDEFlags["NO_ZBUFFER_WRITE"] = 64] = "NO_ZBUFFER_WRITE";
    IDEFlags[IDEFlags["DONT_RECEIVE_SHADOWS"] = 128] = "DONT_RECEIVE_SHADOWS";
    IDEFlags[IDEFlags["IS_GLASS_TYPE_1"] = 512] = "IS_GLASS_TYPE_1";
    IDEFlags[IDEFlags["IS_GLASS_TYPE_2"] = 1024] = "IS_GLASS_TYPE_2";
    IDEFlags[IDEFlags["IS_GARAGE_DOOR"] = 2048] = "IS_GARAGE_DOOR";
    IDEFlags[IDEFlags["IS_DAMAGABLE"] = 4096] = "IS_DAMAGABLE";
    IDEFlags[IDEFlags["IS_TREE"] = 8192] = "IS_TREE";
    IDEFlags[IDEFlags["IS_PALM"] = 16384] = "IS_PALM";
    IDEFlags[IDEFlags["DOES_NOT_COLLIDE_WITH_FLYER"] = 32768] = "DOES_NOT_COLLIDE_WITH_FLYER";
    // These don't have names on the wiki, only examples
    IDEFlags[IDEFlags["UNKNOWN_EXPLOSIVE"] = 65536] = "UNKNOWN_EXPLOSIVE";
    IDEFlags[IDEFlags["UNKNOWN_CHOPCOP"] = 131072] = "UNKNOWN_CHOPCOP";
    IDEFlags[IDEFlags["UNKNOWN_PLEASURE"] = 262144] = "UNKNOWN_PLEASURE";
    IDEFlags[IDEFlags["IS_TAG"] = 1048576] = "IS_TAG";
    IDEFlags[IDEFlags["DISABLE_BACKFACE_CULLING"] = 2097152] = "DISABLE_BACKFACE_CULLING";
    IDEFlags[IDEFlags["IS_BREAKABLE_STATUE"] = 4194304] = "IS_BREAKABLE_STATUE";
})(IDEFlags || (IDEFlags = {}));
exports.default = IDEFlags;
//# sourceMappingURL=IDEFlags.js.map