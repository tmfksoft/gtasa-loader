export default interface VehicleColor {
    modelName: string;
    colorPairs: ({
        color1: number;
        color2: number;
    } | {
        color1: number;
        color2: number;
        color3: number;
        color4: number;
    })[];
}
