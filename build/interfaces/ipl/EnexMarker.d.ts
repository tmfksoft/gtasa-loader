export default interface EnexMarker {
    entrancePosition: {
        x: number;
        y: number;
        z: number;
    };
    enterAngle: number;
    entrySize: {
        x: number;
        y: number;
        z: number;
    };
    exitPosition: {
        x: number;
        y: number;
        z: number;
    };
    exitAngle: number;
    targetInterior: number;
    flags: EnexFlag;
    name: string;
    sky: number;
    numPedsToSpawn: number;
    timeOn: number;
    timeOff: number;
}
declare enum EnexFlag {
    UNKNOWN_INTERIOR = 1,// Only used for interior markers
    UNKNNOW_PAIRING = 2,// Used mostly for interior markers. Also Big Ear & LS Skyscraper
    CREATE_LINKED_PAIR = 4,// Pair with unflagged mate during new game start
    REWARD_INTERIOR = 8,// Sets flag 0010 on pair mate when used
    USED_REWARD_ENTRANCE = 16,// Set by accessing reward interior
    CARS_AND_AIRCRAFT = 32,// Enable for cars and aircraft
    BIKES_AND_MOTORCYCLES = 64,// Enable for bikes and motorcycles
    DISABLE_ON_FOOT = 128,// No foot traffic. Use for cars and/or bikes only
    ACCEPT_NPC_GROUP = 256,// Group members accepted at destination of pair (passengers stripped)
    FOOD_DATE_FLAG = 512,// Set and cleared by food date (cut-scene related)
    UNKNOWN_BURGLARY = 1024,// Set on Bayside and Temporary Burglary doors
    DISABLE_EXIT = 2048,// Player can enter but cannot exit a two-way pair
    BURGLARY_ACCESS = 4096,// Enabled and disabled during Burglary
    ENTERED_WITHOUT_EXIT = 8192,// Set by Entrance, Cleared by Exit; Applies to one side of a two
    ENABLE_ACCESS = 16384,// Enabled by default; often cleared by scripts
    DELETE_ENEX = 32768
}
export {};
