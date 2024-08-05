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
const LocalGameLoaderAPI_1 = __importDefault(require("./classes/LocalGameLoaderAPI"));
const LanguageReader_1 = __importDefault(require("./classes/LanguageReader"));
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
        // A predfined API you can hook straight up to any project
        this.API = new LocalGameLoaderAPI_1.default(this);
        this.gtaData = {
            img: [
                // Preadd some core IMG files
                'MODELS\\GTA3.IMG',
                'MODELS\\GTA_INT.IMG',
                'MODELS\\PLAYER.IMG'
            ],
            ide: [
                'DATA\\VEHICLES.IDE'
            ],
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
        this.ideAnimatedObjects = [];
        this.waterDefinitions = [];
        this.vehicleDefinitions = [];
        // Vehicle colours, alpha is always 255
        this.vehicleColorPalette = [];
        // Colours a vehicle can spawn with
        this.vehicleColors = [];
        // Misc
        this.weatherDefinitions = [];
        // IMG Files
        this.imgReaders = {};
        // filename and its corresponding IMG file.
        this.imgContents = {};
        // Defines what language the game will load by default
        this.language = "american";
        this.languageReaders = {};
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
    loadWaterDefinitions() {
        const waterFilePath = path_1.default.join(this.gtaPath, "data", "water.dat");
        if (!fs_1.default.existsSync(waterFilePath)) {
            throw new Error("Unable to find water.dat");
        }
        const waterDat = fs_1.default.readFileSync(waterFilePath);
        let lines = waterDat.toString().split('\n');
        for (let line of lines) {
            if (line.trim().startsWith("#") || line.trim() === "processed" || line.trim() === "") {
                continue;
            }
            const ex = line.split(" ").filter((word) => word.length > 0);
            const waterDef = {
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
                };
                waterDef.waterType = parseInt(ex[28]);
            }
            else {
                waterDef.waterType = parseInt(ex[21]);
            }
            this.waterDefinitions.push(waterDef);
        }
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
                if (line.trim().split(" ").length === 1) {
                    if (line === "end") {
                        if (currentSection == "") {
                            throw new Error("Unexpected section end in IPL");
                        }
                        currentSection = "";
                    }
                    else {
                        if (currentSection !== "") {
                            throw new Error("Already inside " + currentSection + " section!");
                        }
                        currentSection = line;
                    }
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
                    }
                    else {
                        // Nope, chuck testa
                        cullObj.unknown3 = parseInt(ex[10]);
                    }
                    parsedIPL.cull.push(cullObj);
                }
                if (currentSection === "pick") {
                    console.log("pick", line);
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
                    }
                    else {
                        if (currentSection !== "") {
                            throw new Error("Already inside " + currentSection + " section! Line " + lines.indexOf(line));
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
                    let drawDistance = [];
                    let flags = -1;
                    if (ex.length === 6) {
                        // Type 1
                        drawDistance.push(parseFloat(ex[4]));
                        flags = parseInt(ex[5]);
                    }
                    else if (ex.length === 7) {
                        // Type 2
                        drawDistance.push(parseFloat(ex[4]));
                        drawDistance.push(parseFloat(ex[5]));
                        flags = parseInt(ex[6]);
                    }
                    else if (ex.length === 8) {
                        // Type 3
                        drawDistance.push(parseFloat(ex[4]));
                        drawDistance.push(parseFloat(ex[5]));
                        drawDistance.push(parseFloat(ex[6]));
                        flags = parseInt(ex[7]);
                    }
                    else if (ex.length === 5) {
                        drawDistance.push(parseFloat(ex[3]));
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
                    const vehicle = {
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
                        const groundVehicle = vehicle;
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
     * @param txdPath Path to TXD, can be on disk or within an .img
     * @param textureName Name of texture within the TXD.
     */
    getTexture(txdPath, textureName) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedPath = this.parsePath(txdPath);
            let txdFilename = parsedPath.archive;
            // Support TXD files within gta3.img
            if (parsedPath.archive.endsWith(".img")) {
                const furtherParsed = this.parsePath(parsedPath.file);
                txdFilename = path_1.default.join(txdPath, furtherParsed.archive);
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
    loadLanguages() {
        const languages = [
            "american",
            "french",
            "german",
            "italian",
            "spanish"
        ];
        for (let lang of languages) {
            const gxtPath = path_1.default.join(this.gtaPath, "text", `${lang}.gxt`);
            if (!fs_1.default.existsSync(gxtPath)) {
                console.warn(`Unable to find GXT file for ${lang}, it will not be loaded.`);
                continue;
            }
            const gxtData = fs_1.default.readFileSync(gxtPath);
            this.languageReaders[lang] = new LanguageReader_1.default(gxtData);
        }
    }
    // Returns the string, if found otherwise null.
    readLanguageString(gxtKey) {
        if (typeof this.languageReaders[this.language] === "undefined") {
            return null;
        }
        const reader = this.languageReaders[this.language];
        return reader.readString(gxtKey);
    }
    loadCarCols() {
        const carColsPath = path_1.default.join(this.gtaPath, "data", "carcols.dat");
        if (!fs_1.default.existsSync(carColsPath)) {
            throw new Error("Unable to find carcols.dat!");
        }
        const carColsData = fs_1.default.readFileSync(carColsPath);
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
                    const colorPairs = [];
                    for (let i = 1; i < ex.length; i += 2) {
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
                    const colorPairs = [];
                    for (let i = 1; i < ex.length; i += 4) {
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
    parseIDEFormat(data) {
        const lines = data.toString().split('\r\n');
        const foundSections = [];
        let currentSection = "";
        let foundLines = [];
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
                }
                else {
                    // Check if we're already in a section
                    if (currentSection !== "") {
                        console.error(`Unexpected line '${line}' while inside section '${currentSection}'.`);
                        throw new Error("Already inside '" + currentSection + "' section! Line " + lines.indexOf(line));
                    }
                    // Start a new section
                    currentSection = line;
                }
                continue;
            }
            // If not a section name or "end", it's a content line.
            if (currentSection !== "") {
                foundLines.push(line);
            }
            else {
                console.error(`Content line found outside of a section: ${line}`);
                throw new Error("Content found outside of a section: " + line);
            }
        }
        return foundSections;
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
            this.loadWaterDefinitions();
            this.loadLanguages();
            this.loadCarCols();
        });
    }
}
exports.default = GameLoader;
//# sourceMappingURL=index.js.map