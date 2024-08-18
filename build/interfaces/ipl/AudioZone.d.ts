interface BaseAudioZone {
    name: string;
    id: number;
    switch: number;
}
export interface CubeAudioZone extends BaseAudioZone {
    position1: {
        x: number;
        y: number;
        z: number;
    };
    position2: {
        x: number;
        y: number;
        z: number;
    };
}
export interface SphereAudioZone extends BaseAudioZone {
    position: {
        x: number;
        y: number;
        z: number;
    };
    radius: number;
}
type AudioZone = CubeAudioZone | SphereAudioZone;
export default AudioZone;
