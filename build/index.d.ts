import GTADat from "./interfaces/GTADat";
import IPLObject from "./interfaces/IPLObject";
import IDEObject from "./interfaces/IDEObject";
import IDETimedObject from "./interfaces/IDETimedObject";
import IMGReader from "@majesticfudgie/img-reader";
import DFFReader from "@majesticfudgie/dff-reader";
import TXDReader from "@majesticfudgie/txd-reader";
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
    iplObjects: IPLObject[];
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
    loadIPL(): void;
    loadIDE(): void;
    getObject(id: number): IDEObject | IDETimedObject | null;
    loadIMG(): void;
    getAssociatedIMG(filename: string): string | null;
    getFile(filename: string): Buffer | null;
    getIMGReader(imgFile: string): IMGReader | null;
    getDFF(filename: string): DFFReader | null;
    getTXD(filename: string): TXDReader | null;
    load(): Promise<void>;
}
export default GameLoader;
