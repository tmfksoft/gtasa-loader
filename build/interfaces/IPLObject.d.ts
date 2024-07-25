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
    lod: number;
}
