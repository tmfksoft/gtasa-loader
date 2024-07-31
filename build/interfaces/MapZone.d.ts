export default interface MapZone {
    name: string;
    type: 0 | 3;
    min: {
        x: number;
        y: number;
        z: number;
    };
    max: {
        x: number;
        y: number;
        z: number;
    };
    island: 1 | 2 | 3;
}
