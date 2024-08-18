"use strict";
// https://gtamods.com/wiki/CULL#Attributes
// You can do a simple check for what you're looking for
Object.defineProperty(exports, "__esModule", { value: true });
var CullZoneType;
(function (CullZoneType) {
    CullZoneType[CullZoneType["All"] = -1] = "All";
    CullZoneType[CullZoneType["CamCloseInForPlayer"] = 1] = "CamCloseInForPlayer";
    CullZoneType[CullZoneType["CamStairsForPlayer"] = 2] = "CamStairsForPlayer";
    CullZoneType[CullZoneType["Cam1stPersonForPlayer"] = 4] = "Cam1stPersonForPlayer";
    CullZoneType[CullZoneType["PlayerNoRain"] = 8] = "PlayerNoRain";
    CullZoneType[CullZoneType["CamNoRain"] = 8] = "CamNoRain";
    CullZoneType[CullZoneType["NoPolice"] = 16] = "NoPolice";
    CullZoneType[CullZoneType["DoINeedToLoadCollision"] = 64] = "DoINeedToLoadCollision";
    CullZoneType[CullZoneType["UNKNOWN"] = 128] = "UNKNOWN";
    CullZoneType[CullZoneType["PoliceAbondonCars"] = 256] = "PoliceAbondonCars";
    CullZoneType[CullZoneType["InRoomForAudio"] = 512] = "InRoomForAudio";
    CullZoneType[CullZoneType["WaterFudge"] = 1024] = "WaterFudge";
    CullZoneType[CullZoneType["MilitaryZone"] = 4096] = "MilitaryZone";
    CullZoneType[CullZoneType["ExtraAirResistance"] = 16384] = "ExtraAirResistance";
    CullZoneType[CullZoneType["FewerCars"] = 32768] = "FewerCars";
    // Some unknown zones I've seen
    CullZoneType[CullZoneType["UNKNOWN2"] = 33792] = "UNKNOWN2";
})(CullZoneType || (CullZoneType = {}));
//# sourceMappingURL=CullZone.js.map