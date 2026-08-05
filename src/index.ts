import GTADat from "./interfaces/GTADat";
import path from 'path';
import fs from 'fs';
import IPLObject from "./interfaces/ipl/IPLObject";
import IDEObject from "./interfaces/ide/IDEObject";
import IDETimedObject from "./interfaces/ide/IDETimedObject";

import IMGReader from "@majesticfudgie/img-reader";
import DFFReader from "@majesticfudgie/dff-reader";
import TXDReader from "@majesticfudgie/txd-reader";
import COLReader from "@majesticfudgie/col-reader";
import COLModel from "@majesticfudgie/col-reader/build/interfaces/COLModel";
import IFPReader from "@majesticfudgie/ifp-reader";
import IFPAnimation from "@majesticfudgie/ifp-reader/build/interfaces/IFPAnimation";
import PixelData from "@majesticfudgie/txd-reader/build/interfaces/PixelData";
import PointerBuffer from "@majesticfudgie/pointer-buffer";
import ParsedIPL from "./interfaces/ipl/ParsedIPL";
import MainIPL from "./interfaces/ipl/MainIPL";
import CullZone from "./interfaces/ipl/CullZone";
import WeatherDefinition from "./interfaces/WeatherDefinition";
import WaterDefinition from "./interfaces/WaterDefinition";
import GameVersion from "./interfaces/GameVersion";
import PathArea from "./interfaces/paths/PathArea";
import PathNode, { PathLink, PathNodeType } from "./interfaces/paths/PathNode";
import Language from "./interfaces/Language";
import GameLoaderAPI from "./classes/GameLoaderAPI";
import LocalGameLoaderAPI from "./classes/LocalGameLoaderAPI";
import LanguageReader from "./classes/LanguageReader";
import VehicleDefinition, { VehicleBaseDefinition, VehicleGroundDefinition } from "./interfaces/vehicles/VehicleDefinition";
import IDESection from "./interfaces/ide/IDESection";
import Color from "./interfaces/Color";
import VehicleColor from "./interfaces/vehicles/VehicleColor";
import IDEAnimatedObject from "./interfaces/ide/IDEAnimatedObject";
import IDEFlags from "./interfaces/ide/IDEFlags";
import CarHandlingDefinition from "./interfaces/vehicles/handling/CarHandlingDefinition";
import VehicleHandlingDefinitions from "./interfaces/vehicles/handling/VehicleHandlingDefinitions";
import BikeHandlingDefinition from "./interfaces/vehicles/handling/BikeHandlingDefinition";
import FlyingHandlingDefinition from "./interfaces/vehicles/handling/FlyingHandlingDefinition";
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

class GameLoader extends EventEmitter {

	// A predfined API you can hook straight up to any project
	public API: GameLoaderAPI = new LocalGameLoaderAPI(this);
	
	public loadingStages = 10; // This will change

	public gtaData: GTADat = {
		img: [],
		ide: [],
		ipl: [],
		splash: [],

		// Though not defined by the gta.dat file we can manually load some here.
		txd: [],
		dff: [],

		colFile: [],
		mapZone: [],
	};

	/**
	 * Which game `gtaPath` points at - resolved by detectGame() at the very
	 * start of load(), since almost everything after that branches on it.
	 * Defaults to San Andreas so anything constructed but never loaded keeps
	 * behaving the way it always has.
	 */
	public gameVersion: GameVersion = GameVersion.SanAndreas;

	/**
	 * The master data file for each game. The name is the most reliable way
	 * to tell the three apart - every install has exactly one of these, and
	 * it's the file the game itself bootstraps from.
	 */
	static readonly GAME_DAT_FILES: { version: GameVersion, file: string }[] = [
		{ version: GameVersion.SanAndreas, file: "gta.dat" },
		{ version: GameVersion.ViceCity, file: "gta_vc.dat" },
		{ version: GameVersion.III, file: "gta3.dat" },
	];

	/**
	 * IMG archives (and the odd IDE) the games mount without listing them in
	 * their master .dat, so they have to be added by hand.
	 *
	 * GTA III and Vice City keep their models in gta3.img and their textures
	 * in a separate txd.img, both version 1 archives with a sibling .dir.
	 * Animations aren't in an archive at all there - they're a loose
	 * anim/ped.ifp - so there's no ANIM.IMG to preload.
	 */
	static readonly IMPLICIT_FILES: Record<GameVersion, { img: string[], ide: string[] }> = {
		[GameVersion.SanAndreas]: {
			img: [
				'MODELS\\GTA3.IMG',
				'MODELS\\GTA_INT.IMG',
				'MODELS\\PLAYER.IMG',
				// Not auto-mounted by the real game (it loads individual .ifp
				// entries from this on demand, per context) - preadded anyway so
				// loadAnimations() has every animation available up front, the
				// same tradeoff already made for the loose ped.ifp/collision files.
				'ANIM\\ANIM.IMG',
			],
			ide: ['DATA\\VEHICLES.IDE'],
		},
		[GameVersion.ViceCity]: {
			img: ['MODELS\\GTA3.IMG', 'MODELS\\TXD.IMG'],
			ide: ['DATA\\VEHICLES.IDE'],
		},
		[GameVersion.III]: {
			img: ['MODELS\\GTA3.IMG', 'MODELS\\TXD.IMG'],
			ide: ['DATA\\DEFAULT.IDE'],
		},
	};

	// Objects
	public loadedIPLs: MainIPL[] = [];
	public ideObjects: IDEObject[] = [];
	public ideTimedObjects: IDETimedObject[] = [];
	public ideAnimatedObjects: IDEAnimatedObject[] = [];

	public waterDefinitions: WaterDefinition[] = [];
	public vehicleDefinitions: VehicleDefinition[] = [];

	// Pedestrian and vehicle path node network, one entry per NODES*.DAT
	// area file, indexed by area id (sparse if a file is missing).
	public pathAreas: PathArea[] = [];

	// Vehicle colours, alpha is always 255
	public vehicleColorPalette: Color[] = [];
	
	// Colours a vehicle can spawn with
	public vehicleColors: VehicleColor[] = [];

	// Misc
	public weatherDefinitions: WeatherDefinition[] = [];
	public weather: { [key:string]: WeatherDefinition[] } = {};

	// IMG Files
	public imgReaders: { [key: string]: IMGReader } = {};

	// filename and its corresponding IMG file.
	public imgContents: { [key: string]: string } = {};

	// Collision models, keyed by lowercased model name. .col archives bundle
	// many named models each (e.g. one archive per map zone) rather than one
	// archive per model like DFF/TXD, so these are indexed once up front at
	// load time instead of being fetched on demand.
	public collisionModels: Map<string, COLModel> = new Map();

	// Animation packages (parsed .ifp files), keyed by lowercased filename
	// without extension (e.g. "ped", "airport") - matches how the game
	// itself references an IFP by its AnimGroup/file name, not the name
	// embedded in the file's own header (untested whether that always
	// matches the filename for every archive entry, so not relied on here).
	public animationPackages: Map<string, IFPReader> = new Map();

	// Defines what language the game will load by default
	public language: Language = "american";
	public languageReaders: { [key: string]: LanguageReader } = {};

	// Vehicles
	public vehicleHandling: VehicleHandlingDefinitions = {
		cars: [],
		bikes: [],
		boats: [],
		flying: [],
		anim: [],
	};

	// Sounds
	public sfx: SFXReader;

	public constructor(protected gtaPath: string) {
		super();
		this.sfx = new SFXReader(gtaPath);
	}

	/**
	 * Works out which game `gtaPath` points at from which master data file
	 * is present, and seeds gtaData with the archives that game mounts
	 * without listing them.
	 *
	 * Returns the resolved path to that master file so loadGTADat() doesn't
	 * have to look it up a second time.
	 */
	detectGame(): string {
		const dataDir = path.join(this.gtaPath, "data");

		// Directory casing varies between releases (data vs DATA), so resolve
		// the real entry names once rather than guessing at either.
		let entries: string[] = [];
		if (fs.existsSync(dataDir)) {
			entries = fs.readdirSync(dataDir);
		} else if (fs.existsSync(path.join(this.gtaPath, "DATA"))) {
			entries = fs.readdirSync(path.join(this.gtaPath, "DATA"));
		}

		for (const candidate of GameLoader.GAME_DAT_FILES) {
			const match = entries.find(e => e.toLowerCase() === candidate.file);
			if (match) {
				this.gameVersion = candidate.version;
				const resolved = fs.existsSync(dataDir)
					? path.join(dataDir, match)
					: path.join(this.gtaPath, "DATA", match);
				console.log(`Detected %s (%s)`, this.gameVersion, match);

				const implicit = GameLoader.IMPLICIT_FILES[this.gameVersion];
				this.gtaData.img.push(...implicit.img);
				this.gtaData.ide.push(...implicit.ide);

				return resolved;
			}
		}

		throw new Error(
			`Unable to find a master data file in ${dataDir} - expected one of ` +
			GameLoader.GAME_DAT_FILES.map(c => c.file).join(", ") +
			`. Is this a GTA III, Vice City or San Andreas installation?`,
		);
	}

	loadGTADat() {
		const datPath = this.detectGame();

		const rawDat = fs.readFileSync(datPath);

		// GTA III's file is CRLF like the others, but splitting on \r\n alone
		// leaves a stray \r on every line of anything saved with plain LF -
		// which then ends up baked into the paths.
		const lines = rawDat.toString().split(/\r?\n/);

		for (let line of lines) {
			// Skip comments.
			if (line.trim().startsWith("#")) {
				continue;
			}

			// Collapse runs of whitespace - III mixes tabs and spaces between
			// the directive and its path.
			const ex = line.trim().split(/\s+/);
			const type = ex[0].toLowerCase();
			const path = ex[1];
			if (!path) {
				continue;
			}
			if (type === "img") {
				this.gtaData.img.push(path);
			} else if (type === "ide") {
				this.gtaData.ide.push(path);
			} else if (type === "splash") {
				this.gtaData.splash.push(path);
			} else if (type === "ipl") {
				this.gtaData.ipl.push(path);
			} else if (type === "colfile") {
				// "COLFILE <index> <path>" - the leading number is the
				// collision slot, which nothing here needs yet.
				const colPath = ex[2] ?? path;
				this.gtaData.colFile.push(colPath);
			} else if (type === "mapzone") {
				this.gtaData.mapZone.push(path);
			}
		}

		console.log(`Loaded %s:`, path.basename(datPath));
		console.log(`\tLoaded %s IMG Paths`, this.gtaData.img.length);
		console.log(`\tLoaded %s IDE Paths`, this.gtaData.ide.length);
		console.log(`\tLoaded %s IPL Paths`, this.gtaData.ipl.length);
		console.log(`\tLoaded %s SPLASH Paths`, this.gtaData.splash.length);
		if (this.gtaData.colFile.length > 0) {
			console.log(`\tLoaded %s COLFILE Paths`, this.gtaData.colFile.length);
		}
	}

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
	loadPathNodes() {
		const pathsDir = path.join(this.gtaPath, "data", "paths");

		if (!fs.existsSync(pathsDir)) {
			throw new Error("Unable to find data/paths");
		}

		// Filename casing varies between releases (NODES0.DAT vs nodes0.dat),
		// so match case-insensitively rather than assuming either.
		const areaFiles: string[] = [];
		for (const entry of fs.readdirSync(pathsDir)) {
			const match = /^nodes(\d+)\.dat$/i.exec(entry);
			if (match) {
				areaFiles[parseInt(match[1], 10)] = entry;
			}
		}

		this.pathAreas = [];

		for (let areaId = 0; areaId < areaFiles.length; areaId++) {
			const filename = areaFiles[areaId];
			if (!filename) {
				continue;
			}
			const buffer = fs.readFileSync(path.join(pathsDir, filename));

			const numNodes = buffer.readUInt32LE(0);
			const numVehNodes = buffer.readUInt32LE(4);
			const numPedNodes = buffer.readUInt32LE(8);
			const numNaviNodes = buffer.readUInt32LE(12);
			const numLinks = buffer.readUInt32LE(16);

			// Links come after the nodes and the navi node block.
			const linksOffset = 20 + (numNodes * 28) + (numNaviNodes * 14);

			const nodes: PathNode[] = [];
			for (let i = 0; i < numNodes; i++) {
				const offset = 20 + (i * 28);

				// The low nibble of the flags word is how many links this node
				// owns, running consecutively from the base index.
				const flags = buffer.readUInt32LE(offset + 24);
				const baseLinkId = buffer.readUInt16LE(offset + 16);
				const linkCount = flags & 0x0F;

				const links: PathLink[] = [];
				for (let l = 0; l < linkCount; l++) {
					const linkId = baseLinkId + l;
					if (linkId >= numLinks) {
						continue;
					}
					const linkOffset = linksOffset + (linkId * 4);
					links.push({
						areaId: buffer.readUInt16LE(linkOffset),
						nodeId: buffer.readUInt16LE(linkOffset + 2),
					});
				}

				nodes.push({
					areaId,
					nodeId: i,
					// Positions are 16-bit fixed point, eight units per metre.
					position: {
						x: buffer.readInt16LE(offset + 8) / 8,
						y: buffer.readInt16LE(offset + 10) / 8,
						z: buffer.readInt16LE(offset + 12) / 8,
					},
					// Vehicle nodes are written first, pedestrian nodes after.
					type: (i < numVehNodes) ? PathNodeType.Vehicle : PathNodeType.Pedestrian,
					links,
					pathWidth: buffer.readUInt8(offset + 22),
					floodFill: buffer.readUInt8(offset + 23),
					flags,
				});
			}

			this.pathAreas[areaId] = {
				areaId,
				nodes,
				vehicleNodeCount: numVehNodes,
				pedestrianNodeCount: numPedNodes,
			};
		}

		let totalNodes = 0;
		let totalPedNodes = 0;
		for (const area of this.pathAreas) {
			if (!area) {
				continue;
			}
			totalNodes += area.nodes.length;
			totalPedNodes += area.pedestrianNodeCount;
		}
		console.log(`\tLoaded %s path nodes (%s pedestrian) across %s areas`, totalNodes, totalPedNodes, this.pathAreas.length);
	}

	loadWaterDefinitions() {
		const waterFilePath = path.join(this.gtaPath, "data", "water.dat");

		if (!fs.existsSync(waterFilePath)) {
			throw new Error("Unable to find water.dat");
		}
		const waterDat = fs.readFileSync(waterFilePath);

		let lines = waterDat.toString().split('\n');

		for (let line of lines) {
			if (line.trim().startsWith("#") || line.trim() === "processed" || line.trim() === "") {
				continue;
			}

			const ex = line.split(" ").filter((word) => word.length > 0);

			const waterDef: WaterDefinition = {
				point1: {
					x: parseFloat(ex[0]),
					y: parseFloat(ex[1]),
					z: parseFloat(ex[2]),
					speedX: parseFloat(ex[3]),
					speedY: parseFloat(ex[4]),
					unknown: parseFloat(ex[5]),
					waveHeight: parseFloat(ex[6]),
				},
				point2: {
					x: parseFloat(ex[7]),
					y: parseFloat(ex[8]),
					z: parseFloat(ex[9]),
					speedX: parseFloat(ex[10]),
					speedY: parseFloat(ex[11]),
					unknown: parseFloat(ex[12]),
					waveHeight: parseFloat(ex[13]),
				},
				point3: {
					x: parseFloat(ex[14]),
					y: parseFloat(ex[15]),
					z: parseFloat(ex[16]),
					speedX: parseFloat(ex[17]),
					speedY: parseFloat(ex[18]),
					unknown: parseFloat(ex[19]),
					waveHeight: parseFloat(ex[20]),
				},
				waterType: 0,
			};

			if (ex.length > 22) {
				waterDef.point4 = {
					x: parseFloat(ex[21]),
					y: parseFloat(ex[22]),
					z: parseFloat(ex[23]),
					speedX: parseFloat(ex[24]),
					speedY: parseFloat(ex[25]),
					unknown: parseFloat(ex[26]),
					waveHeight: parseFloat(ex[27]),
				}
				waterDef.waterType = parseInt(ex[28]);
			} else {
				waterDef.waterType = parseInt(ex[21]);
			}

			this.waterDefinitions.push(waterDef);
		}
	}

	parseBinaryIPL(name: string | string[], data: Buffer | Buffer[]): ParsedIPL {
		
		const parsedIPL: ParsedIPL = {
			name,
			inst: [],
			cull: [],
			tcyc: [],
			grge: [],
			auzo: [],
			occl: [],
			path: [],
			enex: [],
			zone: [],
			pick: [],
		};

		const bufList: Buffer[] = [];

		if (!Array.isArray(data)) {
			bufList.push(data);
		} else {
			bufList.push(...data);
		}
		
		for (let iplData of bufList) {
			
			if (iplData.subarray(0, 4).toString() !== "bnry") {
				throw new Error("Supplied IPL is not a binary file!");
			}

			const iplBuf = new PointerBuffer(iplData);

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
				
				parsedIPL.inst.push({
					id: objId,
					modelName: "dummy",
					interior: interiorId,
					position: {
						x: posX,
						y: posY,
						z: posZ,
					},
					rotation: {
						x: rotX,
						y: rotY,
						z: rotZ,
						w: rotW,
					},
					lod: lodIndex,
					iplIndex: i,
				});
			}
		}

		return parsedIPL;
	}

	parseTextIPL(name: string | string[], data: Buffer | Buffer[]): ParsedIPL {
		const parsedIPL: ParsedIPL = {
			name,
			inst: [],
			cull: [],
			auzo: [],
			tcyc: [],
			grge: [],
			occl: [],
			enex: [],
			zone: [],
			pick: [],

			// To be implemented
			path: [],
			
		};

		const iplBuf: Buffer[] = [];

		if (Array.isArray(data)) {
			iplBuf.push(...data);
		} else {
			iplBuf.push(data);
		}

		for (let iplData of iplBuf) {

			const iplLines = iplData.toString().split('\r\n');

			let currentSection = "";

			for (let line of iplLines) {

				if (line.trim().split(" ").length === 1) {
					if (line === "end") {
						if (currentSection == "") {
							throw new Error("Unexpected section end in IPL");
						}
						currentSection = "";
					} else {
						if (currentSection !== "") {
							throw new Error("Already inside "+currentSection+" section!");
						}
						currentSection = line;
					}
					continue;
				}

				if (currentSection === "") {
					continue;
				}

				if (currentSection === "inst") {

					const ex = line.split(",");

					// The three games use different inst layouts, and the
					// column count tells them apart unambiguously:
					//
					//   11  San Andreas  id, model, interior, pos, rot, lod
					//   12  GTA III      id, model, pos, scale, rot
					//   13  Vice City    id, model, interior, pos, scale, rot
					//
					// Keying off the row itself rather than the detected game
					// keeps this honest for mods and for Vice City, which
					// hasn't been verified against a real install.
					let iplObject: IPLObject;
					if (ex.length >= 13) {
						iplObject = {
							id: parseInt(ex[0]),
							modelName: ex[1].trim(),
							interior: parseInt(ex[2]),
							position: {
								x: parseFloat(ex[3]),
								y: parseFloat(ex[4]),
								z: parseFloat(ex[5]),
							},
							scale: {
								x: parseFloat(ex[6]),
								y: parseFloat(ex[7]),
								z: parseFloat(ex[8]),
							},
							rotation: {
								x: parseFloat(ex[9]),
								y: parseFloat(ex[10]),
								z: parseFloat(ex[11]),
								w: parseFloat(ex[12]),
							},
							lod: -1,
							iplIndex: parsedIPL.inst.length,
						};
					} else if (ex.length === 12) {
						iplObject = {
							id: parseInt(ex[0]),
							modelName: ex[1].trim(),
							interior: 0,
							position: {
								x: parseFloat(ex[2]),
								y: parseFloat(ex[3]),
								z: parseFloat(ex[4]),
							},
							scale: {
								x: parseFloat(ex[5]),
								y: parseFloat(ex[6]),
								z: parseFloat(ex[7]),
							},
							rotation: {
								x: parseFloat(ex[8]),
								y: parseFloat(ex[9]),
								z: parseFloat(ex[10]),
								w: parseFloat(ex[11]),
							},
							lod: -1,
							iplIndex: parsedIPL.inst.length,
						};
					} else {
						iplObject = {
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
							iplIndex: parsedIPL.inst.length,
						};
					}
					parsedIPL.inst.push(iplObject);
				} else if (currentSection === "cull") {
					const ex = line.split(",");
					const cullObj: CullZone = {
						center: {
							x: parseFloat(ex[0]),
							y: parseFloat(ex[1]),
							z: parseFloat(ex[2]),
						},
						xSkewValue: parseInt(ex[3]),
						length: parseFloat(ex[4]),
						bottom: parseFloat(ex[5]),
						width: parseFloat(ex[6]),
						ySkewValue: parseInt(ex[7]),
						top: parseFloat(ex[8]),
						type: parseInt(ex[9]), // Also known as 'flag'
					};

					if (ex.length === 14) {
						// Extended zone definition, a mirror!
						cullObj.mirrorParameters = {
							x: parseFloat(ex[10]),
							y: parseFloat(ex[11]),
							z: parseFloat(ex[12]),
							Cm: parseFloat(ex[13]),
						};
					} else {
						// Nope, chuck testa
						cullObj.unknown3 = parseInt(ex[10]);
					}

					parsedIPL.cull.push(cullObj);
				} else if (currentSection === "auzo") {
					const ex = line.split(",");
					
					if (ex.length > 6) {
						// Cube
						parsedIPL.auzo.push({
							name: ex[0],
							id: parseInt(ex[1]),
							switch: parseInt(ex[2]),

							position1: {
								x: parseFloat(ex[3]),
								y: parseFloat(ex[4]),
								z: parseFloat(ex[5]),
							},
							position2: {
								x: parseFloat(ex[6]),
								y: parseFloat(ex[7]),
								z: parseFloat(ex[8]),
							},
						});
					} else {
						// Sphere
						parsedIPL.auzo.push({
							name: ex[0],
							id: parseInt(ex[1]),
							switch: parseInt(ex[2]),

							position: {
								x: parseFloat(ex[3]),
								y: parseFloat(ex[4]),
								z: parseFloat(ex[5]),
							},

							radius: parseFloat(ex[6]),
						});
					}
				} else if (currentSection === "path") {
					// Left over from VC?
				} else if (currentSection === "occl") {
					// Occlusion Zones
					const ex = line.split(",");
					parsedIPL.occl.push({
						middleX: parseFloat(ex[0]),
						middleY: parseFloat(ex[1]),
						bottomZ: parseFloat(ex[2]),
						widthX: parseFloat(ex[3]),
						widthY: parseFloat(ex[4]),
						height: parseFloat(ex[5]),
						rotation: parseFloat(ex[6]),
					});
				} else if (currentSection === "tcyc") {
					// TimeCycle Override Zone
					const ex = line.split(",");
					parsedIPL.tcyc.push({
						position1: {
							x: parseFloat(ex[0]),
							y: parseFloat(ex[1]),
							z: parseFloat(ex[2]),
						},
						position2: {
							x: parseFloat(ex[3]),
							y: parseFloat(ex[4]),
							z: parseFloat(ex[5]),
						},
						farClip: parseInt(ex[6]),
						extraColor: parseInt(ex[7]),
						extraColorIntensity: parseFloat(ex[8]),

						// Appaarently these are optional, the vanilla game *always* specifies them though.
						// I may have to come back to fix this if any mods don't specify them.
						fallOffDist: parseFloat(ex[9]),
						// Unused ex[10]
						lodDistMultiplier: parseFloat(ex[11]),
					});
				} else if (currentSection === "enex") {
					const ex = line.split(",");
					
					// Clean the name up
					let name = ex[13].trim();
					// Strip quotes
					name = name.substring(1, name.length-1);

					parsedIPL.enex.push({
						entrancePosition: {
							x: parseFloat(ex[0]),
							y: parseFloat(ex[1]),
							z: parseFloat(ex[2]),
						},
						enterAngle: parseFloat(ex[3]),
						entrySize: {
							x: parseFloat(ex[4]),
							y: parseFloat(ex[5]),
							z: parseFloat(ex[6]),
						},
						exitPosition: {
							x: parseFloat(ex[7]),
							y: parseFloat(ex[8]),
							z: parseFloat(ex[9]),
						},
						exitAngle: parseFloat(ex[10]),
						targetInterior: parseInt(ex[11]),
						flags: parseInt(ex[12]),
						name,
						sky: parseInt(ex[14]),
						numPedsToSpawn: parseInt(ex[15]),
						timeOn: parseInt(ex[16]),
						timeOff: parseInt(ex[17]),
					});
				} else if (currentSection === "grge") {
					// Garages
					const ex = line.split(",");
					parsedIPL.grge.push({
						position: {
							x: parseFloat(ex[0]),
							y: parseFloat(ex[1]),
							z: parseFloat(ex[2]),
						},
						lineX: parseFloat(ex[3]),
						lineY: parseFloat(ex[4]),
						cube: {
							x: parseFloat(ex[5]),
							y: parseFloat(ex[6]),
							z: parseFloat(ex[7]),
						},
						flags: parseInt(ex[8]),
						type: parseInt(ex[9]),
						name: ex[10],
					});
				} else if (currentSection === "zone") {
					// Map Zones
					const ex = line.split(",");
					parsedIPL.zone.push({
						name: ex[0].trim(),
						type: parseInt(ex[1]),
						min: {
							x: parseFloat(ex[2]),
							y: parseFloat(ex[3]),
							z: parseFloat(ex[4]),
						},
						max: {
							x: parseFloat(ex[5]),
							y: parseFloat(ex[6]),
							z: parseFloat(ex[7]),
						},
						island: parseInt(ex[8]),
						// San Andreas carries a GXT key for the zone's
						// on-screen name in a tenth column; GTA III has no
						// such column and uses the zone name itself.
						text: (ex[9] ?? ex[0]).trim(),
					});
				} else if (currentSection === "pick") {
					// Item Pickup
					const ex = line.split(",");
					parsedIPL.pick.push({
						id: parseInt(ex[0]),
						position: {
							x: parseFloat(ex[1]),
							y: parseFloat(ex[2]),
							z: parseFloat(ex[3]),
						},
					});
				} else {
					console.warn(`Ignoring IPL Section '${currentSection}'`);
				}

			}
		}

		return parsedIPL;
	}


	// Loads IPL Data into memory
	loadIPL() {

		for (let iplPath of this.gtaData.ipl) {

			const iplData = this.getFile(iplPath);
			if (!iplData) {
				console.warn("Failed to read IPL: %s", iplPath);
				continue;
			}

			const parsedPath = path.parse(iplPath);

			const parsedIPL = this.parseTextIPL(iplPath, iplData);

			const mainIPL: MainIPL = {
				name: parsedPath.name,
				iplObjects: parsedIPL.inst,
				cullZones: parsedIPL.cull,
				audioZones: parsedIPL.auzo,
				enexMarkers: parsedIPL.enex,
				occlusionZones: parsedIPL.occl,
				timeCycleZones: parsedIPL.tcyc,
				garageZones: parsedIPL.grge,
				mapZones: parsedIPL.zone,
				itemPickups: parsedIPL.pick,

				streamedObjects: [],
			};

			// Attempt to pre-stream IPLs
			const streamFiles: string[] = [];
			const streamBuffers: Buffer[] = [];

			for (let i=0; i<50; i++) {
				const filename = `${mainIPL.name}_stream${i}.ipl`;
				const iplFile = this.getFile(filename);

				if (!iplFile) {
					break;
				}

				streamFiles.push(filename);
				streamBuffers.push(iplFile);
			}

			if (streamFiles.length > 0) {
				const streamedIPL = this.parseBinaryIPL(streamFiles, streamBuffers);

				// Link LODs
				for (let streamObj of streamedIPL.inst) {
					if (streamObj.lod >= 0) {
						streamObj.lodObject = mainIPL.iplObjects[streamObj.lod];
					}
				}

				mainIPL.streamedObjects.push( ...streamedIPL.inst );
			}

			for (let staticObj of mainIPL.iplObjects) {
				if (staticObj.lod >= 0) {
					staticObj.lodObject = mainIPL.iplObjects[staticObj.lod];
				}
			}

			this.loadedIPLs.push(mainIPL);
		}

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
				// Skip comments and empty lines.
				if (line.startsWith("#") || line.trim() === "") {
					continue;
				}

				// Handle sections
				if (line.trim().split(" ").length === 1) {
					if (line === "end") {
						if (currentSection == "") {
							throw new Error("Unexpected section end in IDE");
						}
						currentSection = "";
					} else {
						if (currentSection !== "") {
							throw new Error("Already inside "+currentSection+" section! Line " + lines.indexOf(line));
						}
						currentSection = line;
					}
					continue;
				}


				if (currentSection === "objs") {
					// Load objects - https://gtamods.com/wiki/OBJS
					// Theres 4 types

					// Type 1 - 6 Params
					// Type 2 - 7 Params
					// Type 3 - 8 Params
					// Type 4 - 5 Params

					const ex = line.split(",");

					// Object Count is optional and defaults to 1
					let objectCount = 1;
					let drawDistance: number[] = [];
					let flags: number = -1;

					if (ex.length === 6) {
						// Type 1
						drawDistance.push( parseFloat(ex[4]) );
						flags = parseInt(ex[5]);
					} else if (ex.length === 7) {
						// Type 2
						drawDistance.push( parseFloat(ex[4]) );
						drawDistance.push( parseFloat(ex[5]) );
						flags = parseInt(ex[6]);
					} else if (ex.length === 8) {
						// Type 3
						drawDistance.push( parseFloat(ex[4]) );
						drawDistance.push( parseFloat(ex[5]) );
						drawDistance.push( parseFloat(ex[6]) );
						flags = parseInt(ex[7]);
					} else if (ex.length === 5) {
						drawDistance.push( parseFloat(ex[3]) );
						flags = parseInt(ex[4]);
					}

					this.ideObjects.push({
						id: parseInt(ex[0]),
						modelName: ex[1].trim(),
						textureName: ex[2].trim(),

						// Variable based on type
						objectCount, // Type 4 lacks this, but I added it anyway
						drawDistance,
						flags,
					});
				}

				if (currentSection === "tobj") {
					const ex = line.split(",");

					// TOBJ format: ID, ModelName, TxdName, {DrawDist...}, Flags, TimeOn, TimeOff
					// Same variable-length LOD-chain shape as OBJS above, just with two
					// extra trailing time fields - unlike OBJS's "Type 2/3" variants,
					// there is no explicit object/LOD count field to read; it's inferred
					// from the line length instead (confirmed against real IDE data,
					// e.g. VegasN.ide: "casinoblock2_dy, vgnfremnt2, 150, 128, 6, 21" is
					// dist=150, flags=128, timeOn=6, timeOff=21 - no count field).
					const objectCount = Math.max(1, ex.length - 6);

					const drawDistance: number[] = [];
					for (let i=0; i<objectCount; i++) {
						drawDistance.push(parseFloat(ex[3 + i]));
					}

					this.ideTimedObjects.push({
						id: parseInt(ex[0]),
						modelName: ex[1].trim(),
						textureName: ex[2].trim(),
						objectCount,
						drawDistance, // 3 .. 2+objectCount
						flags: parseInt(ex[3 + objectCount]),
						timeOn: parseInt(ex[4 + objectCount]),
						timeOff: parseInt(ex[5 + objectCount]),
					});
				}
				if (currentSection === "anim") {
					const ex = line.split(",");

					this.ideAnimatedObjects.push({
						id: parseInt(ex[0]),
						modelName: ex[1].trim(),
						textureName: ex[2].trim(),
						animationName: ex[3].trim(),
						objectCount: 1,
						drawDistance: [parseFloat(ex[4])],
						flags: parseInt(ex[5]),
					});
				}

				if (currentSection === "cars") {
					const ex = line.split(",").map((l) => l.trim());
					
					const vehId = parseInt(ex[0]);
					const modelName = ex[1];
					const txdName = ex[2];
					const type = ex[3];
					const handlingId = ex[4];
					const gameName = ex[5];
					const anims = (ex[6] === "null" ? null : ex[6]);
					const vehicleClass = ex[7];
					
					const frequency = parseInt(ex[8]);
					const flags = parseInt(ex[9]);
					const comprules = parseInt(ex[10], 16); // They're stored as a hex string...?!

					const vehicle: VehicleBaseDefinition = {
						id: vehId,
						modelName,
						txdName,
						//@ts-expect-error -- Lazy
						type,
						handlingId,
						gameName,
						anims,
						vehicleClass,
						frequency,
						flags,
						comprules,
					};

					// There *should* be extra code here to specific types..
					const groundTypes = [
						"car", "trailer", "quad", "mtruck", "bmx", "bike"
					];
					if (groundTypes.includes(type)) {
						const wheelId = parseInt(ex[11]);
						const wheelScaleFront = parseFloat(ex[12]);
						const wheelScaleRear = parseFloat(ex[13]);
						const wheelUpgradeClass = parseInt(ex[14]);

						const groundVehicle = vehicle as VehicleGroundDefinition;
						
						groundVehicle.wheelId = wheelId;
						groundVehicle.wheelScaleFront = wheelScaleFront;
						groundVehicle.wheelScaleRear = wheelScaleRear;
						groundVehicle.wheelUpgradeClass = wheelUpgradeClass;
					}

					this.vehicleDefinitions.push(vehicle);


				}
			}
		}

		console.log(`Loaded %s IDE Objects`, this.ideObjects.length);
		console.log(`Loaded %s IDE Timed Objects`, this.ideTimedObjects.length);
	}

	getObject(id: number): IDEObject | IDETimedObject | IDEAnimatedObject | null {
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

		for (let anim of this.ideAnimatedObjects) {
			if (id === anim.id) {
				return anim;
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

			// GTA III and Vice City archives have no header - their directory
			// lives in a sibling .dir file which has to be handed to the
			// reader alongside the data.
			let rawDir: Buffer | undefined;
			if (this.gameVersion !== GameVersion.SanAndreas) {
				const dirPath = fullPath.replace(/\.img$/i, ".dir");
				if (!fs.existsSync(dirPath)) {
					console.warn(`No .dir alongside %s - skipping (version 1 archives need one)`, fullPath);
					continue;
				}
				rawDir = fs.readFileSync(dirPath);
			}

			const reader = new IMGReader(rawIMG, rawDir);

			this.imgReaders[imgPath] = reader;
			console.log("%s contains %s entries.", fullPath, reader.entries.length);

			for (let entry of reader.entries) {
				this.imgContents[entry.fileName] = imgPath;
			}
		}

	}

	// Parses every .col archive this reader found (each holding many named
	// models) into this.collisionModels. Call after loadIMG() - it walks
	// the already-loaded IMG readers rather than reading gta3.img etc again.
	loadCollision() {
		console.log("Loading Collision Files");

		for (let imgPath in this.imgReaders) {
			const reader = this.imgReaders[imgPath];
			for (let entry of reader.entries) {
				const name = entry.fileName.trim();
				if (!name.toLowerCase().endsWith(".col")) {
					continue;
				}
				const raw = reader.readFile(name);
				if (!raw) {
					continue;
				}
				this.indexCollisionArchive(raw, `${imgPath}/${name}`);
			}
		}

		// Ped/vehicle/weapon collision isn't bundled into any IMG archive -
		// it's a handful of loose files under models/coll/.
		const looseArchives = ["MODELS\\COLL\\PEDS.COL", "MODELS\\COLL\\VEHICLES.COL", "MODELS\\COLL\\WEAPONS.COL"];
		for (let relPath of looseArchives) {
			const fullPath = path.join(this.gtaPath, relPath);
			if (!fs.existsSync(fullPath)) {
				console.warn(`Unable to find loose collision file: %s`, fullPath);
				continue;
			}
			this.indexCollisionArchive(fs.readFileSync(fullPath), relPath);
		}

		console.log(`Loaded %s collision models`, this.collisionModels.size);
	}

	private indexCollisionArchive(raw: Uint8Array, sourceLabel: string) {
		let reader: COLReader;
		try {
			reader = new COLReader(raw);
		} catch (err) {
			console.warn(`Failed to parse collision archive %s`, sourceLabel, err);
			return;
		}
		for (let model of reader.models) {
			this.collisionModels.set(model.name.toLowerCase(), model);
		}
	}

	/**
	 * Looks up a collision model by name (case-insensitive) - matches the
	 * DFF/IDE model name it applies to.
	 */
	getCollisionModel(modelName: string): COLModel | null {
		return this.collisionModels.get(modelName.toLowerCase()) ?? null;
	}

	// Parses every .ifp archive this reader found into this.animationPackages,
	// keyed by filename (without extension). Call after loadIMG() - mirrors
	// loadCollision()'s approach of walking the already-loaded IMG readers
	// rather than re-reading anim.img etc separately.
	loadAnimations() {
		console.log("Loading Animation Files");

		for (let imgPath in this.imgReaders) {
			const reader = this.imgReaders[imgPath];
			for (let entry of reader.entries) {
				const name = entry.fileName.trim();
				if (!name.toLowerCase().endsWith(".ifp")) {
					continue;
				}
				const raw = reader.readFile(name);
				if (!raw) {
					continue;
				}
				this.indexAnimationPackage(raw, name, `${imgPath}/${name}`);
			}
		}

		// The default ped animation set isn't bundled into any IMG archive -
		// it's a loose file at anim/ped.ifp, always loaded regardless of
		// which ped/context is active (unlike anim.img's other entries,
		// which the real game swaps in on demand).
		const loosePath = "ANIM\\PED.IFP";
		const fullPath = path.join(this.gtaPath, loosePath);
		if (fs.existsSync(fullPath)) {
			this.indexAnimationPackage(fs.readFileSync(fullPath), "ped.ifp", loosePath);
		} else {
			console.warn(`Unable to find loose animation file: %s`, fullPath);
		}

		console.log(`Loaded %s animation packages`, this.animationPackages.size);
	}

	private indexAnimationPackage(raw: Uint8Array, fileName: string, sourceLabel: string) {
		const packageName = fileName.replace(/\.ifp$/i, "").toLowerCase();
		try {
			this.animationPackages.set(packageName, new IFPReader(raw));
		} catch (err) {
			console.warn(`Failed to parse animation package %s`, sourceLabel, err);
		}
	}

	/**
	 * Looks up a single animation clip by its package (IFP file name, without
	 * extension - e.g. "ped", "airport") and animation name (both
	 * case-insensitive, matching how the game itself resolves them).
	 */
	getAnimation(packageName: string, animationName: string): IFPAnimation | null {
		const pkg = this.animationPackages.get(packageName.toLowerCase());
		return pkg?.getAnimation(animationName) ?? null;
	}

	/** Every loaded animation package name (IFP file name, without extension). */
	getAnimationPackageNames(): string[] {
		return [...this.animationPackages.keys()];
	}

	/** Every animation name within a given package, or an empty array if the package doesn't exist. */
	getAnimationNames(packageName: string): string[] {
		const pkg = this.animationPackages.get(packageName.toLowerCase());
		return pkg?.animations.map(a => a.name) ?? [];
	}

	getAssociatedIMG(filename: string) {

		for (let fileEntry in this.imgContents) {
			if (fileEntry.toLowerCase() === filename.toLowerCase()) {
				return this.imgContents[fileEntry];
			}
		}

		return null;
	}

	// Attempts to parse a path to separate out an archive file
	// IMG, TXD and DFF are all treated as 'archive' files as they contain
	// named resources.
	parsePath(filePath: string): { archive: string, file: string } {
		const ex = filePath.split(path.sep);
		
		const img: string[] = [];
		const file: string[] = [];
		let foundImage = false;

		const archiveFiles = [
			"img",
			"txd",
			"dff",
		];

		for (let dir of ex) {
			if (!foundImage) {
				img.push(dir);

				const ex = dir.split(".");
				let ext = "";
				if (ex.length >= 2) {
					ext = ex[ex.length - 1]
				}

				if (archiveFiles.includes(ext.toLowerCase())) {
					foundImage = true;
				}
			} else {
				file.push(dir);
			}
		}

		if (file.length === 0) {
			return {
				archive: "",
				file: path.join(...img),
			};
		}

		return {
			archive: path.join(...img),
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
		
		if (parsedPath.archive === "") {
			const filePath = path.join(this.gtaPath, parsedPath.file);
			if (fs.existsSync(filePath)) {

				// Ignore directories
				const fileStat = fs.statSync(filePath);
				if (fileStat.isDirectory()) {
					return null;
				}

				return fs.readFileSync(filePath);
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

			if (parsedPath.archive === "") {
				console.warn("File %s doesn't exist!", parsedPath.file);
				return null;
			}

			// Load the IMG
			const imgPath = path.join(this.gtaPath, parsedPath.archive);
			if (!fs.existsSync(imgPath)) {
				console.warn("IMG file %s doesn't exist!", parsedPath.archive);
				return null;
			}

			const imgData = fs.readFileSync(imgPath);
			reader = new IMGReader(imgData);
			this.imgReaders[parsedPath.archive] = reader;
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

	/**
	 * Returns the raw RGBA pixel data of the supplied texture path.
	 * Null if the texture doesn't exist.
	 * @param txdPath Path to TXD, can be on disk or within an .img
	 * @param textureName Name of texture within the TXD.
	 */
	// textureName (lowercased) -> the TXD file it was found in. Built on
	// first use by findTextureOwner(), see there for why.
	private textureIndex?: Map<string, string>;

	/**
	 * Finds a TXD containing `textureName`, for textures a model references
	 * but that aren't in the TXD its IDE entry names.
	 *
	 * San Andreas barely needs this - 1 of 634 texture references in a
	 * 250 model sample came from elsewhere. GTA III leans on it heavily
	 * (191 of 1141, 16.7%): its road pieces in particular declare
	 * generic.txd while their textures live in whichever area TXD happens to
	 * be resident, which the real game gets away with because it loads TXDs
	 * per area into shared slots. The same texture is duplicated across
	 * every area TXD that needs it (curb_64H is in 46 of them), so any copy
	 * will do.
	 *
	 * The index costs a parse of every TXD in the mounted archives, so it's
	 * built on the first miss rather than during load.
	 */
	findTextureOwner(textureName: string): string | null {
		if (!this.textureIndex) {
			this.textureIndex = new Map();
			for (const imgPath in this.imgReaders) {
				const reader = this.imgReaders[imgPath];
				for (const entry of reader.entries) {
					if (!entry.fileName.toLowerCase().endsWith(".txd")) {
						continue;
					}
					const raw = reader.readFile(entry.fileName);
					if (!raw) {
						continue;
					}
					let txd: TXDReader;
					try {
						txd = new TXDReader(raw);
					} catch {
						continue;
					}
					for (const texture of txd.getTextures()) {
						const key = texture.name.toLowerCase();
						// First writer wins - any copy of a duplicated texture
						// is as good as another.
						if (!this.textureIndex.has(key)) {
							this.textureIndex.set(key, entry.fileName);
						}
					}
				}
			}
			console.log(`\tIndexed %s texture names across all TXDs`, this.textureIndex.size);
		}

		return this.textureIndex.get(textureName.toLowerCase()) ?? null;
	}

	async getTexture(txdPath: string, textureName: string): Promise<PixelData | null> {
		const parsedPath = this.parsePath(txdPath);

		let txdFilename = parsedPath.archive;

		// Support TXD files within gta3.img
		if (parsedPath.archive.endsWith(".img")) {
			const furtherParsed = this.parsePath(parsedPath.file);
			txdFilename = path.join(txdPath, furtherParsed.archive);
		}

		const txd = this.getTXD(txdPath);

		if (txd) {
			const tex = txd.getPixelData(textureName);
			if (tex) {
				return tex;
			}
		}

		// Not where the model said it would be - find a TXD that does have it
		// rather than leaving the caller with nothing to bind.
		const owner = this.findTextureOwner(textureName);
		if (!owner) {
			return null;
		}

		const fallbackTxd = this.getTXD(owner);
		return fallbackTxd ? fallbackTxd.getPixelData(textureName) : null;
	}

	/**
	 * Parses one GTA III timecyc.dat row into the same shape San Andreas
	 * rows produce, so consumers don't have to care which game they're
	 * looking at.
	 *
	 * III writes 40 values where San Andreas writes 51, in this order (the
	 * file documents it in its own header comment):
	 *
	 *   Amb(3) Dir(3) SkyTop(3) SkyBot(3) SunCore(3) SunCorona(3)
	 *   SunSz SprSz SprBght  Shdw LightShd TreeShd  FarClp FogSt LightOnGround
	 *   LowClouds(3) TopClouds(3) BottomClouds(3)  then a trailing RGBA
	 *
	 * Everything through LightOnGround maps across directly. III has no
	 * separate ambient colour for dynamic objects, no water tint and no
	 * colour correction pair, so those are filled in from the nearest
	 * equivalent rather than invented.
	 */
	private parseGTA3Weather(ex: string[]): WeatherDefinition {
		const colour = (i: number, a = 255) => ({
			r: parseInt(ex[i]),
			g: parseInt(ex[i + 1]),
			b: parseInt(ex[i + 2]),
			a,
		});

		return {
			ambientColor: colour(0),
			// No distinct dynamic-object ambient in III - the one ambient
			// value lights everything.
			ambientObjectColor: colour(0),
			directLight: colour(3),
			skyTop: colour(6),
			skyBottom: colour(9),
			sunCore: colour(12),
			sunCorona: colour(15),
			sunSize: parseFloat(ex[18]),
			spriteSize: parseFloat(ex[19]),
			spriteBrightness: parseFloat(ex[20]),
			shadowIntensity: parseInt(ex[21]),
			lightShd: parseInt(ex[22]),
			poleShd: parseInt(ex[23]),
			farClipping: parseFloat(ex[24]),
			fogStart: parseFloat(ex[25]),
			lightOnGround: parseFloat(ex[26]),
			lowCloudsColor: colour(27),
			// 30 is the top cloud colour, which this shape has no slot for.
			bottomCloudColor: colour(33),
			waterColor: { r: 255, g: 255, b: 255, a: 255 },

			// San Andreas' colour correction pair has no GTA III equivalent,
			// so it's left neutral: consumers multiply by (RGB1 + RGB2), and
			// 255 + 0 is an identity multiply.
			//
			// Columns 36-39 are a trailing RGBA that III's own header comment
			// doesn't document (it only accounts for 36 of the 40 values).
			// They swing from orange at dawn to blue at night, which fits a
			// post-processing tint rather than anything to multiply the scene
			// by - feeding them in here as a correction pair tinted the whole
			// world blue. Left unmapped until what they drive is confirmed.
			alpha1: 255,
			RGB1: { r: 255, g: 255, b: 255, a: 255 },
			alpha2: 255,
			RGB2: { r: 0, g: 0, b: 0, a: 255 },
			cloudAlpha: { r: 255, g: 255, b: 255, a: 255 },
		};
	}

	public loadWeather() {
		// We'll ignore the PAL version.
		const timeCycPath = path.join(this.gtaPath, "data", "timecyc.dat");

		if (!fs.existsSync(timeCycPath)) {
			throw new Error("Missing timecyc.dat!");
		}


		const timeCycData = fs.readFileSync(timeCycPath);
		const lines = timeCycData.toString().split('\r\n');

		for (let line of lines) {
			if (line.trim() === "" || line.trim().startsWith("//")) {
				// Skip comments
				continue;
			}
			// Split on any run of whitespace. Splitting on single spaces left
			// an empty string for every repeated space, which shifted every
			// column after it - San Andreas happens to use one separator
			// between values so it got away with it, GTA III doesn't.
			const ex = line.trim().split(/\s+/);

			// GTA III writes 40 values per line, San Andreas 51. The count
			// identifies the layout on its own, so no need to consult the
			// detected game here.
			if (ex.length < 51) {
				this.weatherDefinitions.push(this.parseGTA3Weather(ex));
				continue;
			}

			const weather: WeatherDefinition = {
				ambientColor: {
					r: parseInt(ex[0]),
					g: parseInt(ex[1]),
					b: parseInt(ex[2]),
					a: 255,
				},
				ambientObjectColor: {
					r: parseInt(ex[3]),
					g: parseInt(ex[4]),
					b: parseInt(ex[5]),
					a: 255,
				},
				directLight: {
					r: parseInt(ex[6]),
					g: parseInt(ex[7]),
					b: parseInt(ex[8]),
					a: 255,
				},
				skyTop: {
					r: parseInt(ex[9]),
					g: parseInt(ex[10]),
					b: parseInt(ex[11]),
					a: 255,
				},
				skyBottom: {
					r: parseInt(ex[12]),
					g: parseInt(ex[13]),
					b: parseInt(ex[14]),
					a: 255,
				},
				sunCore: {
					r: parseInt(ex[15]),
					g: parseInt(ex[16]),
					b: parseInt(ex[17]),
					a: 255,
				},
				sunCorona: {
					r: parseInt(ex[18]),
					g: parseInt(ex[19]),
					b: parseInt(ex[20]),
					a: 255,
				},
				sunSize: parseFloat(ex[21]),
				spriteSize: parseFloat(ex[22]),
				spriteBrightness: parseFloat(ex[23]),
				shadowIntensity: parseInt(ex[24]),
				lightShd: parseInt(ex[25]),
				poleShd: parseInt(ex[26]),
				farClipping: parseFloat(ex[27]),
				fogStart: parseFloat(ex[28]),
				lightOnGround: parseFloat(ex[29]),
				lowCloudsColor: {
					r: parseInt(ex[30]),
					g: parseInt(ex[31]),
					b: parseInt(ex[32]),
					a: 255,
				},
				bottomCloudColor: {
					r: parseInt(ex[33]),
					g: parseInt(ex[34]),
					b: parseInt(ex[35]),
					a: 255,
				},
				waterColor: {
					r: parseInt(ex[36]),
					g: parseInt(ex[37]),
					b: parseInt(ex[38]),
					a: parseInt(ex[39]),
				},
				alpha1: parseInt(ex[40]),
				RGB1: {
					r: parseInt(ex[41]),
					g: parseInt(ex[42]),
					b: parseInt(ex[43]),
					a: 255,
				},
				alpha2: parseInt(ex[44]),
				RGB2: {
					r: parseInt(ex[45]),
					g: parseInt(ex[46]),
					b: parseInt(ex[47]),
					a: 255,
				},
				cloudAlpha: {
					r: parseInt(ex[48]),
					g: parseInt(ex[49]),
					b: parseInt(ex[50]),
					a: 255,
				},
			};
			this.weatherDefinitions.push(weather);
		}

		// Build our weathers
		const weatherNames = [
			"EXTRASUNNY_LA",
			"SUNNY_LA",
			"EXTRASUNNY_SMOG_LA",
			"SUNNY_SMOG_LA",
			"CLOUDY_LA",

			"SUNNY_SF",
			"EXTRASUNNY_SF",
			"CLOUDY_SF",
			"RAINY_SF",
			"FOGGY_SF",

			"SUNNY_VEGAS",
			"EXTRASUNNY_VEGAS",
			"CLOUDY_VEGAS",

			"EXTRASUNNY_COUNTRYSIDE",
			"SUNNY_COUNTRYSIDE",
			"CLOUDY_COUNTRYSIDE",
			"RAINY_COUNTRYSIDE",

			"EXTRASUNNY_DESERT",
			"SUNNY_DESERT",
			"SANDSTORM_DESERT",

			"UNDERWATER",

			// Extra stuff
			"EXTRACOLOURS_1",
			"EXTRACOLOURS_2",
		];

		// GTA III has four weathers with an entry per hour, rather than San
		// Andreas' 23 weathers with eight entries each. Derive both the names
		// and the stride from what was actually parsed instead of assuming
		// San Andreas - the old code sliced 23x8 unconditionally, which on a
		// III install produced empty definition arrays for every weather and
		// no usable weather at all.
		const gta3WeatherNames = ["SUNNY", "CLOUDY", "RAINY", "FOGGY"];

		// Prefer the detected game, but fall back to whichever set actually
		// divides the file evenly. loadWeather() can be called on its own
		// (before detectGame() has run), and picking a set that doesn't fit
		// silently produces weathers with missing entries.
		const divides = (set: string[]) => this.weatherDefinitions.length > 0
			&& this.weatherDefinitions.length % set.length === 0;

		let names = (this.gameVersion === GameVersion.SanAndreas) ? weatherNames : gta3WeatherNames;
		if (!divides(names)) {
			const alternative = (names === weatherNames) ? gta3WeatherNames : weatherNames;
			if (divides(alternative)) {
				names = alternative;
			}
		}
		// San Andreas' 184 entries divide by both 23 and 4, so disambiguate
		// on the total: only III ships 96.
		if (this.weatherDefinitions.length === 96) {
			names = gta3WeatherNames;
		}

		const timeCount = Math.floor(this.weatherDefinitions.length / names.length);

		if (timeCount <= 0) {
			console.warn(
				`timecyc.dat held %s definitions, which doesn't divide into %s weathers - weather will be unavailable`,
				this.weatherDefinitions.length, names.length,
			);
			return;
		}

		let offset = 0;
		for (let name of names) {
			const definitions: WeatherDefinition[] = [];

			for (let i=0; i<timeCount; i++) {
				const definition = this.weatherDefinitions[offset];
				if (definition) {
					definitions.push(definition);
				}
				offset++;
			}

			this.weather[name] = definitions;
		}

		console.log(`Loaded %s weathers (%s entries each)`, names.length, timeCount);
	}

	/**
	 * Every weather name available for the loaded game - San Andreas and
	 * GTA III use entirely different sets, so callers shouldn't hardcode one.
	 */
	getWeatherNames(): string[] {
		return Object.keys(this.weather);
	}

	loadLanguages() {
		const languages = [
			"american",
			"french",
			"german",
			"italian",
			"spanish"
		];
		
		for (let lang of languages) {
			const gxtPath = path.join(this.gtaPath, "text", `${lang}.gxt`);

			if (!fs.existsSync(gxtPath)) {
				console.warn(`Unable to find GXT file for ${lang}, it will not be loaded.`);
				continue;
			}

			const gxtData = fs.readFileSync(gxtPath);
			try {
				this.languageReaders[lang] = new LanguageReader(gxtData);
			} catch (err) {
				// GTA III and Vice City use an older GXT layout that
				// LanguageReader doesn't handle yet. Text is optional for
				// everything else the loader does, so warn rather than
				// taking the entire load down with it.
				console.warn(`Unable to parse GXT file for ${lang}, it will not be loaded:`, (err as Error).message);
			}
		}
	}

	
	loadVehicleHandling() {
		// Very much a heavy work in progress.
		const handlingPath = path.join(this.gtaPath, "data", "handling.cfg");
		
		if (!fs.existsSync(handlingPath)) {
			throw new Error("Missing handling.cfg");
		}

		const handlingData = fs.readFileSync(handlingPath);

		const lines = handlingData.toString().split("\r\n");

		const cars: CarHandlingDefinition[] = [];
		const boats = [];
		const bikes: BikeHandlingDefinition[] = [];
		const flying: FlyingHandlingDefinition[] = [];
		const anim = [];

		for (let line of lines) {
			// Skip empty lines
			if (line.trim() === "") {
				continue;
			}
			// Skip comments, WHY ;!?!
			if (line.startsWith(";")) {
				continue;
			}


			// Store what type of vehicle we're dealing with.
			let type = "car";
			if (line.startsWith("%")) {
				type = "boat";
			} else if (line.startsWith("!")) {
				type = "bike";
			} else if (line.startsWith("$")) {
				type = "flying"; // Covers Planes & Helicopters
			} else if (line.startsWith("^")) {
				type = "anim"; // 
			}

			if (type !== "car") {
				// Trim that first character off.
				line = line.substring(1);
			}

			// Get rid of spaces and tabs and split the line by 'gaps'
			const ex = line.split("\t").join(" ").split(" ").filter(c => c.trim() !== "");
			
			if (type === "car" || type === "bike" || type === "flying") {
				// Handle car definition
				const veh: CarHandlingDefinition | BikeHandlingDefinition | FlyingHandlingDefinition = {
					id: ex[0],
					mass: parseFloat(ex[1]),
					turnMass: parseFloat(ex[2]),
					dragMult: parseFloat(ex[3]),
					centreOfMass: {
						x: parseFloat(ex[4]),
						y: parseFloat(ex[5]),
						z: parseFloat(ex[6]),
					},
					percentSubmerged: parseFloat(ex[7]),
					tractionMultiplier: parseFloat(ex[8]),
					tractionLoss: parseFloat(ex[9]),
					tractionBias: parseFloat(ex[10]),
					transmissionData: {
						numberOfGears: parseInt(ex[11]),
						maxVelocity: parseFloat(ex[12]),
						engineAcceleration: parseFloat(ex[13]),
						engineInertia: parseFloat(ex[14]),
						driveType: ex[15],
						engineType: ex[16],
					},
					brakeDeceleration: parseFloat(ex[17]),
					brakeBias: parseFloat(ex[18]),
					abs: (ex[19] === "0" ? false: true),
					steeringLock: (ex[20] === "0" ? false: true),
					suspensionForceLevel: ex[21],
					suspensionDampingLevel: ex[22],
					suspensionHighSpdComDamp: parseFloat(ex[23]),
					suspensionUpperLimit: parseFloat(ex[24]),
					suspensionLowerLimit: parseFloat(ex[25]),
					suspensionBiasFront: parseFloat(ex[26]),
					suspensionAntiDiveMultiplier: parseFloat(ex[27]),
					seatOffsetDistance: parseFloat(ex[28]),
					collisionDamageMultiplier: parseFloat(ex[29]),
					monetaryValue: parseFloat(ex[30]),
					modelFlags: parseInt(ex[31], 16),
					handlingFlags: parseInt(ex[32], 16),
					frontLights: parseInt(ex[33]),
					rearLights: parseInt(ex[34]),
					animGroup: parseInt(ex[35]),
				};
				if (type === "car") {
					cars.push(veh);
				} else if (type === "bike") {
					bikes.push(veh);
				} else if (type === "flying") {
					flying.push(veh);
				}
			}
		}

		this.vehicleHandling.cars.push(...cars);
		this.vehicleHandling.bikes.push(...bikes);
		this.vehicleHandling.flying.push(...flying);

	}

	// Returns the string, if found otherwise null.
	readLanguageString(gxtKey: string): string | null {
		if (typeof this.languageReaders[this.language] === "undefined") {
			return null;
		}
		const reader = this.languageReaders[this.language];
		return reader.readString(gxtKey);
	}

	loadCarCols() {
		const carColsPath = path.join(this.gtaPath, "data", "carcols.dat");

		if (!fs.existsSync(carColsPath)) {
			throw new Error("Unable to find carcols.dat!");
		}

		const carColsData = fs.readFileSync(carColsPath);
		const carColsSections = this.parseIDEFormat(carColsData);

		for (let section of carColsSections) {
			for (let line of section.lines) {

				// Trim comments off the end.
				if (line.indexOf("#") > -1) {
					line = line.substring(0, line.indexOf("#"));
				}

				const ex = line.trim().split(" ").join("").split(",");
				

				if (section.sectionName === "col") {
					this.vehicleColorPalette.push({
						r: parseInt(ex[0]),
						g: parseInt(ex[1]),
						b: parseInt(ex[2]),
						a: 255,
					});
				}

				if (section.sectionName === "car") {

					const colorPairs: { color1: number, color2: number }[] = [];

					for (let i=1; i<ex.length; i+=2) {
						colorPairs.push({
							color1: parseInt(ex[i]),
							color2: parseInt(ex[i + 1])
						});
					}

					this.vehicleColors.push({
						modelName: ex[0],
						colorPairs,
					});
				}

				if (section.sectionName === "car") {

					const colorPairs: { color1: number, color2: number, color3: number, color4: number }[] = [];

					for (let i=1; i<ex.length; i+=4) {
						colorPairs.push({
							color1: parseInt(ex[i]),
							color2: parseInt(ex[i + 1]),
							color3: parseInt(ex[i + 2]),
							color4: parseInt(ex[i + 3]),
						});
					}

					this.vehicleColors.push({
						modelName: ex[0],
						colorPairs,
					});
				}
			}
			
		}
	}

	/**
	 * Parses an IDE styled formatted file and returns all found sections and their lines.
	 * The expected format is the section name, section contents followed by the keyword "end"
	 * 
	 * Comments can begin with // or with #
	 * Blank lines are skipped.
	 * @param data 
	 */
	parseIDEFormat(data: Buffer): IDESection[] {
		const lines = data.toString().split('\r\n');
		const foundSections: IDESection[] = [];

		let currentSection: string = "";
		let foundLines: string[] = [];

		for (let line of lines) {
			line = line.trim();

			// Skip comments and empty lines.
			if (line.startsWith("#") || line === "" || line.startsWith("//")) {
				continue;
			}

			// Check if the line is a section name or "end".
			if (/^[A-Za-z0-9]+$/.test(line)) {
				// Convert to lower case for case-insensitive comparison
				const normalizedLine = line.toLowerCase();

				if (normalizedLine === "end") {
					// Check if there's an active section to end
					if (currentSection === "") {
						console.error("Unexpected 'end' without a section being opened.");
						throw new Error("Unexpected section end in IDE Format, Current section: '" + currentSection + "'");
					}

					// End the current section
					foundSections.push({
						sectionName: currentSection,
						lines: [...foundLines],
					});
					currentSection = "";
					foundLines = [];
				} else {
					// Check if we're already in a section
					if (currentSection !== "") {
						console.error(`Unexpected line '${line}' while inside section '${currentSection}'.`);
						throw new Error("Already inside '"+currentSection+"' section! Line " + lines.indexOf(line));
					}

					// Start a new section
					currentSection = line;
				}
				continue;
			}

			// If not a section name or "end", it's a content line.
			if (currentSection !== "") {
				foundLines.push(line);
			} else {
				console.error(`Content line found outside of a section: ${line}`);
				throw new Error("Content found outside of a section: " + line);
			}
		}

		return foundSections;
	}

	async load() {
		// The load order should probably be changed
		// Allowing a SA loading screen and music similar to the game
		// For the memes of course and it doesn't require bundling copyrighted material!

		this.emit("loading", { stage: 0 }); // About to start loading
		// Load GTA Data
		this.loadGTADat();

		this.emit("loading", { stage: 1 }); // Loaded GTA.DAT

		// Load in resources as needed.
		this.loadIMG();
		this.emit("loading", { stage: 2 }); // Loaded IMG Data

		this.loadCollision();
		this.emit("loading", { stage: 3 }); // Loaded Collision Data

		this.loadAnimations();
		this.emit("loading", { stage: 4 }); // Loaded Animation Data

		this.loadIDE();
		this.emit("loading", { stage: 5 }); // Loaded IDE Files

		this.loadIPL();
		this.emit("loading", { stage: 6 }); // Loaded IPL Files

		this.loadWeather();
		this.emit("loading", { stage: 7 }); // Loaded Weather Data

		this.loadWaterDefinitions();
		this.emit("loading", { stage: 8 }); // Loaded Water Data

		this.loadLanguages();
		this.emit("loading", { stage: 9 }); // Loaded Language Data

		this.loadCarCols();
		this.emit("loading", { stage: 10 }); // Loaded Car Colour Data

		this.loadVehicleHandling();
		this.emit("loading", { stage: 11 }); // Loaded Vehicle Handling Data

		this.loadPathNodes();
		this.emit("loading", { stage: 12 }); // Loaded Path Nodes

		try {
			await this.sfx.load();
		} catch (err) {
			// The audio layout is San Andreas specific (PakFiles.dat and
			// friends) - GTA III and Vice City organise theirs differently.
			// Sound is optional for everything else here, so don't let it
			// take the whole load down.
			console.warn("Unable to load sound effects, they will be unavailable:", (err as Error).message);
		}
		this.emit("loading", { stage: 13 }); // Loaded sound effects

		// When Loading Stage is equal to the amount of loading stages the loader is finished.
	}
}
export default GameLoader;


export {
	GameVersion,
	IDEFlags,
	PathNodeType
}

export type {
	PathArea,
	PathNode,
	PathLink
}