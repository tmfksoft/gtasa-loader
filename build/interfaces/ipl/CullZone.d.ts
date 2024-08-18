declare enum CullZoneType {
    All = -1,// ?
    CamCloseInForPlayer = 1,// III, VC, SA
    CamStairsForPlayer = 2,// III, VC, SA
    Cam1stPersonForPlayer = 4,// III, VC, SA
    PlayerNoRain = 8,// III, VC, SA
    CamNoRain = 8,// III, VC, SA
    NoPolice = 16,// III, VC
    DoINeedToLoadCollision = 64,// III
    UNKNOWN = 128,// III, VC
    PoliceAbondonCars = 256,// III, VC, SA
    InRoomForAudio = 512,// VC, SA
    WaterFudge = 1024,// VC
    MilitaryZone = 4096,// SA
    ExtraAirResistance = 16384,// SA
    FewerCars = 32768,// SA
    UNKNOWN2 = 33792
}
export default interface CullZone {
    center: {
        x: number;
        y: number;
        z: number;
    };
    xSkewValue: number;
    ySkewValue: number;
    unknown3?: number;
    length: number;
    width: number;
    top: number;
    bottom: number;
    type: CullZoneType;
    mirrorParameters?: {
        x: number;
        y: number;
        z: number;
        Cm: number;
    };
}
export {};
