/**
 * Compared to most approaches in my parsing classes
 * With the language files theres no real data other than language strings
 * So I'll only ever include the useful data
 */

export interface SubTable {
	tableName: string,
	entries: { [key: number]: string }, // CRC32 : Text String
}

export interface MainTable {
	tableName: string // Should always be TABL
	subTables: SubTable[]
}

export default interface GXTFile {
	version: number, // Should always be 4
	tables: MainTable[]
}