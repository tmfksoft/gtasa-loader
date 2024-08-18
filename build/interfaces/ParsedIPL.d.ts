import AudioZone from "./ipl/AudioZone";
import CullZone from "./ipl/CullZone";
import IPLObject from "./ipl/IPLObject";
import OcclusionZone from "./ipl/OcclusionZone";
export default interface ParsedIPL {
    name: string | string[];
    inst: IPLObject[];
    cull: CullZone[];
    auzo: AudioZone[];
    occl: OcclusionZone[];
    path: any[];
    enex: any[];
}
