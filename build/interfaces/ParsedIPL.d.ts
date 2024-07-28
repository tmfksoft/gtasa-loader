import CullZone from "./CullZone";
import IPLObject from "./IPLObject";
export default interface ParsedIPL {
    name: string | string[];
    inst: IPLObject[];
    cull: CullZone[];
}
