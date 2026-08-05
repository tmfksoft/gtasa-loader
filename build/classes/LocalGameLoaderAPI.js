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
            try {
                const dff = dffLoader.getNode();
                // Attach each material's resolved UV animation now, while dffLoader
                // (and its UV Animation Dictionary lookup) is still in scope.
                const resolveUVAnimations = (node) => {
                    if ("materials" in node) {
                        for (const mat of node.materials) {
                            if (!mat.uvAnimation) {
                                continue;
                            }
                            for (const channel of mat.uvAnimation.channels) {
                                channel.animation = dffLoader.getUVAnimation(channel.name);
                            }
                        }
                        return;
                    }
                    for (const child of node.children) {
                        resolveUVAnimations(child);
                    }
                };
                resolveUVAnimations(dff);
                return dff;
            }
            catch (err) {
                console.error(`Failed to parse DFF model "%s"`, filepath, err);
                return null;
            }
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
    getCollisionModel(modelName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.getCollisionModel(modelName);
        });
    }
    getAnimation(packageName, animationName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.getAnimation(packageName, animationName);
        });
    }
    getAnimationPackageNames() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.getAnimationPackageNames();
        });
    }
    getAnimationNames(packageName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.getAnimationNames(packageName);
        });
    }
    getTexture(txdPath, textureName) {
        return __awaiter(this, void 0, void 0, function* () {
            const texture = yield this.loader.getTexture(txdPath, textureName);
            if (!texture) {
                return null;
            }
            return texture;
        });
    }
    getTextureNames(txdPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const txd = this.loader.getTXD(txdPath);
            return txd ? [...txd.textureList] : [];
        });
    }
    getTextureInfo(txdPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const txd = this.loader.getTXD(txdPath);
            if (!txd) {
                return [];
            }
            // Copied field by field rather than spread - TXDTexture keeps a private
            // reference to its chunk, which wouldn't survive a structured clone.
            return txd.getTextures().map(texture => ({
                name: texture.name,
                alphaName: texture.alphaName,
                width: texture.width,
                height: texture.height,
                depth: texture.depth,
                format: texture.format,
                mipmapCount: texture.mipmapCount,
            }));
        });
    }
    getTextureMipmap(txdPath, textureName, level) {
        return __awaiter(this, void 0, void 0, function* () {
            const txd = this.loader.getTXD(txdPath);
            if (!txd) {
                return null;
            }
            const texture = txd.getTextures().find(t => t.name.toLowerCase() === textureName.toLowerCase());
            if (!texture || level < 0 || level >= texture.mipmapCount) {
                return null;
            }
            try {
                return texture.getMipmap(level);
            }
            catch (err) {
                // Some textures declare more levels than they actually store, and
                // the odd format isn't decodable at all - a missing level is a
                // normal outcome here, not a reason to take the caller down.
                console.error(`Failed to decode mipmap %d of "%s" in "%s"`, level, textureName, txdPath, err);
                return null;
            }
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
            return this.loader.weather;
        });
    }
    getWeatherDefinitions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.weatherDefinitions;
        });
    }
    getWater() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.waterDefinitions;
        });
    }
    getPathNodes() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.pathAreas;
        });
    }
    getCarGenerators() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.carGenerators;
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
    getVehicles() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.vehicleDefinitions;
        });
    }
    getVehicleColorPalette() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.vehicleColorPalette;
        });
    }
    getVehicleColors() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.vehicleColors;
        });
    }
    getVehicleHandling() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loader.vehicleHandling;
        });
    }
    // Let there be sound!
    // The audio layout is San Andreas specific, so on a GTA III or Vice City
    // install nothing here resolves and the underlying reader throws. These
    // are singular-resource lookups, which this API returns null from when
    // the resource doesn't exist - so report that rather than propagating an
    // exception across the transport on every request.
    getStreamTrack(streamName, trackId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.loader.sfx.getStreamTrack(streamName, trackId);
            }
            catch (_a) {
                return null;
            }
        });
    }
    getAudioStream(streamName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.loader.sfx.getAudioStream(streamName);
            }
            catch (_a) {
                return null;
            }
        });
    }
    getSoundEffect(packageName, bankIndex, slotIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.loader.sfx.getSoundEffect(packageName, bankIndex, slotIndex);
            }
            catch (_a) {
                return null;
            }
        });
    }
    toWAV(effect) {
        return __awaiter(this, void 0, void 0, function* () {
            // We're converting to a Uint8Array as browsers lack Buffer
            // I should probably think about a browser ready/safe solution.
            const wavBuf = this.loader.sfx.toWAV(effect);
            return Uint8Array.from(wavBuf);
        });
    }
    on(eventName, listener) {
        return this.loader.on(eventName, listener);
    }
}
exports.default = LocalGameLoaderAPI;
//# sourceMappingURL=LocalGameLoaderAPI.js.map