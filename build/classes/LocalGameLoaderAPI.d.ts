import IDEObject from "../interfaces/ide/IDEObject";
import IDETimedObject from "../interfaces/ide/IDETimedObject";
import MainIPL from "../interfaces/MainIPL";
import WaterDefinition from "../interfaces/WaterDefinition";
import WeatherDefinition from "../interfaces/WeatherDefinition";
import GameLoaderAPI from "./GameLoaderAPI";
import GameLoader from "..";
import TXDFile from "@majesticfudgie/txd-reader/build/interfaces/TXDFile";
import GeometryNode from "@majesticfudgie/dff-reader/build/interfaces/GeometryNode";
import IDEAnimatedObject from "../interfaces/ide/IDEAnimatedObject";
import AudioStream from "@majesticfudgie/sfx-reader/build/interfaces/AudioStream";
import SoundEffect from "@majesticfudgie/sfx-reader/build/interfaces/SoundEffect";
export default class LocalGameLoaderAPI implements GameLoaderAPI {
    protected loader: GameLoader;
    constructor(loader: GameLoader);
    getDFF(filepath: string): Promise<GeometryNode | null>;
    getTXD(filepath: string): Promise<TXDFile | null>;
    getTexture(txdPath: string, textureName: string): Promise<Uint8Array | null>;
    getIDEObject(id: number): Promise<IDEObject | IDETimedObject | IDEAnimatedObject | null>;
    getIPL(): Promise<MainIPL[]>;
    getWeather(): Promise<{
        [key: string]: WeatherDefinition[];
    }>;
    getWeatherDefinitions(): Promise<WeatherDefinition[]>;
    getWater(): Promise<WaterDefinition[]>;
    getLanguageString(key: string): Promise<string | null>;
    getLanguageData(language: string): Promise<import("../interfaces/language/GXTFile").default | null>;
    getVehicles(): Promise<import("../interfaces/vehicles/VehicleDefinition").default[]>;
    getVehicleColorPalette(): Promise<import("../interfaces/Color").default[]>;
    getVehicleColors(): Promise<import("../interfaces/vehicles/VehicleColor").default[]>;
    getVehicleHandling(): Promise<import("../interfaces/vehicles/handling/VehicleHandlingDefinitions").default>;
    getStreamTrack(streamName: string, trackId: number): Promise<import("@majesticfudgie/sfx-reader/build/interfaces/sfx/StreamTrack").default>;
    getAudioStream(streamName: string): Promise<AudioStream>;
    getSoundEffect(packageName: string, bankIndex: number, slotIndex: number): Promise<SoundEffect>;
    toWAV(effect: SoundEffect): Promise<Uint8Array>;
    on(eventName: string | symbol, listener: (...args: any[]) => void): GameLoader;
}
