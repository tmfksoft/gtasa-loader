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

export default class LocalGameLoaderAPI implements GameLoaderAPI  {

	constructor(protected loader: GameLoader) {}

	async getDFF(filepath: string):Promise<GeometryNode | null> {
		const dffLoader = this.loader.getDFF(filepath);
		if (!dffLoader) {
			return null;
		}
		const dff = dffLoader.getNode();
		return dff;
	}

	async getTXD(filepath: string): Promise<TXDFile | null> {
		const txd = this.loader.getTXD(filepath);
		if (!txd) {
			return null;
		}

		return txd.parsed;
	}

	async getTexture(txdPath: string, textureName: string): Promise<Uint8Array | null> {
		const texture = await this.loader.getTexture(txdPath, textureName);
		if (!texture) {
			return null;
		}

		return Uint8Array.from(texture);
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