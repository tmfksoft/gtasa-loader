import Geometry from "@majesticfudgie/dff-reader/build/interfaces/Geometry";
import IDEObject from "../interfaces/IDEObject";
import IDETimedObject from "../interfaces/IDETimedObject";
import MainIPL from "../interfaces/MainIPL";
import WaterDefinition from "../interfaces/WaterDefinition";
import WeatherDefinition from "../interfaces/WeatherDefinition";
import GameLoaderAPI from "./GameLoaderAPI";
import GameLoader from "..";
import TXDFile from "@majesticfudgie/txd-reader/build/interfaces/TXDFile";
export default class LocalGameLoaderAPI implements GameLoaderAPI {
    protected loader: GameLoader;
    constructor(loader: GameLoader);
    getDFF(filepath: string): Promise<Geometry[] | null>;
    getTXD(filepath: string): Promise<TXDFile | null>;
    getTexture(txdPath: string, textureName: string): Promise<Blob | null>;
    getIDEObject(id: number): Promise<IDEObject | IDETimedObject | null>;
    getIPL(): Promise<MainIPL[]>;
    getWeather(): Promise<WeatherDefinition[]>;
    getWater(): Promise<WaterDefinition[]>;
}
