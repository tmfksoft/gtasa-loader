// https://gtamods.com/wiki/Paths_(GTA_SA)

/**
 * Which network a node belongs to. A single area file holds both, vehicle
 * nodes first and pedestrian nodes after them.
 */
export enum PathNodeType {
	Vehicle = "vehicle",
	Pedestrian = "pedestrian",
}

/**
 * A link from one path node to another. Links are stored on both endpoints,
 * so walking every node's links visits each connection twice - once from
 * each end.
 */
export interface PathLink {
	// Which area file the target node lives in. Links can cross into a
	// neighbouring area, so this isn't necessarily the owning node's area.
	areaId: number,
	// Index of the target node within that area's node list.
	nodeId: number,
}

export default interface PathNode {
	// Which area file this node came from (NODES<areaId>.DAT).
	areaId: number,
	// Index of this node within its own area's node list - this is what a
	// PathLink's nodeId refers to.
	nodeId: number,

	// Game world coordinates.
	position: { x: number, y: number, z: number },

	type: PathNodeType,

	// Already resolved from the area's link table, so consumers never need
	// to deal with the on-disk base-index/count encoding.
	links: PathLink[],

	// Roughly how wide the path is here, in units of 0.125m. Meaningful for
	// vehicle nodes (lane width); pedestrian nodes tend to leave it at 0.
	pathWidth: number,

	// Connected-component id the game uses to tell whether a route between
	// two nodes can exist at all without searching for it.
	floodFill: number,

	// Raw flags word. The low nibble is the link count (already applied to
	// `links` above); the remaining bits carry things like whether the node
	// is a dead end, in water, or a parking spot. Left unparsed rather than
	// guessed at - see the wiki page above.
	flags: number,
}
