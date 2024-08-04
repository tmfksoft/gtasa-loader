import PointerBuffer from "@majesticfudgie/pointer-buffer";
import CRC32 from './CRC32';
import GXTFile, { MainTable } from '../interfaces/language/GXTFile';

// Ref: https://gtamods.com/wiki/GXT#GTA_SA.2FIV
class LanguageReader {

	public parsedGXT: GXTFile = {
		version: -1,
		tables: [],
	};

	constructor(protected gxtData: Buffer) {
		// Allows creating a reader and not actually filling it with data
		if (gxtData.length > 0) {
			this.parse();
		}
	}
	
	readString(gxtKey: string): string | null {
		const crc32 = CRC32.getKey(gxtKey);
		for (let table of this.parsedGXT.tables) {
			for (let subtable of table.subTables) {
				if (typeof subtable.entries[crc32] !== "undefined") {
					return subtable.entries[crc32];
				}
			}
		}
		return null;
	}

	// Parses the GXT File into memory for future use.
	parse() {
		const gxtFile: GXTFile = {
			version: -1,
			tables: [],
		};

		const gxtBuf = new PointerBuffer(this.gxtData);

		// These are always 4 and 8 respectively.
		const gxtVersion = gxtBuf.readInt16(); // Should always be 4
		gxtBuf.readInt16(); // Bits per character, should always be 8 - (8: ASCII, 16: UTF-16)

		gxtFile.version = gxtVersion;
 
		if (gxtVersion !== 4) {
			throw new Error(`Unsupported GXT Version ${gxtVersion}`);
		}

		// Table Block(s)
		const tables: {
			tableName: string,
			blockSize: number,
			blocks: {
				tableName: string,
				offset: number
			}[]
		}[] = [];

		// Reads tables and their sub tables
		// GTA:SA Appears to contain a single top level table named "MAIN"
		// with 127 sub tables
		for (let tableIndex=0; tableIndex<200; tableIndex++) {

			const tableName = gxtBuf.readString(4);
			const blockSize = gxtBuf.readUint32();

			// Main table
			if (tableName !== "TABL") {
				break;
			}

			const subTables: {
				tableName: string,
				offset: number,
			}[] = [];

			const tableCount = blockSize / 12;

			for (let i=0; i<tableCount; i++) {
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

			const parsedTable: MainTable = {
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
				} else {
					// Rewind 8 bytes, the MAIN table doesn't contain it's name for some reason.. :D?!
					gxtBuf.pointer -= 8;
				}

				// Read the TKEY Section
				let section = gxtBuf.readString(4);
				if (section !== "TKEY") {
					throw new Error(`Unexpected section! Expected TKEY, Found ${section}`);
				}

				let blockSize = gxtBuf.readUint32();
				
				const entries: {
					offset: number,
					crc: number,
					text: string,
				}[] = [];

				const blockCount = blockSize / 8;
				for (let i=0; i<blockCount; i++) {
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
					for (let i=offset; i<blockSize; i++) {
						const char = TDATBlock[i];
						if (char === 0x00) {
							break;
						}

						text += String.fromCharCode(char);
					}

					entry.text = text;
				}

				const parsedEntries: { [key: number]: string } = {};
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

	// In a rare case I'm allowing this class to be loaded/unloaded from JSON

	toJSON() {
		return JSON.stringify(this.parsedGXT);
	}
	static fromJSON(json: string) {
		const reader = new LanguageReader(Buffer.from([]));
		reader.parsedGXT = JSON.parse(json);
		return reader;
	}
}
export default LanguageReader;