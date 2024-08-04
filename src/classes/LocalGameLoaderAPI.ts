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

	constructor(protected loader: GameLoader) {

	}

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

	async getIDEObject(id: number): Promise<IDEObject | IDETimedObject | null> {
		return this.loader.getObject(id);
	}

	async getIPL(): Promise<MainIPL[]> {
		return this.loader.loadedIPLs;
	}
	
	async getWeather(): Promise<WeatherDefinition[]> {
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

}