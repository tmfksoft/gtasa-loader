import MainIPL from "../interfaces/MainIPL";
import WeatherDefinition from "../interfaces/WeatherDefinition";
import WaterDefinition from "../interfaces/WaterDefinition";
import IDEObject from "../interfaces/ide/IDEObject";
import IDETimedObject from "../interfaces/ide/IDETimedObject";
import TXDFile from "@majesticfudgie/txd-reader/build/interfaces/TXDFile";
import GXTFile from "../interfaces/language/GXTFile";
import GeometryNode from "@majesticfudgie/dff-reader/build/interfaces/GeometryNode";
import VehicleDefinition from "../interfaces/vehicles/VehicleDefinition";
import Color from "../interfaces/Color";
import VehicleColor from "../interfaces/vehicles/VehicleColor";
import IDEAnimatedObject from "../interfaces/ide/IDEAnimatedObject";
/**
 * This is a base class for providing an API to fetch resources from the game loader
 * without actually running the game loader.
 *
 * The idea is being able to run the game renderer separately from the loader
 * Such as across a HTTP or IPC transport for web or electron solutions.
 *
 * The loader class below is purely a definition.
 * The game loader exposes a basic one that can be used with the game renderer
 * if both are running in the same context... somehow?
 *
 * All endpoints *must* use promises, the transport chosen may only be able to
 * respond after waiting either for a HTTP Response, IPC Response or WebWorker response etc.
 *
 * I'll document more here, this class is likely to change as I improve it.
 *
 * All methods for singular resources return null if the resource doesn't exist.
 *
 */
export default interface GameLoaderAPI {
    /**
     * Returns a parsed DFF File
     * @param filepath Path to load DFF
     * @returns Parsed DFF Geometry
     */
    getDFF: (filepath: string) => Promise<GeometryNode | null>;
    /**
     * Returns a parsed TXD File
     * @param filepath  Path to load TXD
     * @returns Parsed TXD Data
     */
    getTXD: (filepath: string) => Promise<TXDFile | null>;
    /**
     * Loads a TXD Texture and returns a Uint8Array containing PNG data
     * Uint8Array seems to be a little more universally supported..
     * Pass a path to the texture e.g. "models/particle.txd/waterclear256"
     * Useful for HTTP transports.
     * @param filepath Path to load TXD
     */
    getTexture: (txdPath: string, textureName: string) => Promise<Uint8Array | null>;
    /**
     * Loads an IDE Object from the games IDE definitions.
     * @param id ID of Object
     * @returns
     */
    getIDEObject: (id: number) => Promise<IDEObject | IDETimedObject | IDEAnimatedObject | null>;
    /**
     * Loads all parsed IPLs
     * Only includes data you'd find in the IPLs.
     * @returns Returns an array of IPLs, one per file it loaded.
     */
    getIPL: () => Promise<MainIPL[]>;
    /**
     * Gets weather/time definitions from timecyc.dat
     * Currently returns the raw data. May split it into a
     * weather class to handle interpolation between times and such.
     * @returns Array of parsed weather data
     */
    getWeather: () => Promise<WeatherDefinition[]>;
    /**
     * Gets water placement definitions.
     * @returns Raw data from water.dat but parsed into objects
     */
    getWater: () => Promise<WaterDefinition[]>;
    /**
     * Fetches the language string for the key provided.
     * @returns String or null if it doesn't exist
     */
    getLanguageString: (gxtKey: string) => Promise<string | null>;
    /**
     * Fetches the entire parsed Language file for a specified language
     * @param language
     * @returns Parsed language data, null if it doesn't exist.
     */
    getLanguageData: (language: string) => Promise<GXTFile | null>;
    /**
     * Returns defined vehicles as per vehicles.ide (or anywhere else!)
     * This doesn't return handling, car colours etc.
     *
     * @returns Vehicle definitions
     */
    getVehicles: () => Promise<VehicleDefinition[]>;
    /**
     * Fetches all vehicle colours from the palette.
     * It's an array of "Color's", ignore the alpha value.
     *
     * Array indexes match the indexes the game expects.
     * @returns Array of Colors
     */
    getVehicleColorPalette: () => Promise<Color[]>;
    /**
     * Returns the permitted colours a vehicle can randomly spawn with.
     * A color pair may contain 2 colours or 4 depending on the vehicle.
     *
     * Colors are indexes referencing the vehicle colour palette.
     *
     * @returns Array of permitted vehicle colours
     */
    getVehicleColors: () => Promise<VehicleColor[]>;
}
