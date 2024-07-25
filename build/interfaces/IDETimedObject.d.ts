export default interface IDETimedObject {
    id: number;
    modelName: string;
    textureName: string;
    objectCount: number;
    drawDistance: number[];
    flags: number;
    timeOn: number;
    timeOff: number;
}
