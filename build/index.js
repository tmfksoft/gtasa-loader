"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const img_reader_1 = __importDefault(require("@majesticfudgie/img-reader"));
const dff_reader_1 = __importDefault(require("@majesticfudgie/dff-reader"));
const txd_reader_1 = __importDefault(require("@majesticfudgie/txd-reader"));
const pointer_buffer_1 = __importDefault(require("@majesticfudgie/pointer-buffer"));
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
    constructor(gtaPath) {
        this.gtaPath = gtaPath;
        this.gtaData = {
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
        this.loadedIPLs = [];
        this.ideObjects = [];
        this.ideTimedObjects = [];
        // Misc
        this.weatherDefinitions = [];
        // IMG Files
        this.imgReaders = {};
        // filename and its corresponding IMG file.
        this.imgContents = {};
    }
    loadGTADat() {
        const datPath = path_1.default.join(this.gtaPath, "data", "gta.dat");
        if (!fs_1.default.existsSync(datPath)) {
            throw new Error("Unable to find gta.dat!");
        }
        const rawDat = fs_1.default.readFileSync(datPath);
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
            }
            else if (type === "ide") {
                this.gtaData.ide.push(path);
            }
            else if (type === "splash") {
                this.gtaData.splash.push(path);
            }
            else if (type === "ipl") {
                this.gtaData.ipl.push(path);
            }
        }
        console.log("Loaded gta.dat:");
        console.log(`\tLoaded %s IMG Paths`, this.gtaData.img.length);
        console.log(`\tLoaded %s IDE Paths`, this.gtaData.ide.length);
        console.log(`\tLoaded %s IPL Paths`, this.gtaData.ipl.length);
        console.log(`\tLoaded %s SPLASH Paths`, this.gtaData.splash.length);
    }
    parseBinaryIPL(name, data) {
        const parsedIPL = {
            name,
            inst: [],
            cull: [],
        };
        const bufList = [];
        if (!Array.isArray(data)) {
            bufList.push(data);
        }
        else {
            bufList.push(...data);
        }
        for (let iplData of bufList) {
            if (iplData.subarray(0, 4).toString() !== "bnry") {
                throw new Error("Supplied IPL is not a binary file!");
            }
            const iplBuf = new pointer_buffer_1.default(iplData);
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
            for (let i = 0; i < numItem; i++) {
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
    parseTextIPL(name, data) {
        const parsedIPL = {
            name,
            inst: [],
            cull: [],
        };
        const iplBuf = [];
        if (Array.isArray(data)) {
            iplBuf.push(...data);
        }
        else {
            iplBuf.push(data);
        }
        for (let iplData of iplBuf) {
            const iplLines = iplData.toString().split('\r\n');
            let currentSection = "";
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
                        iplIndex: parsedIPL.inst.length
                    };
                    parsedIPL.inst.push(iplObject);
                }
                if (currentSection === "cull") {
                    const ex = line.split(",");
                    const cullObj = {
                        center: {
                            x: parseFloat(ex[0]),
                            y: parseFloat(ex[1]),
                            z: parseFloat(ex[2]),
                        },
                        unknown1: parseInt(ex[3]),
                        length: parseFloat(ex[4]),
                        bottom: parseFloat(ex[5]),
                        width: parseFloat(ex[6]),
                        unknown2: parseInt(ex[7]),
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
                    }
                    else {
                        // Nope, chuck testa
                        cullObj.unknown3 = parseInt(ex[10]);
                    }
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
            const parsedPath = path_1.default.parse(iplPath);
            const parsedIPL = this.parseTextIPL(iplPath, iplData);
            const mainIPL = {
                name: parsedPath.name,
                iplObjects: parsedIPL.inst,
                cullZones: parsedIPL.cull,
                streamedObjects: [],
            };
            // Attempt to pre-stream IPLs
            const streamFiles = [];
            const streamBuffers = [];
            for (let i = 0; i < 50; i++) {
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
                mainIPL.streamedObjects.push(...streamedIPL.inst);
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
            const fullPath = path_1.default.join(this.gtaPath, idePath);
            if (!fs_1.default.existsSync(fullPath)) {
                console.warn(`Unable to find IDE file: %s`, fullPath);
                continue;
            }
            const ideData = fs_1.default.readFileSync(fullPath);
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
                    const drawDistance = [];
                    for (let i = 0; i < objectCount; i++) {
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
                    const drawDistance = [];
                    for (let i = 0; i < objectCount; i++) {
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
    getObject(id) {
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
            const fullPath = path_1.default.join(this.gtaPath, imgPath);
            if (!fs_1.default.existsSync(fullPath)) {
                console.warn(`Unable to find IMG File: %s`, fullPath);
                continue;
            }
            const rawIMG = fs_1.default.readFileSync(fullPath);
            const reader = new img_reader_1.default(rawIMG);
            this.imgReaders[imgPath] = reader;
            console.log("%s contains %s entries.", fullPath, reader.entries.length);
            for (let entry of reader.entries) {
                this.imgContents[entry.fileName] = imgPath;
            }
        }
    }
    getAssociatedIMG(filename) {
        //console.log("Looking for %s", filename);
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
    parsePath(filePath) {
        const ex = filePath.split(path_1.default.sep);
        const img = [];
        const file = [];
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
                    ext = ex[ex.length - 1];
                }
                if (archiveFiles.includes(ext.toLowerCase())) {
                    foundImage = true;
                }
            }
            else {
                file.push(dir);
            }
        }
        if (file.length === 0) {
            return {
                archive: "",
                file: path_1.default.join(...img),
            };
        }
        return {
            archive: path_1.default.join(...img),
            file: path_1.default.join(...file),
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
    getFile(filename) {
        const parsedPath = this.parsePath(filename);
        if (parsedPath.archive === "") {
            const filePath = path_1.default.join(this.gtaPath, parsedPath.file);
            if (fs_1.default.existsSync(filePath)) {
                // Ignore directories
                const fileStat = fs_1.default.statSync(filePath);
                if (fileStat.isDirectory()) {
                    return null;
                }
                return fs_1.default.readFileSync(filePath);
            }
        }
        const img = this.getAssociatedIMG(parsedPath.file);
        let reader = null;
        if (img) {
            reader = this.getIMGReader(img);
            if (!reader) {
                console.warn("Couldn't find IMG Reader for %s", img);
                return null;
            }
        }
        else {
            if (parsedPath.archive === "") {
                console.warn("File %s doesn't exist!", parsedPath.file);
                return null;
            }
            // Load the IMG
            const imgPath = path_1.default.join(this.gtaPath, parsedPath.archive);
            if (!fs_1.default.existsSync(imgPath)) {
                console.warn("IMG file %s doesn't exist!", parsedPath.archive);
                return null;
            }
            const imgData = fs_1.default.readFileSync(imgPath);
            reader = new img_reader_1.default(imgData);
            this.imgReaders[parsedPath.archive] = reader;
        }
        const file = reader.readFile(parsedPath.file);
        if (!file) {
            console.warn("Couldn't find %s in reader", parsedPath.file);
            return null;
        }
        return file;
    }
    getIMGReader(imgFile) {
        for (let img in this.imgReaders) {
            if (img.toLowerCase() === imgFile.toLowerCase()) {
                return this.imgReaders[img];
            }
        }
        return null;
    }
    getDFF(filename) {
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
        const dffReader = new dff_reader_1.default(file);
        return dffReader;
    }
    getTXD(filename) {
        const rawTXD = this.getFile(filename);
        if (!rawTXD) {
            return null;
        }
        const reader = new txd_reader_1.default(rawTXD);
        return reader;
    }
    /**
     * Returns a PNG of the supplied texture path.
     * Null if the texture doesn't exist.
     * @param filename Path to texture `blah.txd/name` or `models/gta3.img/blah.txd/name` etc
     */
    getTexture(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedPath = this.parsePath(filename);
            let txdPath = parsedPath.archive;
            let textureName = parsedPath.file;
            // Support TXD files within gta3.img
            if (parsedPath.archive.endsWith(".img")) {
                const furtherParsed = this.parsePath(parsedPath.file);
                txdPath = path_1.default.join(txdPath, furtherParsed.archive);
                textureName = furtherParsed.file;
            }
            const txd = this.getTXD(txdPath);
            if (!txd) {
                return null;
            }
            const tex = txd.getPNG(textureName);
            return tex;
        });
    }
    loadWeather() {
        // We'll ignore the PAL version.
        const timeCycPath = path_1.default.join(this.gtaPath, "data", "timecyc.dat");
        if (!fs_1.default.existsSync(timeCycPath)) {
            throw new Error("Missing timecyc.dat!");
        }
        const timeCycData = fs_1.default.readFileSync(timeCycPath);
        const lines = timeCycData.toString().split('\r\n');
        for (let line of lines) {
            if (line.trim() === "" || line.trim().startsWith("//")) {
                // Skip comments
                continue;
            }
            const ex = line.split('\t').join(" ").split(" ");
            const weather = {
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
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            // Load GTA Data
            this.loadGTADat();
            // Load in resources as needed.
            this.loadIMG();
            this.loadIDE();
            this.loadIPL();
            this.loadWeather();
        });
    }
}
exports.default = GameLoader;
//# sourceMappingURL=index.js.map