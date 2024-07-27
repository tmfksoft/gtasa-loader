import GTADat from "./interfaces/GTADat";
import IDEObject from "./interfaces/IDEObject";
import IDETimedObject from "./interfaces/IDETimedObject";
import IMGReader from "@majesticfudgie/img-reader";
import DFFReader from "@majesticfudgie/dff-reader";
import TXDReader from "@majesticfudgie/txd-reader";
import ParsedIPL from "./interfaces/ParsedIPL";
import MainIPL from "./interfaces/MainIPL";
/**
 * Simple GTA SanAndreas Game Loader
 *
 * This library loads resources from the GTA:SA Installation provided.
 * Currently it doesn't load all data and has a long way to go.
 *
 * Currently you can fetch DFF and TXD files which returns the DFF and TXD Readers.
 * This allows reading and converting models and textures on the fly.
 */
declare class GameLoader {
    protected gtaPath: string;
    gtaData: GTADat;
    loadedIPLs: MainIPL[];
    ideObjects: IDEObject[];
    ideTimedObjects: IDETimedObject[];
    imgReaders: {
        [key: string]: IMGReader;
    };
    imgContents: {
        [key: string]: string;
    };
    constructor(gtaPath: string);
    loadGTADat(): void;
    parseBinaryIPL(name: string | string[], data: Buffer | Buffer[]): ParsedIPL;
    parseTextIPL(name: string | string[], data: Buffer | Buffer[]): ParsedIPL;
    loadIPL(): void;
    loadIDE(): void;
    getObject(id: number): IDEObject | IDETimedObject | null;
    loadIMG(): void;
    getAssociatedIMG(filename: string): string | null;
    parsePath(filePath: string): {
        archive: string;
        file: string;
    };
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
    getFile(filename: string): Buffer | null;
    getIMGReader(imgFile: string): IMGReader | null;
    getDFF(filename: string): DFFReader | null;
    getTXD(filename: string): TXDReader | null;
    /**
     * Returns a PNG of the supplied texture path.
     * Null if the texture doesn't exist.
     * @param filename Path to texture `blah.txd/name` or `models/gta3.img/blah.txd/name` etc
     */
    getTexture(filename: string): Promise<Buffer | null>;
    load(): Promise<void>;
}
export default GameLoader;
