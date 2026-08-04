import PathNode from "./PathNode";
/**
 * One parsed NODES<areaId>.DAT file. The map is divided into an 8x8 grid of
 * areas, each with its own file, and a node's links may cross into a
 * neighbouring area - so resolving a link means looking up the target area
 * by its id, not assuming it's this one.
 */
export default interface PathArea {
    areaId: number;
    nodes: PathNode[];
    vehicleNodeCount: number;
    pedestrianNodeCount: number;
}
