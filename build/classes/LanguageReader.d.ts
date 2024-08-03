import GXTFile from '../interfaces/language/GXTFile';
declare class LanguageReader {
    protected gxtData: Buffer;
    parsedGXT: GXTFile;
    constructor(gxtData: Buffer);
    readString(gxtKey: string): string | null;
    parse(): void;
}
export default LanguageReader;
