
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

async function start() {
		
	// Change to your game path.
	const game = new GameLoader("D:\\Games\\Grand Theft Auto San Andreas (SAMP)");
	await game.load();


}
start();