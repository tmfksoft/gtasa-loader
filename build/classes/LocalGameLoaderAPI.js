"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class LocalGameLoaderAPI {
    constructor(loader) {
        this.loader = loader;
    }
    getDFF(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            const dffLoader = this.loader.getDFF(filepath);
            if (!dffLoader) {
                return null;
            }
            const dff = dffLoader.getGeometry();
            return dff;
        });
    }
    getTXD(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            const txd = this.loader.getTXD(filepath);
            if (!txd) {
                return null;
            }
            return txd.parsed;
        });
    }
    getTexture(txdPath, textureName) {
        return __awaiter(this, void 0, void 0, function* () {
            const texture = yield this.loader.getTexture(txdPath, textureName);
            if (!texture) {
                return null;
            }
            return Uint8Array.from(texture);
        });
    }
    getIDEObject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.getObject(id);
        });
    }
    getIPL() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.loadedIPLs;
        });
    }
    getWeather() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.weatherDefinitions;
        });
    }
    getWater() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.waterDefinitions;
        });
    }
    getLanguageString(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.readLanguageString(key);
        });
    }
    getLanguageData(language) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof this.loader.languageReaders[language] !== "undefined") {
                return this.loader.languageReaders[language].parsedGXT;
            }
            return null;
        });
    }
}
exports.default = LocalGameLoaderAPI;
//# sourceMappingURL=LocalGameLoaderAPI.js.map