export default interface IPLObject {
    id: number;
    modelName: string;
    interior: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    scale?: {
        x: number;
        y: number;
        z: number;
    };
    lod: number;
    lodObject?: IPLObject;
    iplIndex: number;
}
