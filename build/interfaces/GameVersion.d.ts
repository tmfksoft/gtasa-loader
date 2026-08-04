/**
 * Which game an installation directory belongs to.
 *
 * The three share most of their data formats but differ in enough places
 * (archive version, RenderWare version, IPL/IDE columns, which files are
 * listed vs implicit) that the loader needs to know which one it's looking
 * at rather than assuming San Andreas.
 */
declare enum GameVersion {
    III = "III",
    ViceCity = "ViceCity",
    SanAndreas = "SanAndreas"
}
export default GameVersion;
