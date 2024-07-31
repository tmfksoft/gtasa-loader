import Geometry from "@majesticfudgie/dff-reader/build/interfaces/Geometry";
import Texture from "@majesticfudgie/txd-reader/build/interfaces/Texture";
import IDEObject from "../interfaces/IDEObject";
import IDETimedObject from "../interfaces/IDETimedObject";
import MainIPL from "../interfaces/MainIPL";
import WaterDefinition from "../interfaces/WaterDefinition";
import WeatherDefinition from "../interfaces/WeatherDefinition";
import GameLoaderAPI from "./GameLoaderAPI";
import GameLoader from "..";
import TXDFile from "@majesticfudgie/txd-reader/build/interfaces/TXDFile";

export default class LocalGameLoaderAPI implements GameLoaderAPI {

	constructor(protected loader: GameLoader) {

	}

	async getDFF(filepath: string):Promise<Geometry[] | null> {
		const dffLoader = this.loader.getDFF(filepath);
		if (!dffLoader) {
			return null;
		}
		const dff = dffLoader.getGeometry();
		return dff;
	}

	async getTXD(filepath: string): Promise<TXDFile | null> {
		const txd = this.loader.getTXD(filepath);
		if (!txd) {
			return null;
		}

		return txd.parsed;
	}

	async getTexture(txdPath: string, textureName: string): Promise<Blob | null> {
		const texture = await this.loader.getTexture(txdPath, textureName);
		if (!texture) {
			return null;
		}

		return new Blob([texture], { type: "image/png" });
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

}