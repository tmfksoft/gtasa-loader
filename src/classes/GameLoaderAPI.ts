

import Geometry from "@majesticfudgie/dff-reader/build/interfaces/Geometry";
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
import GameLoader from "..";
import VehicleHandlingDefinitions from "../interfaces/vehicles/handling/VehicleHandlingDefinitions";
import StreamTrack from "@majesticfudgie/sfx-reader/build/interfaces/sfx/StreamTrack";
import AudioStream from "@majesticfudgie/sfx-reader/build/interfaces/AudioStream";
import SoundEffect from "@majesticfudgie/sfx-reader/build/interfaces/SoundEffect";


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
	getDFF: (filepath: string) => Promise<GeometryNode | null>,

	/**
	 * Returns a parsed TXD File
	 * @param filepath  Path to load TXD
	 * @returns Parsed TXD Data
	 */
	getTXD: (filepath: string) => Promise<TXDFile | null>,

	/**
	 * Loads a TXD Texture and returns a Uint8Array containing PNG data
	 * Uint8Array seems to be a little more universally supported..
	 * Pass a path to the texture e.g. "models/particle.txd/waterclear256"
	 * Useful for HTTP transports.
	 * @param filepath Path to load TXD
	 */
	getTexture: (txdPath: string, textureName: string) => Promise<Uint8Array | null>,

	/**
	 * Loads an IDE Object from the games IDE definitions.
	 * @param id ID of Object
	 * @returns 
	 */
	getIDEObject: (id: number) => Promise<IDEObject | IDETimedObject | IDEAnimatedObject | null>,

	/**
	 * Loads all parsed IPLs
	 * Only includes data you'd find in the IPLs.
	 * @returns Returns an array of IPLs, one per file it loaded.
	 */
	getIPL: () => Promise<MainIPL[]>,

	/**
	 * Gets grouped weather definitions.
	 * Weather definitions are grouped by the names given to them in timecyc.dat
	 * 
	 * The times in each array of definitions is as follows:
	 * 
	 *  - Midnight
	 *  - 5am
	 *  - 6am
	 *  - 7am
	 *  - Midday
	 *  - 7pm
	 *  - 10pm
	 * 
	 * The game interpolates the sky and ambient colours between each time.
	 * 
	 * @returns Object containing each other name and its array of weather definitions
	 */
	getWeather: () => Promise<{ [key:string]: WeatherDefinition[] }>,

	/**
	 * Gets weather/time definitions from timecyc.dat
	 * Returns raw individual definitions from timecyc.dat.
	 * 
	 * For grouped weather data use getWeather()
	 * @returns Array of weather definitions
	 */
	getWeatherDefinitions: () => Promise<WeatherDefinition[]>,

	/**
	 * Gets water placement definitions.
	 * @returns Raw data from water.dat but parsed into objects
	 */
	getWater: () => Promise<WaterDefinition[]>,

	/**
	 * Fetches the language string for the key provided.
	 * @returns String or null if it doesn't exist
	 */
	getLanguageString: (gxtKey: string) => Promise<string | null>,

	/**
	 * Fetches the entire parsed Language file for a specified language
	 * @param language 
	 * @returns Parsed language data, null if it doesn't exist.
	 */
	getLanguageData: (language: string) => Promise<GXTFile | null>,

	/**
	 * Returns defined vehicles as per vehicles.ide (or anywhere else!)
	 * This doesn't return handling, car colours etc.
	 * 
	 * @returns Vehicle definitions
	 */
	getVehicles: () => Promise<VehicleDefinition[]>,

	/**
	 * Fetches all vehicle colours from the palette.
	 * It's an array of "Color's", ignore the alpha value.
	 * 
	 * Array indexes match the indexes the game expects.
	 * @returns Array of Colors
	 */
	getVehicleColorPalette: () => Promise<Color[]>,

	/**
	 * Returns the permitted colours a vehicle can randomly spawn with.
	 * A color pair may contain 2 colours or 4 depending on the vehicle.
	 * 
	 * Colors are indexes referencing the vehicle colour palette.
	 * 
	 * @returns Array of permitted vehicle colours
	 */
	getVehicleColors: () => Promise<VehicleColor[]>,

	/**
	 * Returns all loaded vehicle handling data from "handling.cfg"
	 * Data is returned in a minimally parsed form.
	 * 
	 * Model and Handling flags are *not* parsed, they're returned in a numeric
	 * form, convert them to base 16 and parse yourself using handling.cfg for reference.
	 * 
	 * I may handle parsing them in future.
	 * 
	 * @returns Vehicle Handling Data
	 */
	getVehicleHandling: () => Promise<VehicleHandlingDefinitions>,

	/**
	 * Retrieves a specific track from the audio stream file supplied.
	 * You could call getAudioStream and fetch the track or use this method
	 * as a convenience method, it handles sanity checking the track id.
	 * 
	 * Track ID's start at 1, just to conform to how everyone refers to the tracks.
	 * 
	 * It's advised you try not to keep this data in memory any longer than you need to.
	 * Purely for the sake of memory usage.
	 * 
	 * @param streamName Audio stream file e.g. AMBIENCE
	 * @param trackId Track ID (1 is first)
	 * @returns Parsed StreamTrack with audio data and beats
	 */
	getStreamTrack: (streamName: string, trackId: number) => Promise<StreamTrack>,

	/**
	 * Reads and parses and audio stream file from disk,
	 * returning contained tracks with any associated beat information.
	 * 
	 * It's advised you try not to keep this data in memory any longer than you need to.
	 * Purely for the sake of memory usage.
	 * 
	 * @param streamName File to open e.g. AMBIENCE
	 * @returns AudioStream with associated tracks
	 */
	getAudioStream: (streamName: string) => Promise<AudioStream>,

	/**
	 * Retrieves a specific sound effect.
	 * Using the supplied package name, bank index and slot index a Buffer
	 * containing PCM data is returned.
	 * 
	 * Indexes start at 1 rather than 0 to line up with documentation
	 * and how the community refers to them.
	 * 
	 * Package name may need replacing with package index at some point..
	 * 
	 * @param packageName One of FEET, GENRL, PAIN_A, SCRIPT, SPC_EA, SPC_FA, SPC_GA, SPC_NA, SPC_PA
	 * @param bankIndex Bank Index - Starts at 1
	 * @param slotIndex Slot Index - Starts at 1
	 */
	getSoundEffect: (packageName: string, bankIndex: number, slotIndex: number) => Promise<SoundEffect>;

	/**
	 * Converts a sound effect's RAW PCM
	 * into a WAV File by appending an appropriate
	 * WAV file header
	 * 
	 * @param effect Sound Effect
	 * @returns WAV File
	 */
	toWAV: (effect: SoundEffect) => Promise<Uint8Array>

	/**
	 * Adds an event listener.
	 * It's up to the API implementation to handle this,
	 * may it be web sockets, web events, IPC events or just straight pass through.
	 * @param eventName 
	 * @param listener 
	 */
	on(eventName: string | symbol, listener: ( ...args: any[] ) => void): GameLoader;
	on(eventName: "loading", listener: ( data: { stage: number } ) => void): GameLoader;

	/**
	 * Removes an event listener.
	 * It's up to the API implementation to handle this.
	 * @param eventName 
	 * @param listener 
	 */
	on(eventName: string | symbol, listener: ( ...args: any[] ) => void): GameLoader;
}