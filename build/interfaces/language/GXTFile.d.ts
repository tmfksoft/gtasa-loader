/**
 * Compared to most approaches in my parsing classes
 * With the language files theres no real data other than language strings
 * So I'll only ever include the useful data
 */
export interface SubTable {
    tableName: string;
    entries: {
        [key: number]: string;
    };
}
export interface MainTable {
    tableName: string;
    subTables: SubTable[];
}
export default interface GXTFile {
    version: number;
    tables: MainTable[];
}
