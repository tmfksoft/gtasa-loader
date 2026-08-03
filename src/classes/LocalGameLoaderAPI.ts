import IDEObject from "../interfaces/ide/IDEObject";
import IDETimedObject from "../interfaces/ide/IDETimedObject";
import MainIPL from "../interfaces/ipl/MainIPL";
import WaterDefinition from "../interfaces/WaterDefinition";
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

	async getTexture(txdPath: string, textureName: string): Promise<PixelData | null> {
		const texture = await this.loader.getTexture(txdPath, textureName);
		if (!texture) {
			return null;
		}

		return texture;
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
	async getStreamTrack(streamName: string, trackId: number) {
		return this.loader.sfx.getStreamTrack(streamName, trackId);
	}
	async getAudioStream(streamName: string) {
		return this.loader.sfx.getAudioStream(streamName);
	}
	async getSoundEffect(packageName: string, bankIndex: number, slotIndex: number) {
		return this.loader.sfx.getSoundEffect(packageName, bankIndex, slotIndex);
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