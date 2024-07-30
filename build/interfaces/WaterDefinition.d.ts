declare enum WaterType {
    VISIBLE_OCEAN = 0,
    INVISIBLE_OCEAN = 1,
    VISIBLE_POOL = 2,
    INVISIBLE_POOL = 3
}
interface WaterPoint {
    x: number;
    y: number;
    z: number;
    speedX: number;
    speedY: number;
    unknown: number;
    waveHeight: number;
}
export default interface WaterDefinition {
    point1: WaterPoint;
    point2: WaterPoint;
    point3: WaterPoint;
    point4?: WaterPoint;
    waterType: WaterType;
}
export {};
