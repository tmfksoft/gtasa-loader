/**
 * A class for loading the "effects.fxp" file.
 *
 * It's a more complex format and file, it deserves its own class.
 * Not sure if this should make its way into it's own loader.
 *
 * While I write this, I haven't a clue how the file format works.
 * https://gtamods.com/wiki/Particle_(SA) - Names some particles
 * https://gtag.sannybuilder.com/sanandreas/particles/ - Lists particles with screenshots and descs
 * https://gtaforums.com/topic/304880-sa2dfx-creating-your-own-particle-effects/ - Goes over making particles.
 * https://advdi.wordpress.com/2011/06/26/gta-sa-tutorials-how-to-modify-effects-fxp/ - Seems to have some info
 * http://msdn2.microsoft.com/en-us/library/b...508(VS.85).aspx - Defines SRCBLENDID types
 */
/**
 * Some notes:
 * FX_SYSTEM_DATA seems to indicate the start with the number 109 always following it
 * Not sure if it also defines the end of the previous section by starting a new one
 * data sections are separated with empty lines
 *
 * The following section has this format:
 * FILENAME: - Can be anything
 * NAME: - Particle name
 * LENGTH: - Duration (float)?
 * LOOPINTERVALMIN: - Duration between loops (float)?
 * LENGTH: - Another length, not sure what this is. Always 0 (float)
 * PLAYMODE: - Not sure, (int) (0 = until LENGTH is up, 1 & 2 = until removed)
 * CULLDIST: - Presumably max view distance (float)
 * BOUNDINGSPHERE: - XYZ, Radius? (float) - not sure its use
 * NUM_PRIMS: - Number of different sub particles? Apparently how many FX_PRIM_BASE_DATA exist in this effect
 *
 * Then theres FX_PRIM_BASE_DATA sections based on NUM_PRIMS:
 * NAME: - Prim name
 * MATRIX: - Not sure 12 floats
 * TEXTURE: - Texture name from effectsPC.txd - Not sure if we pick a random texture from the 4 supplied
 * TEXTURE2: - Texture name from effectsPC.txd
 * TEXTURE3: - Texture name from effectsPC.txd
 * TEXTURE4: - Texture name from effectsPC.txd
 * ALPHAON: - Whether to use transparency? (int) 0 or 1
 * SRCBLENDID: - DirectX Blending ID
 * DSTBLENDID: - DirectX Blending ID
 *
 * Theres a blank line followed by NUM_INFOS with a number
 * Defines how name FX_[A-Z]_DATA sections there are, excluding FX_SYSTEM_DATA
 *
 * Theres a handful of distinct sections beginning FX_INFO_[A-Z]_DATA:
 *
 * FX_INFO_EMLIFE_DATA - Seems to alter duration of the particulates?
 * FX_INFO_EMSIZE_DATA - Seems to alter particulate size?
 * FX_INFO_EMROTATION_DATA - Seems to alter particulate rotation?
 * FX_INFO_COLOUR_DATA - Seems to alter particulate colours
 * FX_INFO_EMANGLE_DATA - No idea
 * FX_INFO_EMSPEED_DATA - Presumably controls the speed of each particulate
 * FX_INFO_FORCE_DATA - Not sure, maybe affects bouncing off surfaces?
 * FX_INFO_ROTSPEED_DATA - Presumably rotational speed?
 * FX_INFO_COLOURBRIGHT_DATA - Maybe brightness over time?
 * FX_INFO_SIZE_DATA - Unsure
 * FX_INFO_SELFLIT_DATA - Presumably controls whether the particle is emissive or takes on world colours?
 */
export default class ParticleLoader {
    readonly particleSystems = 82;
}
/**
 * This file is very much a heavy work in progress while I understand and parse the particle file "effects.fxp"
 * Not much seems to be understood about the file and it's not common for people to want to tweak particles,
 * as a result its barely documented.
 */ 
