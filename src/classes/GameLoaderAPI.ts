

import Geometry from "@majesticfudgie/dff-reader/build/interfaces/Geometry";
import MainIPL from "../interfaces/MainIPL";
import WeatherDefinition from "../interfaces/WeatherDefinition";
import WaterDefinition from "../interfaces/WaterDefinition";
import IDEObject from "../interfaces/IDEObject";
import IDETimedObject from "../interfaces/IDETimedObject";
import TXDFile from "@majesticfudgie/txd-reader/build/interfaces/TXDFile";


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
	getDFF: (filepath: string) => Promise<Geometry[] | null>,

	/**
	 * Returns a parsed TXD File
	 * @param filepath  Path to load TXD
	 * @returns Parsed TXD Data
	 */
	getTXD: (filepath: string) => Promise<TXDFile | null>,

	/**
	 * Loads a TXD Texture and returns a PNG Blob
	 * Pass a path to the texture e.g. "models/particle.txd/waterclear256"
	 * Useful for HTTP transports.
	 * @param filepath Path to load TXD
	 */
	getTexture: (txdPath: string, textureName: string) => Promise<Blob | null>,

	/**
	 * Loads an IDE Object from the games IDE definitions.
	 * @param id ID of Object
	 * @returns 
	 */
	getIDEObject: (id: number) => Promise<IDEObject | IDETimedObject | null>,

	/**
	 * Loads all parsed IPLs
	 * Only includes data you'd find in the IPLs.
	 * @returns Returns an array of IPLs, one per file it loaded.
	 */
	getIPL: () => Promise<MainIPL[]>,

	/**
	 * Gets weather/time definitions from timecyc.dat
	 * Currently returns the raw data. May split it into a
	 * weather class to handle interpolation between times and such.
	 * @returns Array of parsed weather data
	 */
	getWeather: () => Promise<WeatherDefinition[]>,

	/**
	 * Gets water placement definitions.
	 * @returns Raw data from water.dat but parsed into objects
	 */
	getWater: () => Promise<WaterDefinition[]>,
}