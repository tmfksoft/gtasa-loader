import IDEObject from "./IDEObject";
export default interface IDETimedObject extends IDEObject {
    timeOn: number;
    timeOff: number;
}
