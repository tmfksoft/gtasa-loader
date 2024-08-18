import AudioZone from "./AudioZone";
import CullZone from "./CullZone";
import EnexMarker from "./EnexMarker";
import GarageZone from "./GarageZone";
import IPLObject from "./IPLObject";
import ItemPickup from "./ItemPickup";
import MapZone from "./MapZone";
import OcclusionZone from "./OcclusionZone";
import TimeCycleZone from "./TimeCycleZone";
export default interface ParsedIPL {
    name: string | string[];
    inst: IPLObject[];
    cull: CullZone[];
    auzo: AudioZone[];
    occl: OcclusionZone[];
    tcyc: TimeCycleZone[];
    enex: EnexMarker[];
    grge: GarageZone[];
    zone: MapZone[];
    pick: ItemPickup[];
    path: any[];
}
