
/**
 * This is an example usage of the library.
 * It's both used for testing the library and showing you how to use it.
 * 
 * The library is *very* early stages and so are all of its dependencies.
 * Expect it to not function properly etc.
 */

import GameLoader from ".";
import IDEFlags from "./interfaces/ide/IDEFlags";
import AudioZone from "./interfaces/ipl/AudioZone";
import EnexMarker from "./interfaces/ipl/EnexMarker";
import fs from "fs";

async function start() {
	
	//const gtaDir = "D:\\Games\\Grand Theft Auto San Andreas (SAMP)";
	const gtaDir = "D:\\SteamLibrary\\steamapps\\common\\Grand Theft Auto San Andreas";
	const loader = new GameLoader(gtaDir);
	await loader.load();

	const enex: EnexMarker[] = [];
	for (let ipl of loader.loadedIPLs) {
		enex.push(...ipl.enexMarkers);
	}

	// LANG
	const langLoader = loader.languageReaders[loader.language];
	//fs.writeFileSync("language.json", JSON.stringify(langLoader.parsedGXT, null, '\t'));
	console.log(langLoader.readString("ROCKET_HS") || "Missing language string");
}
start();