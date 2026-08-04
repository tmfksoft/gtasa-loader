"use strict";
// https://gtamods.com/wiki/Paths_(GTA_SA)
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathNodeType = void 0;
/**
 * Which network a node belongs to. A single area file holds both, vehicle
 * nodes first and pedestrian nodes after them.
 */
var PathNodeType;
(function (PathNodeType) {
    PathNodeType["Vehicle"] = "vehicle";
    PathNodeType["Pedestrian"] = "pedestrian";
})(PathNodeType || (exports.PathNodeType = PathNodeType = {}));
//# sourceMappingURL=PathNode.js.map