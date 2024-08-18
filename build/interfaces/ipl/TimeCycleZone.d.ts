export default interface TimeCycleZone {
    position1: {
        x: number;
        y: number;
        z: number;
    };
    position2: {
        x: number;
        y: number;
        z: number;
    };
    farClip: number;
    extraColor: number;
    extraColorIntensity: number;
    fallOffDist: number;
    lodDistMultiplier: number;
}
