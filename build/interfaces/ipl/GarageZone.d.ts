export default interface GarageZone {
    position: {
        x: number;
        y: number;
        z: number;
    };
    lineX: number;
    lineY: number;
    cube: {
        x: number;
        y: number;
        z: number;
    };
    flags: number;
    type: number;
    name: string;
}
