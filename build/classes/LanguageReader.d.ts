import GXTFile from '../interfaces/language/GXTFile';
declare class LanguageReader {
    protected gxtData: Buffer;
    parsedGXT: GXTFile;
    constructor(gxtData: Buffer);
    readString(gxtKey: string): string | null;
    parse(): void;
    toJSON(): string;
    static fromJSON(json: string): LanguageReader;
}
export default LanguageReader;
