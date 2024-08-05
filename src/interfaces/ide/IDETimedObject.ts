import IDEObject from "./IDEObject";

// https://gta.fandom.com/wiki/IDE#TOBJ
export default interface IDETimedObject extends IDEObject {
	timeOn: number,
	timeOff: number,
}