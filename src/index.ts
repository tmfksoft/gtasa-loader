import GTADat from "./interfaces/GTADat";
import path from 'path';
import fs from 'fs';
import IPLObject from "./interfaces/IPLObject";
import IDEObject from "./interfaces/IDEObject";
import IDETimedObject from "./interfaces/IDETimedObject";

import IMGReader from "@majesticfudgie/img-reader";
import DFFReader from "@majesticfudgie/dff-reader";
import TXDReader from "@majesticfudgie/txd-reader";
import PointerBuffer from "@majesticfudgie/pointer-buffer";

/**
 * Simple GTA SanAndreas Game Loader
 * 
 * This library loads resources from the GTA:SA Installation provided.
 * Currently it doesn't load all data and has a long way to go.
 * 
 * Currently you can fetch DFF and TXD files which returns the DFF and TXD Readers.
 * This allows reading and converting models and textures on the fly.
 */

class GameLoader {

	public gtaData: GTADat = {
		img: [
			// Preadd some core IMG files
			'MODELS\\GTA3.IMG',
			'MODELS\\GTA_INT.IMG',
			'MODELS\\PLAYER.IMG'
		],
		ide: [],
		ipl: [],
		splash: [],

		// Though not defined by the gta.dat file we can manually load some here.
		txd: [],
		dff: [],
	};

	// Objects
	public iplObjects: IPLObject[] = [];
	public ideObjects: IDEObject[] = [];
	public ideTimedObjects: IDETimedObject[] = [];

	// IMG Files
	public imgReaders: { [key: string]: IMGReader } = {};

	// filename and its corresponding IMG file.
	public imgContents: { [key: string]: string } = {};

	public constructor(protected gtaPath: string) {

	}

	loadGTADat() {
		const datPath = path.join(this.gtaPath, "data", "gta.dat");

		if (!fs.existsSync(datPath)) {
			throw new Error("Unable to find gta.dat!");
		}

		const rawDat = fs.readFileSync(datPath);

		const lines = rawDat.toString().split('\r\n');

		for (let line of lines) {
			// Skip comments.
			if (line.trim().startsWith("#")) {
				continue;
			}

			const ex = line.split(" ");
			const type = ex[0].toLowerCase();
			const path = ex[1];
			if (type === "img") {
				this.gtaData.img.push(path);
			} else if (type === "ide") {
				this.gtaData.ide.push(path);
			} else if (type === "splash") {
				this.gtaData.splash.push(path);
			} else if (type === "ipl") {
				this.gtaData.ipl.push(path);
			}
		}

		console.log("Loaded gta.dat:");
		console.log(`\tLoaded %s IMG Paths`, this.gtaData.img.length);
		console.log(`\tLoaded %s IDE Paths`, this.gtaData.ide.length);
		console.log(`\tLoaded %s IPL Paths`, this.gtaData.ipl.length);
		console.log(`\tLoaded %s SPLASH Paths`, this.gtaData.splash.length);
	}

	parseBinaryIPL(data: Buffer): string[] {
		if (data.subarray(0, 4).toString() !== "bnry") {
			console.warn("Supplied IPL is not a binary file!");
			return [];
		}

		let lines: string[] = [];

		lines.push("# IPL Converted from binary IPL");

		const iplBuf = new PointerBuffer(data);

		const magic = iplBuf.readString(4);
		const numItem = iplBuf.readDWORD();
		const numUnknown1 = iplBuf.readDWORD();
		const numUnknown2 = iplBuf.readDWORD();
		const numUnknown3 = iplBuf.readDWORD();
		const numParkedCars = iplBuf.readDWORD();
		const numUnknown4 = iplBuf.readDWORD();
		const offsetItem = iplBuf.readDWORD();

		// Jump to the item offset
		iplBuf.pointer = offsetItem;

		lines.push("inst");
		for (let i=0; i<numItem; i++) {
			const posX = iplBuf.readFloat();
			const posY = iplBuf.readFloat();
			const posZ = iplBuf.readFloat();
			const rotX = iplBuf.readFloat();
			const rotY = iplBuf.readFloat();
			const rotZ = iplBuf.readFloat();
			const rotW = iplBuf.readFloat();
			const objId = iplBuf.readDWORD();
			const interiorId = iplBuf.readDWORD();
			const lodIndex = iplBuf.readDWORD();

			lines.push(`${objId}, dummy, ${interiorId}, ${posX}, ${posY}, ${posZ}, ${rotX}, ${rotY}, ${rotZ}, ${rotW}, ${lodIndex}`);
		}
		lines.push("end");

		// Not bothering with cars just yet...
		lines.push("cars");
		lines.push("end");

		return lines;
	}

	// Loads IPL Data into memory
	loadIPL() {
		for (let iplPath of this.gtaData.ipl) {

			const iplData = this.getFile(iplPath);
			if (!iplData) {
				console.warn("Failed to read IPL: %s", iplPath);
				continue;
			}

			
			// Only search for streamed IPLs for on disk IPLs.
			const diskPath = path.join(this.gtaPath, iplPath);
			if (fs.existsSync(diskPath)) {

				const iplParsed = path.parse(iplPath);
				if (iplParsed.ext.toLowerCase() === ".ipl") {
					for (let i=0; i<50; i++) {
						const filename = `${iplParsed.name}_stream${i}.ipl`;
						const file = this.getFile(filename);
						if (!file) {
							break;
						} else {
							this.gtaData.ipl.push(filename);
						}
					}
				}
			}

			let iplLines: string[] = [];
			if (iplData.subarray(0, 4).toString() === "bnry") {
				iplLines = this.parseBinaryIPL(iplData);
			} else {
				iplLines = iplData.toString().split('\r\n');
			}

			let currentSection = "";
			let loadedObjects = 0;

			for (let line of iplLines) {
				if (line === "end") {
					currentSection = "";
				}

				if (line === "inst") {
					currentSection = "inst";
					continue;
				}

				if (currentSection === "inst") {
					const ex = line.split(",");
					const iplObject = {
						id: parseInt(ex[0]),
						modelName: ex[1].trim(),
						interior: parseInt(ex[2]),
						position: {
							x: parseFloat(ex[3]),
							y: parseFloat(ex[4]),
							z: parseFloat(ex[5]),
						},
						rotation: {
							x: parseFloat(ex[6]),
							y: parseFloat(ex[7]),
							z: parseFloat(ex[8]),
							w: parseFloat(ex[9]),
						},
						lod: parseInt(ex[10]),
					};
					this.iplObjects.push(iplObject);
					loadedObjects++;
				}
			}

			console.log("Loaded %s IPL Objects from %s",loadedObjects, iplPath);
		}

		console.log(`Loaded %s IPL Objects`, this.iplObjects.length);
	}

	// Loads IDE Data into memory
	loadIDE() {
		for (let idePath of this.gtaData.ide) {
			const fullPath = path.join(this.gtaPath, idePath);

			if (!fs.existsSync(fullPath)) {
				console.warn(`Unable to find IDE file: %s`, fullPath);
				continue;
			}

			const ideData = fs.readFileSync(fullPath);
			const lines = ideData.toString().split('\r\n');
			let currentSection = "";

			for (let line of lines) {
				if (line === "end") {
					currentSection = "";
					continue;
				}

				if (line === "objs") {
					currentSection = "objs";
					continue;
				}
				if (line === "tobj") {
					currentSection = "tobj";
					continue;
				}
				if (line === "anim") {
					currentSection = "anim";
					continue;
				}

				if (currentSection === "objs") {
					const ex = line.split(",");

					// Object Count is optional and defaults to 1
					let objectCount = 1;
					if (ex.length > 7) {
						objectCount = parseInt(ex[3]);
					}

					// This is dependant on Object Count
					const drawDistance: number[] = [];
					for (let i=0; i<objectCount; i++) {
						drawDistance.push(parseFloat(ex[4 + i]));
					}

					this.ideObjects.push({
						id: parseInt(ex[0]),
						modelName: ex[1].trim(),
						textureName: ex[2].trim(),
						objectCount, // 3
						drawDistance, // 4+
						flags: parseInt(ex[3 + objectCount]),
					});
				}
				if (currentSection === "tobj") {
					const ex = line.split(",");

					// Object Count is optional and defaults to 1
					let objectCount = 1;
					if (ex.length > 7) {
						objectCount = parseInt(ex[3]);
					}

					// This is dependant on Object Count
					const drawDistance: number[] = [];
					for (let i=0; i<objectCount; i++) {
						drawDistance.push(parseFloat(ex[4 + i]));
					}

					this.ideTimedObjects.push({
						id: parseInt(ex[0]),
						modelName: ex[1].trim(),
						textureName: ex[2].trim(),
						objectCount, // 3
						drawDistance, // 4+
						flags: parseInt(ex[3 + objectCount]),
						timeOn: parseInt(ex[3 + objectCount]),
						timeOff: parseInt(ex[3 + objectCount]),
					});
				}
			}
		}

		console.log(`Loaded %s IDE Objects`, this.ideObjects.length);
		console.log(`Loaded %s IDE Timed Objects`, this.ideTimedObjects.length);
	}

	getObject(id: number): IDEObject | IDETimedObject | null {
		for (let obj of this.ideObjects) {
			if (id === obj.id) {
				return obj;
			}
		}

		for (let tobj of this.ideTimedObjects) {
			if (id === tobj.id) {
				return tobj;
			}
		}

		return null;
	}

	loadIMG() {
		console.log("Loading IMG Files");
		for (let imgPath of this.gtaData.img) {
			const fullPath = path.join(this.gtaPath, imgPath);

			if (!fs.existsSync(fullPath)) {
				console.warn(`Unable to find IMG File: %s`, fullPath);
				continue;
			}

			const rawIMG = fs.readFileSync(fullPath);
			const reader = new IMGReader(rawIMG);

			this.imgReaders[imgPath] = reader;
			console.log("%s contains %s entries.", fullPath, reader.entries.length);

			for (let entry of reader.entries) {
				this.imgContents[entry.fileName] = imgPath;
			}
		}

	}

	getAssociatedIMG(filename: string) {
		//console.log("Looking for %s", filename);

		for (let fileEntry in this.imgContents) {
			if (fileEntry.toLowerCase() === filename.toLowerCase()) {
				return this.imgContents[fileEntry];
			}
		}

		return null;
	}

	// Attempts to parse a path to separate out an .img file
	parsePath(filePath: string): { img: string, file: string } {
		const ex = filePath.split(path.sep);

		const img: string[] = [];
		const file: string[] = [];
		let foundImage = false;

		for (let dir of ex) {
			if (!foundImage) {
				img.push(dir);
				if (dir.toLowerCase().endsWith(".img")) {
					foundImage = true;
				}
			} else {
				file.push(dir);
			}
		}

		if (file.length === 0) {
			return {
				img: "",
				file: path.join(...img),
			};
		}

		return {
			img: path.join(...img),
			file: path.join(...file),
		};
	}

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
	getFile(filename: string): Buffer | null {
		const parsedPath = this.parsePath(filename);
		
		if (parsedPath.img === "") {
			if (fs.existsSync(path.join(this.gtaPath, parsedPath.file))) {
				return fs.readFileSync(path.join(this.gtaPath, parsedPath.file));
			}
		}
		
		const img = this.getAssociatedIMG(parsedPath.file);
		let reader : IMGReader | null = null;
		if (img) {
			reader = this.getIMGReader(img);
			if (!reader) {
				console.warn("Couldn't find IMG Reader for %s", img);
				return null;
			}

		} else {

			if (parsedPath.img === "") {
				console.warn("File %s doesn't exist!", parsedPath.file);
				return null;
			}

			// Load the IMG
			const imgPath = path.join(this.gtaPath, parsedPath.img);
			if (!fs.existsSync(imgPath)) {
				console.warn("IMG file %s doesn't exist!", parsedPath.img);
				return null;
			}

			const imgData = fs.readFileSync(imgPath);
			reader = new IMGReader(imgData);
			this.imgReaders[parsedPath.img] = reader;
		}
		
		const file = reader.readFile(parsedPath.file);

		if (!file) {
			console.warn("Couldn't find %s in reader", parsedPath.file);
			return null;
		}

		return file;

	}

	getIMGReader(imgFile: string) {
		for (let img in this.imgReaders) {
			if (img.toLowerCase() === imgFile.toLowerCase()) {
				return this.imgReaders[img];
			}
		}
		return null;
	}

	getDFF(filename: string): DFFReader | null {
		const img = this.getAssociatedIMG(filename);
		if (!img) {
			console.warn("Couldn't find %s", filename);
			return null;
		}

		const reader = this.getIMGReader(img);
		if (!reader) {
			console.warn("Error fetching IMG Reader for %s", img);
			return null;
		}

		const file = reader.readFile(filename);
		if (!file) {
			return null;
		}

		const dffReader = new DFFReader(file);
		return dffReader;
	}

	getTXD(filename: string): TXDReader | null {
		const rawTXD = this.getFile(filename);
		if (!rawTXD) {
			return null;
		}

		const reader = new TXDReader(rawTXD);
		return reader;
	}

	async load() {
		// Load GTA Data
		this.loadGTADat();

		// Load in resources as needed.
		this.loadIMG();
		this.loadIDE();
		this.loadIPL();
	}
}
export default GameLoader;