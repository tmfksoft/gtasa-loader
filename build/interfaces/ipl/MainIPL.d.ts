import AudioZone from "./AudioZone";
import CullZone from "./CullZone";
import EnexMarker from "./EnexMarker";
import GarageZone from "./GarageZone";
import IPLObject from "./IPLObject";
import ItemPickup from "./ItemPickup";
import MapZone from "./MapZone";
import OcclusionZone from "./OcclusionZone";
import TimeCycleZone from "./TimeCycleZone";
export default interface MainIPL {
    name: string;
    iplObjects: IPLObject[];
    streamedObjects: IPLObject[];
    cullZones: CullZone[];
    audioZones: AudioZone[];
    occlusionZones: OcclusionZone[];
    timeCycleZones: TimeCycleZone[];
    enexMarkers: EnexMarker[];
    garageZones: GarageZone[];
    mapZones: MapZone[];
    itemPickups: ItemPickup[];
}
