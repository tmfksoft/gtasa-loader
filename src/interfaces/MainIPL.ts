import IPLObject from "./IPLObject";

export default interface MainIPL {
	name: string,
	iplObjects: IPLObject[],
	streamedObjects: IPLObject[],
}