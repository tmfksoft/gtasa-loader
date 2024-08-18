export default interface MapZone {
    name: string;
    type: number;
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
    island: number;
    text: string;
}
