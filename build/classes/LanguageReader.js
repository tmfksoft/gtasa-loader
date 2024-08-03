"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pointer_buffer_1 = __importDefault(require("@majesticfudgie/pointer-buffer"));
const CRC32_1 = __importDefault(require("./CRC32"));
// Ref: https://gtamods.com/wiki/GXT#GTA_SA.2FIV
class LanguageReader {
    constructor(gxtData) {
        this.gxtData = gxtData;
        this.parsedGXT = {
            version: -1,
            tables: [],
        };
        this.parse();
    }
    readString(gxtKey) {
        const crc32 = CRC32_1.default.getKey(gxtKey);
        console.log("Looking for " + crc32);
        for (let table of this.parsedGXT.tables) {
            for (let subtable of table.subTables) {
                if (typeof subtable.entries[crc32] !== "undefined") {
                    return subtable.entries[crc32];
                }
            }
        }
        console.log("Couldn't find it");
        return null;
    }
    // Parses the GXT File into memory for future use.
    parse() {
        const gxtFile = {
            version: -1,
            tables: [],
        };
        const gxtBuf = new pointer_buffer_1.default(this.gxtData);
        // These are always 4 and 8 respectively.
        const gxtVersion = gxtBuf.readInt16(); // Should always be 4
        gxtBuf.readInt16(); // Bits per character, should always be 8 - (8: ASCII, 16: UTF-16)
        gxtFile.version = gxtVersion;
        if (gxtVersion !== 4) {
            throw new Error(`Unsupported GXT Version ${gxtVersion}`);
        }
        // Table Block(s)
        const tables = [];
        // Reads tables and their sub tables
        // GTA:SA Appears to contain a single top level table named "MAIN"
        // with 127 sub tables
        for (let tableIndex = 0; tableIndex < 200; tableIndex++) {
            const tableName = gxtBuf.readString(4);
            const blockSize = gxtBuf.readUint32();
            // Main table
            if (tableName !== "TABL") {
                console.log({ tableIndex });
                break;
            }
            const subTables = [];
            const tableCount = blockSize / 12;
            for (let i = 0; i < tableCount; i++) {
                const subTableName = gxtBuf.readString(8);
                const offset = gxtBuf.readUint32();
                subTables.push({
                    tableName: subTableName,
                    offset,
                });
            }
            tables.push({
                tableName,
                blockSize,
                blocks: subTables
            });
        }
        // Work through each main table.
        for (let table of tables) {
            const parsedTable = {
                tableName: table.tableName,
                subTables: [],
            };
            // These are sub tables
            for (let block of table.blocks) {
                gxtBuf.pointer = block.offset;
                const foundTable = gxtBuf.readString(8);
                if (block.tableName !== "MAIN") {
                    if (block.tableName !== foundTable) {
                        throw new Error(`Unexpected subtable found! Expected ${block.tableName}, Found ${foundTable}`);
                    }
                }
                else {
                    // Rewind 8 bytes, the MAIN table doesn't contain it's name for some reason.. :D?!
                    gxtBuf.pointer -= 8;
                }
                // Read the TKEY Section
                let section = gxtBuf.readString(4);
                if (section !== "TKEY") {
                    throw new Error(`Unexpected section! Expected TKEY, Found ${section}`);
                }
                let blockSize = gxtBuf.readUint32();
                const entries = [];
                const blockCount = blockSize / 8;
                for (let i = 0; i < blockCount; i++) {
                    const offset = gxtBuf.readUint32();
                    const crc = gxtBuf.readUint32();
                    entries.push({
                        offset,
                        crc,
                        text: "",
                    });
                }
                // Read the TDAT Section
                section = gxtBuf.readString(4);
                if (section !== "TDAT") {
                    throw new Error(`Unexpected section! Expected TDAT, Found ${section}`);
                }
                blockSize = gxtBuf.readUint32();
                const TDATBlock = gxtBuf.readSection(blockSize);
                for (let entry of entries) {
                    const offset = entry.offset;
                    let text = "";
                    for (let i = offset; i < blockSize; i++) {
                        const char = TDATBlock[i];
                        if (char === 0x00) {
                            break;
                        }
                        text += String.fromCharCode(char);
                    }
                    entry.text = text;
                }
                const parsedEntries = {};
                for (let entry of entries) {
                    parsedEntries[entry.crc] = entry.text;
                }
                parsedTable.subTables.push({
                    tableName: block.tableName,
                    entries: parsedEntries,
                });
            }
            gxtFile.tables.push(parsedTable);
        }
        this.parsedGXT = gxtFile;
    }
}
exports.default = LanguageReader;
//# sourceMappingURL=LanguageReader.js.map