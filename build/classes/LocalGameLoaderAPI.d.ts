import IDEObject from "../interfaces/IDEObject";
import IDETimedObject from "../interfaces/IDETimedObject";
import MainIPL from "../interfaces/MainIPL";
import WaterDefinition from "../interfaces/WaterDefinition";
import WeatherDefinition from "../interfaces/WeatherDefinition";
import GameLoaderAPI from "./GameLoaderAPI";
import GameLoader from "..";
import TXDFile from "@majesticfudgie/txd-reader/build/interfaces/TXDFile";
import GeometryNode from "@majesticfudgie/dff-reader/build/interfaces/GeometryNode";
export default class LocalGameLoaderAPI implements GameLoaderAPI {
    protected loader: GameLoader;
    constructor(loader: GameLoader);
    getDFF(filepath: string): Promise<GeometryNode | null>;
    getTXD(filepath: string): Promise<TXDFile | null>;
    getTexture(txdPath: string, textureName: string): Promise<Uint8Array | null>;
    getIDEObject(id: number): Promise<IDEObject | IDETimedObject | null>;
    getIPL(): Promise<MainIPL[]>;
    getWeather(): Promise<WeatherDefinition[]>;
    getWater(): Promise<WaterDefinition[]>;
    getLanguageString(key: string): Promise<string | null>;
    getLanguageData(language: string): Promise<import("../interfaces/language/GXTFile").default | null>;
    getVehicles(): Promise<import("../interfaces/vehicles/VehicleDefinition").default[]>;
    getVehicleColorPalette(): Promise<import("../interfaces/Color").default[]>;
    getVehicleColors(): Promise<import("../interfaces/vehicles/VehicleColor").default[]>;
}
