"use strict";
/**
 * This is an example usage of the library.
 * It's both used for testing the library and showing you how to use it.
 *
 * The library is *very* early stages and so are all of its dependencies.
 * Expect it to not function properly etc.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
const fs_1 = __importDefault(require("fs"));
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        // Change to your game path.
        const game = new _1.default("D:\\Games\\Grand Theft Auto San Andreas (SAMP)");
        yield game.load();
        const texture = yield game.API.getTexture("radar64.txd", "radar64");
        console.log(texture);
        if (texture) {
            const buf = Buffer.from(texture);
            fs_1.default.writeFileSync("test.png", buf);
        }
    });
}
start();
//# sourceMappingURL=example.js.map