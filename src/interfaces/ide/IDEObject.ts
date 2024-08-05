// https://gta.fandom.com/wiki/IDE#OBJS
export default interface IDEObject {
	id: number,
	modelName: string, // DFF File minus extension
	textureName: string, // TXD File minus extension
	objectCount: number,
	drawDistance: number[],
	flags: number,	
}