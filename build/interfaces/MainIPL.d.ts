import AudioZone from "./ipl/AudioZone";
import CullZone from "./ipl/CullZone";
import IPLObject from "./ipl/IPLObject";
export default interface MainIPL {
    name: string;
    iplObjects: IPLObject[];
    streamedObjects: IPLObject[];
    cullZones: CullZone[];
    audioZones: AudioZone[];
}
