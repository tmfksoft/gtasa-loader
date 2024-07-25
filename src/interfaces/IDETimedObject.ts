// https://gta.fandom.com/wiki/IDE#TOBJ
export default interface IDETimedObject {
	id: number,
	modelName: string, // DFF file minus the extension,
	textureName: string, // TXD file minus the extension,
	objectCount: number,
	drawDistance: number[],
	flags: number,
	timeOn: number,
	timeOff: number,
}