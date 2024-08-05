
/**
 * This is an example usage of the library.
 * It's both used for testing the library and showing you how to use it.
 * 
 * The library is *very* early stages and so are all of its dependencies.
 * Expect it to not function properly etc.
 */

import GameLoader from ".";
import IDEFlags from "./interfaces/ide/IDEFlags";

async function start() {
	
	//const gtaDir = "D:\\Games\\Grand Theft Auto San Andreas (SAMP)";
	const gtaDir = "D:\\SteamLibrary\\steamapps\\common\\Grand Theft Auto San Andreas";
	const loader = new GameLoader(gtaDir);
	await loader.load();

	const obj = loader.getObject(18204);
	if (obj) {

		const flagNames = Object.values(IDEFlags).filter(value => typeof value === 'number') as number[];
		console.log(flagNames);

		const validFlags: number[] = [];
		for (let flag of flagNames) {
			if (obj.flags & flag) {
				validFlags.push(flag);
			}
		}
		console.log(validFlags.map(f => f.toString(16)));
	}
}
start();