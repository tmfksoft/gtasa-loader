"use strict";
// https://gtamods.com/wiki/ENEX
// Entrance and exit markers
Object.defineProperty(exports, "__esModule", { value: true });
// Some of these flags are.. weird.
var EnexFlag;
(function (EnexFlag) {
    EnexFlag[EnexFlag["UNKNOWN_INTERIOR"] = 1] = "UNKNOWN_INTERIOR";
    EnexFlag[EnexFlag["UNKNNOW_PAIRING"] = 2] = "UNKNNOW_PAIRING";
    EnexFlag[EnexFlag["CREATE_LINKED_PAIR"] = 4] = "CREATE_LINKED_PAIR";
    EnexFlag[EnexFlag["REWARD_INTERIOR"] = 8] = "REWARD_INTERIOR";
    EnexFlag[EnexFlag["USED_REWARD_ENTRANCE"] = 16] = "USED_REWARD_ENTRANCE";
    EnexFlag[EnexFlag["CARS_AND_AIRCRAFT"] = 32] = "CARS_AND_AIRCRAFT";
    EnexFlag[EnexFlag["BIKES_AND_MOTORCYCLES"] = 64] = "BIKES_AND_MOTORCYCLES";
    EnexFlag[EnexFlag["DISABLE_ON_FOOT"] = 128] = "DISABLE_ON_FOOT";
    EnexFlag[EnexFlag["ACCEPT_NPC_GROUP"] = 256] = "ACCEPT_NPC_GROUP";
    EnexFlag[EnexFlag["FOOD_DATE_FLAG"] = 512] = "FOOD_DATE_FLAG";
    EnexFlag[EnexFlag["UNKNOWN_BURGLARY"] = 1024] = "UNKNOWN_BURGLARY";
    EnexFlag[EnexFlag["DISABLE_EXIT"] = 2048] = "DISABLE_EXIT";
    EnexFlag[EnexFlag["BURGLARY_ACCESS"] = 4096] = "BURGLARY_ACCESS";
    EnexFlag[EnexFlag["ENTERED_WITHOUT_EXIT"] = 8192] = "ENTERED_WITHOUT_EXIT";
    EnexFlag[EnexFlag["ENABLE_ACCESS"] = 16384] = "ENABLE_ACCESS";
    EnexFlag[EnexFlag["DELETE_ENEX"] = 32768] = "DELETE_ENEX";
})(EnexFlag || (EnexFlag = {}));
//# sourceMappingURL=EnexMarker.js.map