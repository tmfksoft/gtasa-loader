"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Which game an installation directory belongs to.
 *
 * The three share most of their data formats but differ in enough places
 * (archive version, RenderWare version, IPL/IDE columns, which files are
 * listed vs implicit) that the loader needs to know which one it's looking
 * at rather than assuming San Andreas.
 */
var GameVersion;
(function (GameVersion) {
    GameVersion["III"] = "III";
    GameVersion["ViceCity"] = "ViceCity";
    GameVersion["SanAndreas"] = "SanAndreas";
})(GameVersion || (GameVersion = {}));
exports.default = GameVersion;
//# sourceMappingURL=GameVersion.js.map