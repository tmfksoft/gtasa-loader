import GTADat from "./interfaces/GTADat";
import IDEObject from "./interfaces/ide/IDEObject";
import IDETimedObject from "./interfaces/ide/IDETimedObject";
import IMGReader from "@majesticfudgie/img-reader";
import DFFReader from "@majesticfudgie/dff-reader";
import TXDReader from "@majesticfudgie/txd-reader";
import COLModel from "@majesticfudgie/col-reader/build/interfaces/COLModel";
import IFPReader from "@majesticfudgie/ifp-reader";
import IFPAnimation from "@majesticfudgie/ifp-reader/build/interfaces/IFPAnimation";
import PixelData from "@majesticfudgie/txd-reader/build/interfaces/PixelData";
import ParsedIPL from "./interfaces/ipl/ParsedIPL";
import MainIPL from "./interfaces/ipl/MainIPL";
import WeatherDefinition from "./interfaces/WeatherDefinition";
import WaterDefinition from "./interfaces/WaterDefinition";
import GameVersion from "./interfaces/GameVersion";
import PathArea from "./interfaces/paths/PathArea";
import PathNode, { PathLink, PathNodeType } from "./interfaces/paths/PathNode";
import Language from "./interfaces/Language";
import GameLoaderAPI from "./classes/GameLoaderAPI";
import LanguageReader from "./classes/LanguageReader";
import VehicleDefinition from "./interfaces/vehicles/VehicleDefinition";
import IDESection from "./interfaces/ide/IDESection";
import Color from "./interfaces/Color";
import VehicleColor from "./interfaces/vehicles/VehicleColor";
import IDEAnimatedObject from "./interfaces/ide/IDEAnimatedObject";
import IDEFlags from "./interfaces/ide/IDEFlags";
import VehicleHandlingDefinitions from "./interfaces/vehicles/handling/VehicleHandlingDefinitions";
import EventEmitter from "events";
import SFXReader from "@majesticfudgie/sfx-reader";
/**
 * Simple GTA SanAndreas Game Loader
 *
 * This library loads resources from the GTA:SA Installation provided.
 * Currently it doesn't load all data and has a long way to go.
 *
 * Currently you can fetch DFF and TXD files which returns the DFF and TXD Readers.
 * This allows reading and converting models and textures on the fly.
 *
 * A recent addition is the GameLoader is now an event emitter.
 * The loader will emit loading events and progress as it loads.
 */
declare class GameLoader extends EventEmitter {
    protected gtaPath: string;
    API: GameLoaderAPI;
    loadingStages: number;
    gtaData: GTADat;
    /**
     * Which game `gtaPath` points at - resolved by detectGame() at the very
     * start of load(), since almost everything after that branches on it.
     * Defaults to San Andreas so anything constructed but never loaded keeps
     * behaving the way it always has.
     */
    gameVersion: GameVersion;
    /**
     * The master data file for each game. The name is the most reliable way
     * to tell the three apart - every install has exactly one of these, and
     * it's the file the game itself bootstraps from.
     */
    static readonly GAME_DAT_FILES: {
        version: GameVersion;
        file: string;
    }[];
    /**
     * IMG archives (and the odd IDE) the games mount without listing them in
     * their master .dat, so they have to be added by hand.
     *
     * GTA III and Vice City keep their models in gta3.img and their textures
     * in a separate txd.img, both version 1 archives with a sibling .dir.
     * Animations aren't in an archive at all there - they're a loose
     * anim/ped.ifp - so there's no ANIM.IMG to preload.
     */
    static readonly IMPLICIT_FILES: Record<GameVersion, {
        img: string[];
        ide: string[];
    }>;
    loadedIPLs: MainIPL[];
    ideObjects: IDEObject[];
    ideTimedObjects: IDETimedObject[];
    ideAnimatedObjects: IDEAnimatedObject[];
    waterDefinitions: WaterDefinition[];
    vehicleDefinitions: VehicleDefinition[];
    pathAreas: PathArea[];
    vehicleColorPalette: Color[];
    vehicleColors: VehicleColor[];
    weatherDefinitions: WeatherDefinition[];
    weather: {
        [key: string]: WeatherDefinition[];
    };
    imgReaders: {
        [key: string]: IMGReader;
    };
    imgContents: {
        [key: string]: string;
    };
    collisionModels: Map<string, COLModel>;
    animationPackages: Map<string, IFPReader>;
    language: Language;
    languageReaders: {
        [key: string]: LanguageReader;
    };
    vehicleHandling: VehicleHandlingDefinitions;
    sfx: SFXReader;
    constructor(gtaPath: string);
    /**
     * Works out which game `gtaPath` points at from which master data file
     * is present, and seeds gtaData with the archives that game mounts
     * without listing them.
     *
     * Returns the resolved path to that master file so loadGTADat() doesn't
     * have to look it up a second time.
     */
    detectGame(): string;
    loadGTADat(): void;
    /**
     * Loads the path node network from data/paths/NODES0.DAT .. NODES63.DAT.
     *
     * These hold the waypoint graphs the game drives peds and traffic along.
     * The map is split into an 8x8 grid of areas, one file each, and links
     * can cross between areas - so they're all parsed together and left
     * indexed by area id for lookups to resolve against.
     *
     * File layout, derived by fitting section sizes against the actual byte
     * length of all 64 retail files (exactly one combination fits every one):
     *
     *   header       20 bytes  - the five counts read below
     *   path nodes   numNodes * 28
     *   navi nodes   numNaviNodes * 14  - vehicle lane data, not parsed yet
     *   links        numLinks * 4
     *   ...          further per-link and fixed-size sections, not parsed yet
     *
     * Verified against the retail files: every one of the 143622 links
     * resolves to a real node, and no link leaving a pedestrian node ever
     * targets a vehicle node (or vice versa) - the two networks are separate.
     */
    loadPathNodes(): void;
    loadWaterDefinitions(): void;
    parseBinaryIPL(name: string | string[], data: Buffer | Buffer[]): ParsedIPL;
    parseTextIPL(name: string | string[], data: Buffer | Buffer[]): ParsedIPL;
    loadIPL(): void;
    loadIDE(): void;
    getObject(id: number): IDEObject | IDETimedObject | IDEAnimatedObject | null;
    loadIMG(): void;
    loadCollision(): void;
    private indexCollisionArchive;
    /**
     * Looks up a collision model by name (case-insensitive) - matches the
     * DFF/IDE model name it applies to.
     */
    getCollisionModel(modelName: string): COLModel | null;
    loadAnimations(): void;
    private indexAnimationPackage;
    /**
     * Looks up a single animation clip by its package (IFP file name, without
     * extension - e.g. "ped", "airport") and animation name (both
     * case-insensitive, matching how the game itself resolves them).
     */
    getAnimation(packageName: string, animationName: string): IFPAnimation | null;
    /** Every loaded animation package name (IFP file name, without extension). */
    getAnimationPackageNames(): string[];
    /** Every animation name within a given package, or an empty array if the package doesn't exist. */
    getAnimationNames(packageName: string): string[];
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
     * Returns the raw RGBA pixel data of the supplied texture path.
     * Null if the texture doesn't exist.
     * @param txdPath Path to TXD, can be on disk or within an .img
     * @param textureName Name of texture within the TXD.
     */
    getTexture(txdPath: string, textureName: string): Promise<PixelData | null>;
    loadWeather(): void;
    loadLanguages(): void;
    loadVehicleHandling(): void;
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
export { GameVersion, IDEFlags, PathNodeType };
export type { PathArea, PathNode, PathLink };
