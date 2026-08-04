/**
 * Which network a node belongs to. A single area file holds both, vehicle
 * nodes first and pedestrian nodes after them.
 */
export declare enum PathNodeType {
    Vehicle = "vehicle",
    Pedestrian = "pedestrian"
}
/**
 * A link from one path node to another. Links are stored on both endpoints,
 * so walking every node's links visits each connection twice - once from
 * each end.
 */
export interface PathLink {
    areaId: number;
    nodeId: number;
}
export default interface PathNode {
    areaId: number;
    nodeId: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    type: PathNodeType;
    links: PathLink[];
    pathWidth: number;
    floodFill: number;
    flags: number;
}
