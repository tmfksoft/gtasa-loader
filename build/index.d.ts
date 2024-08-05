import GTADat from "./interfaces/GTADat";
import IDEObject from "./interfaces/ide/IDEObject";
import IDETimedObject from "./interfaces/ide/IDETimedObject";
import IMGReader from "@majesticfudgie/img-reader";
import DFFReader from "@majesticfudgie/dff-reader";
import TXDReader from "@majesticfudgie/txd-reader";
import ParsedIPL from "./interfaces/ParsedIPL";
import MainIPL from "./interfaces/MainIPL";
import WeatherDefinition from "./interfaces/WeatherDefinition";
import WaterDefinition from "./interfaces/WaterDefinition";
import Language from "./interfaces/Language";
import GameLoaderAPI from "./classes/GameLoaderAPI";
import LanguageReader from "./classes/LanguageReader";
import VehicleDefinition from "./interfaces/vehicles/VehicleDefinition";
import IDESection from "./interfaces/ide/IDESection";
import Color from "./interfaces/Color";
import VehicleColor from "./interfaces/vehicles/VehicleColor";
import IDEAnimatedObject from "./interfaces/ide/IDEAnimatedObject";
/**
 * Simple GTA SanAndreas Game Loader
 *
 * This library loads resources from the GTA:SA Installation provided.
 * Currently it doesn't load all data and has a long way to go.
 *
 * Currently you can fetch DFF and TXD files which returns the DFF and TXD Readers.
 * This allows reading and converting models and textures on the fly.
 */
declare class GameLoader {
    protected gtaPath: string;
    API: GameLoaderAPI;
    gtaData: GTADat;
    loadedIPLs: MainIPL[];
    ideObjects: IDEObject[];
    ideTimedObjects: IDETimedObject[];
    ideAnimatedObjects: IDEAnimatedObject[];
    waterDefinitions: WaterDefinition[];
    vehicleDefinitions: VehicleDefinition[];
    vehicleColorPalette: Color[];
    vehicleColors: VehicleColor[];
    weatherDefinitions: WeatherDefinition[];
    imgReaders: {
        [key: string]: IMGReader;
    };
    imgContents: {
        [key: string]: string;
    };
    language: Language;
    languageReaders: {
        [key: string]: LanguageReader;
    };
    constructor(gtaPath: string);
    loadGTADat(): void;
    loadWaterDefinitions(): void;
    parseBinaryIPL(name: string | string[], data: Buffer | Buffer[]): ParsedIPL;
    parseTextIPL(name: string | string[], data: Buffer | Buffer[]): ParsedIPL;
    loadIPL(): void;
    loadIDE(): void;
    getObject(id: number): IDEObject | IDETimedObject | IDEAnimatedObject | null;
    loadIMG(): void;
    getAssociatedIMG(filename: string): string | null;
    parsePath(filePath: string): {
        archive: string;
        file: string;
    };
    /**
     * Attempts to fetch a file that either resides on disk or in an IMG archive
     *
     * Supported paths:
     *
     *  DATA\MAPS\LA\LAe.ipl - File on Disk
     * 	LAe_stream0.ipl - File in IMG
     *  MODELS\gta3.img\LAe_stream0.ipl
     *
     * @param filename
     * @returns
     */
    getFile(filename: string): Buffer | null;
    getIMGReader(imgFile: string): IMGReader | null;
    getDFF(filename: string): DFFReader | null;
    getTXD(filename: string): TXDReader | null;
    /**
     * Returns a PNG of the supplied texture path.
     * Null if the texture doesn't exist.
     * @param txdPath Path to TXD, can be on disk or within an .img
     * @param textureName Name of texture within the TXD.
     */
    getTexture(txdPath: string, textureName: string): Promise<Buffer | null>;
    loadWeather(): void;
    loadLanguages(): void;
    readLanguageString(gxtKey: string): string | null;
    loadCarCols(): void;
    /**
     * Parses an IDE styled formatted file and returns all found sections and their lines.
     * The expected format is the section name, section contents followed by the keyword "end"
     *
     * Comments can begin with // or with #
     * Blank lines are skipped.
     * @param data
     */
    parseIDEFormat(data: Buffer): IDESection[];
    load(): Promise<void>;
}
export default GameLoader;
