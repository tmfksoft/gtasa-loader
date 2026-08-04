import PathNode from "./PathNode";

/**
 * One parsed NODES<areaId>.DAT file. The map is divided into an 8x8 grid of
 * areas, each with its own file, and a node's links may cross into a
 * neighbouring area - so resolving a link means looking up the target area
 * by its id, not assuming it's this one.
 */
export default interface PathArea {
	// Matches the number in the filename, and what a PathLink's areaId means.
	areaId: number,

	// Vehicle nodes first, then pedestrian nodes - a node's index in here is
	// its nodeId. Split counts are below if you want to slice it directly.
	nodes: PathNode[],

	vehicleNodeCount: number,
	pedestrianNodeCount: number,
}
