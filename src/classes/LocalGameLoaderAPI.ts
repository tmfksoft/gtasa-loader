import IDEObject from "../interfaces/ide/IDEObject";
import IDETimedObject from "../interfaces/ide/IDETimedObject";
import MainIPL from "../interfaces/ipl/MainIPL";
import WaterDefinition from "../interfaces/WaterDefinition";
import PathArea from "../interfaces/paths/PathArea";
import WeatherDefinition from "../interfaces/WeatherDefinition";
import GameLoaderAPI from "./GameLoaderAPI";
import GameLoader from "..";
import TXDFile from "@majesticfudgie/txd-reader/build/interfaces/TXDFile";
import PixelData from "@majesticfudgie/txd-reader/build/interfaces/PixelData";
import GeometryNode from "@majesticfudgie/dff-reader/build/interfaces/GeometryNode";
import Geometry from "@majesticfudgie/dff-reader/build/interfaces/Geometry";
import IDEAnimatedObject from "../interfaces/ide/IDEAnimatedObject";
import AudioStream from "@majesticfudgie/sfx-reader/build/interfaces/AudioStream";
import SoundEffect from "@majesticfudgie/sfx-reader/build/interfaces/SoundEffect";
import ResolvedUVAnimationChannel from "../interfaces/ResolvedUVAnimationChannel";
import COLModel from "@majesticfudgie/col-reader/build/interfaces/COLModel";
import COLReader from "@majesticfudgie/col-reader";
import IFPAnimation from "@majesticfudgie/ifp-reader/build/interfaces/IFPAnimation";
import TextureInfo from "../interfaces/TextureInfo";
import CarGenerator from "../interfaces/CarGenerator";

export default class LocalGameLoaderAPI implements GameLoaderAPI  {

	constructor(protected loader: GameLoader) {}

	async getDFF(filepath: string):Promise<GeometryNode | null> {
		const dffLoader = this.loader.getDFF(filepath);
		if (!dffLoader) {
			return null;
		}
		try {
			const dff = dffLoader.getNode();

			// Attach each material's resolved UV animation now, while dffLoader
			// (and its UV Animation Dictionary lookup) is still in scope.
			const resolveUVAnimations = (node: GeometryNode | Geometry): void => {
				if ("materials" in node) {
					for (const mat of node.materials) {
						if (!mat.uvAnimation) {
							continue;
						}
						for (const channel of mat.uvAnimation.channels as ResolvedUVAnimationChannel[]) {
							channel.animation = dffLoader.getUVAnimation(channel.name);
						}
					}
					return;
				}
				for (const child of node.children) {
					resolveUVAnimations(child);
				}
			};
			resolveUVAnimations(dff);

			return dff;
		} catch (err) {
			console.error(`Failed to parse DFF model "%s"`, filepath, err);
			return null;
		}
	}

	async getTXD(filepath: string): Promise<TXDFile | null> {
		const txd = this.loader.getTXD(filepath);
		if (!txd) {
			return null;
		}

		return txd.parsed;
	}

	async getCollisionModel(modelName: string): Promise<COLModel | null> {
		return this.loader.getCollisionModel(modelName);
	}

	/**
	 * A vehicle's own collision, straight out of its .dff - GTA:SA vehicles
	 * don't use the standalone models/coll/vehicles.col most tools expect
	 * (that file is a near-empty leftover from III/VC's pipeline); their
	 * real collision is embedded in each DFF as a Collision_Model RW
	 * section instead. Returns null for a model with no such chunk (most
	 * non-vehicle DFFs) or that isn't found at all.
	 */
	async getVehicleCollisionModel(modelName: string): Promise<COLModel | null> {
		const dffLoader = this.loader.getDFF(`${modelName}.dff`);
		if (!dffLoader) {
			return null;
		}
		const collisionData = dffLoader.getCollisionData();
		if (!collisionData) {
			return null;
		}
		try {
			const colReader = new COLReader(collisionData);
			return colReader.models[0] ?? null;
		} catch (err) {
			console.warn("Failed to parse embedded collision for %s:", modelName, err);
			return null;
		}
	}

	async getAnimation(packageName: string, animationName: string): Promise<IFPAnimation | null> {
		return this.loader.getAnimation(packageName, animationName);
	}

	async getAnimationPackageNames(): Promise<string[]> {
		return this.loader.getAnimationPackageNames();
	}

	async getAnimationNames(packageName: string): Promise<string[]> {
		return this.loader.getAnimationNames(packageName);
	}

	async getTexture(txdPath: string, textureName: string): Promise<PixelData | null> {
		const texture = await this.loader.getTexture(txdPath, textureName);
		if (!texture) {
			return null;
		}

		return texture;
	}

	async getTextureNames(txdPath: string): Promise<string[]> {
		const txd = this.loader.getTXD(txdPath);
		return txd ? [...txd.textureList] : [];
	}

	async getTextureInfo(txdPath: string): Promise<TextureInfo[]> {
		const txd = this.loader.getTXD(txdPath);
		if (!txd) {
			return [];
		}

		// Copied field by field rather than spread - TXDTexture keeps a private
		// reference to its chunk, which wouldn't survive a structured clone.
		return txd.getTextures().map(texture => ({
			name: texture.name,
			alphaName: texture.alphaName,
			width: texture.width,
			height: texture.height,
			depth: texture.depth,
			format: texture.format,
			mipmapCount: texture.mipmapCount,
		}));
	}

	async getTextureMipmap(txdPath: string, textureName: string, level: number): Promise<PixelData | null> {
		const txd = this.loader.getTXD(txdPath);
		if (!txd) {
			return null;
		}

		const texture = txd.getTextures().find(t => t.name.toLowerCase() === textureName.toLowerCase());
		if (!texture || level < 0 || level >= texture.mipmapCount) {
			return null;
		}

		try {
			return texture.getMipmap(level);
		} catch (err) {
			// Some textures declare more levels than they actually store, and
			// the odd format isn't decodable at all - a missing level is a
			// normal outcome here, not a reason to take the caller down.
			console.error(`Failed to decode mipmap %d of "%s" in "%s"`, level, textureName, txdPath, err);
			return null;
		}
	}

	async getIDEObject(id: number): Promise<IDEObject | IDETimedObject | IDEAnimatedObject | null> {
		return this.loader.getObject(id);
	}

	async getIPL(): Promise<MainIPL[]> {
		return this.loader.loadedIPLs;
	}
	
	async getWeather(): Promise<{ [key: string]: WeatherDefinition[] }> {
		return this.loader.weather;
	}
	async getWeatherDefinitions(): Promise<WeatherDefinition[]> {
		return this.loader.weatherDefinitions;
	}

	async getWater(): Promise<WaterDefinition[]> {
		return this.loader.waterDefinitions;
	}

	async getPathNodes(): Promise<PathArea[]> {
		return this.loader.pathAreas;
	}

	async getCarGenerators(): Promise<CarGenerator[]> {
		return this.loader.carGenerators;
	}

	async getLanguageString(key: string) {
		return this.loader.readLanguageString(key);
	}

	async getLanguageData(language: string) {
		if (typeof this.loader.languageReaders[language] !== "undefined") {
			return this.loader.languageReaders[language].parsedGXT;
		}
		return null;
	}

	async getVehicles() {
		return this.loader.vehicleDefinitions;
	}

	async getVehicleColorPalette() {
		return this.loader.vehicleColorPalette;
	}
	async getVehicleColors() {
		return this.loader.vehicleColors;
	}
	async getVehicleHandling() {
		return this.loader.vehicleHandling;
	}

	// Let there be sound!
	// The audio layout is San Andreas specific, so on a GTA III or Vice City
	// install nothing here resolves and the underlying reader throws. These
	// are singular-resource lookups, which this API returns null from when
	// the resource doesn't exist - so report that rather than propagating an
	// exception across the transport on every request.
	async getStreamTrack(streamName: string, trackId: number) {
		try {
			return this.loader.sfx.getStreamTrack(streamName, trackId);
		} catch {
			return null;
		}
	}
	async getAudioStream(streamName: string) {
		try {
			return this.loader.sfx.getAudioStream(streamName);
		} catch {
			return null;
		}
	}
	async getSoundEffect(packageName: string, bankIndex: number, slotIndex: number) {
		try {
			return this.loader.sfx.getSoundEffect(packageName, bankIndex, slotIndex);
		} catch {
			return null;
		}
	}
	async toWAV(effect: SoundEffect) {
		// We're converting to a Uint8Array as browsers lack Buffer
		// I should probably think about a browser ready/safe solution.
		const wavBuf = this.loader.sfx.toWAV(effect);
		return Uint8Array.from(wavBuf);
	}

	on(eventName: string | symbol, listener: ( ...args: any[] ) => void) {
		return this.loader.on(eventName, listener);
	}

}