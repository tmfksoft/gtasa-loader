
/**
 * This is an example usage of the library.
 * It's both used for testing the library and showing you how to use it.
 * 
 * The library is *very* early stages and so are all of its dependencies.
 * Expect it to not function properly etc.
 */

import GameLoader from ".";
import fs from 'fs';
import path from 'path';
import LanguageReader from "./classes/LanguageReader";

async function start() {
	
	//const gtaDir = "D:\\Games\\Grand Theft Auto San Andreas (SAMP)";
	const gtaDir = "D:\\SteamLibrary\\steamapps\\common\\Grand Theft Auto San Andreas";

	const languages = [
		"american",
		//"french",
		//"german",
		//"italian",
		//"spanish"
	];

	for (let language of languages) {
		const languageFile = path.join(gtaDir, "text", language + ".gxt");
		const languageData = fs.readFileSync(languageFile);
		console.log(`Language file ${language}.gxt is ${languageData.length} bytes`);
		const lang = new LanguageReader(languageData);
		console.log(lang.readString("PLA_10"));
		fs.writeFileSync(`${language}.json`, JSON.stringify(lang.parsedGXT, null, '\t'));
	}
}
start();