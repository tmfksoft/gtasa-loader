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
        this.iplObjects = [];
        this.ideObjects = [];
        this.ideTimedObjects = [];
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
    parseBinaryIPL(data) {
        if (data.subarray(0, 4).toString() !== "bnry") {
            console.warn("Supplied IPL is not a binary file!");
            return [];
        }
        let lines = [];
        lines.push("# IPL Converted from binary IPL");
        const iplBuf = new pointer_buffer_1.default(data);
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
            const diskPath = path_1.default.join(this.gtaPath, iplPath);
            if (fs_1.default.existsSync(diskPath)) {
                const iplParsed = path_1.default.parse(iplPath);
                if (iplParsed.ext.toLowerCase() === ".ipl") {
                    for (let i = 0; i < 50; i++) {
                        const filename = `${iplParsed.name}_stream${i}.ipl`;
                        const file = this.getFile(filename);
                        if (!file) {
                            break;
                        }
                        else {
                            this.gtaData.ipl.push(filename);
                        }
                    }
                }
            }
            let iplLines = [];
            if (iplData.subarray(0, 4).toString() === "bnry") {
                iplLines = this.parseBinaryIPL(iplData);
            }
            else {
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
            console.log("Loaded %s IPL Objects from %s", loadedObjects, iplPath);
        }
        console.log(`Loaded %s IPL Objects`, this.iplObjects.length);
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
    // Attempts to parse a path to separate out an .img file
    parsePath(filePath) {
        const ex = filePath.split(path_1.default.sep);
        const img = [];
        const file = [];
        let foundImage = false;
        for (let dir of ex) {
            if (!foundImage) {
                img.push(dir);
                if (dir.toLowerCase().endsWith(".img")) {
                    foundImage = true;
                }
            }
            else {
                file.push(dir);
            }
        }
        if (file.length === 0) {
            return {
                img: "",
                file: path_1.default.join(...img),
            };
        }
        return {
            img: path_1.default.join(...img),
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
        if (parsedPath.img === "") {
            if (fs_1.default.existsSync(path_1.default.join(this.gtaPath, parsedPath.file))) {
                return fs_1.default.readFileSync(path_1.default.join(this.gtaPath, parsedPath.file));
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
            if (parsedPath.img === "") {
                console.warn("File %s doesn't exist!", parsedPath.file);
                return null;
            }
            // Load the IMG
            const imgPath = path_1.default.join(this.gtaPath, parsedPath.img);
            if (!fs_1.default.existsSync(imgPath)) {
                console.warn("IMG file %s doesn't exist!", parsedPath.img);
                return null;
            }
            const imgData = fs_1.default.readFileSync(imgPath);
            reader = new img_reader_1.default(imgData);
            this.imgReaders[parsedPath.img] = reader;
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
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            // Load GTA Data
            this.loadGTADat();
            // Load in resources as needed.
            this.loadIMG();
            this.loadIDE();
            this.loadIPL();
        });
    }
}
exports.default = GameLoader;
//# sourceMappingURL=index.js.map