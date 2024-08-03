# Here be files!

This file is rough documentation of all the files in GTA:SA and what they do.
Each section below is their relative path within a GTA:SA Folder.
I may accidentially document files added by mods or editors :(

This is based off a disk copy of GTA:SA v1.00

# /
*I'm not going to document anything in the main dir as they're obvious*

# /anim
 - anim.img - Unknown
 - cuts.img - Unknown
 - ped.ifp - Defines a bunch of animations, not 100% sure how they're used yet. Name suggests they're for pedestrians.

# /audio
*Contains no files, only folders*

# /audio/CONFIG
 - AudioEventHistory.txt - Some sort of debug file? Unsure.
 - BackLkup.dat - Audio Bank Lookup File
 - BankSlot.dat - List of Audio Bank Slots
 - EventVol.dat - Unknown
 - PakFiles.dat - Unknown
 - StrmPaks.dat - Unknown
 - TrakLkup.dat - Unknown

# /audio/SFX
*As I understand it, all of these files contain the sounds effects in the game, see the CONFIG dir prior for what/where the data lives per sound*
*I'll probably document each file as I parse data from them, though the names are pretty explanatory*
 - FEET
 - GENRL
 - PAIN_A
 - SCRIPT
 - SPC_EA
 - SPC_FA
 - SPC_GA
 - SPC_NA
 - SPC_PA

# /audio/streams
*These files appear to contain longer audio clips such as music and ambience sounds*
*I'll probably document each file as I parse data from them, though the names are pretty explanatory*
 - AA
 - ADVERTS
 - AMBIENCE
 - BEATS
 - CH
 - CO
 - CR
 - CUTSCENE
 - DS
 - HC
 - MH
 - MR
 - NU
 - RE
 - RG
 - TK

# /data
 - animgrp.dat - Defines animation association groups
 - animviewer.dat - Unknown - Says "Object types" in the file and refers to IDE files.
 - ar_stats.dat - Handles how much to increase stats, e.g. per weapon fire or 1s of exercise
 - AudioEvents.txt - Uknown
 - carcols.dat - Defines all possible car colours and what colours each car can spawn with(?)
 - cargrp.dat - Defines possible cars for groups of pedestrians
 - carmods.dat - List of cars and their possible modifications
 - clothes.dat - Defines rules for replacing clothes models etc in cutscenes
 - default.dat - Defines files to load into memory, IDEs etc
 - default.ide - Standard IDE File - Primarily defines weapons
 - fonts.dat - Defines some font data, not 100% sure
 - furnitur.dat - Furniture groups - Not sure what this is used for
 - gridref.dat - Definition of what artist worked on each part of the map in 600x600 squares.
 - gta.dat - Loading list for loading IMG, IDE and IPL files. Also defines splash screen file.
 - gta_quick.dat - Similar to gta.dat but seems to be a smaller list
 - handling.cfg - Defines handling and settings for vehicles
 - info.zon - Similar to IDE File, Defines names for areas of the map
 - main.sc - Seems to be a left over script, refers to "Industrial Level" which is likely GTA3
 - map.zon - Similar to IDE file, defines zones of the map. Unsure if its used.
 - melee.dat - Defines attacks for melee
 - numplate.dat - "Alternative pallettes for carplate charsets." - Not sure if its used or its purpose.
 - object.dat - Defines physics properties and such for various objects.
 - ped.dat - Sets respect and hate for different pedestrian groups
 - pedgrp.dat - Defines pedestrians for different groups
 - peds.ide - Similar to IDE File, Defines behaviours, voices etc for pedestrians
 - pedstats.dat - Defines stats for pedestrians such as their fear level, temper etc
 - plants.dat - Defines plant coverage for different surfaces? - Not 100% sure, unsure how this differs from procobj.dat
 - polydensity.dat - Unknown - May not be used
 - popcycle.dat - Appears to define the density of pedestrian types in different areas of the map at different times of the day
 - procobj.dat - Procedural object placement - Defines what surfaces to put different objects on procedurally.
 - shopping.dat - Prices of items that can be purchased from shops (Car mods, weapons, tattoos, clothes etc)
 - statdisp.dat - Defines when to show statistic increase/decrease messages
 - surface.dat - Appears to define surface properties, unsure if its used and how its used, maybe for cars?
 - surfaud.dat - Surface audio data, defines what type of surface different surface names are
 - surfinfo.dat - Defines different properties for surfaces
 - timecyc.dat - Defines environment colours and other properties based on weather and time
 - timecycp.dat - Defines environment colours and other properties based on weather and time - This is for PAL games.
 - txdcut.ide - Standard IDE File - Used to add additional TXDs into the game
 - vehicles.ide - Standard IDE File - Used to add cars into the game
 - water.dat - Defines water placement within the map
 - water1.dat - Defines water placement within the map - Unused
 - weapon.dat - Defines all weapons in the game

# /data/Decision
*No idea what the .ped files are used for, or their formats. Based on the folder name something related to pedestrian behaviours?*
*This directory has multiple other directories seemingly named after people who worked on the game, these directories contain similar files with the same format*
 - BLANK.ped
 - Cop.ped
 - FLAT.ped
 - GangMbr.ped
 - GROVE.ped
 - Indoors.ped
 - m_empty.ped
 - m_infrm.ped
 - m_norm.ped
 - m_std.ped
 - m_tough.ped
 - m_weak.ped
 - MISSION.grp
 - MISSION.ped
 - PedEvent.txt - Unknown, Similar to AudioEvent.txt files.

# /data/Icons
 - app.ico - Game Icon
 - bin.ico - Uninstaller Icon
 - saicon.ICN - Unknown
 - saicon2.ICN - Unknown
 - saicon3.ICN - Unknown

# /data/maps
*There's various directories within this one, all have similar files as below*
 - Audiozon.ipl - Standard IPL Format - Defines audio zones
 - cull.ipl - Standard IPL Format - Defines cull zones
 - occlu.ipl - Standard IPL Format - Defines occlusion zones
 - occluint.ipl - Standard IPL Format - Defines occlusion zones, presumably interior zones?
 - occluLA.ipl - Standard IPL Format - Defines occlusion zones, presumably Los Santos zones.
 - occlusf.ipl - Standard IPL Format - Defines occlusion zones, presumably San Fierro zones.
 - occluveg.ipl - Standard IPL Format - Defines occlusion zones, presumably Las Venturas zones.
 - paths.ipl - Standard IPL Format - Defines paths - Not sure if used and what its format is.
 - paths2.ipl - Standard IPL Format - Defines paths - Not sure if used and what its format is.
 - paths3.ipl - Standard IPL Format - Defines paths - Not sure if used and what its format is.
 - paths4.ipl - Standard IPL Format - Defines paths - Not sure if used and what its format is.
 - paths5.ipl - Standard IPL Format - Defines paths - Not sure if used and what its format is.
 - tunnels.ipl - Standard IPL Format - Defines cull zones, presumably for tunnels
 - txd.ide - Defines a txdp section, Presumably to load additional TXDs into the game.

# /data/Paths
 - carrec.img - Contains a bunch of .rrr files, defines paths for mission use. See [https://gtamods.com/wiki/Carrec](https://gtamods.com/wiki/Carrec)
 - NODES(0-63).dat - Multiple .dat files that define road nodes
 - spath0.dat - Unknown
 - tracks.dat - Unknown
 - tracks2.dat - Unknown
 - tracks3.dat - Unknown
 - tracks4.dat - Unknown
 - train.dat - Unknown
 - train2.dat - Unknown

# /data/script
 - main.scm - The main mission script
 - script.img - Archive containing more .scm scripts.

# /models
 - cutscene.img - Contains textures and models in cutscenes
 - effects.fxp - Unsure how it's used, appears to be some sort of particle effect definitions. - Not much documentation on it
 - effectsPC.txd - Textures references by effects.fxp
 - fonts.txd - Font texture maps
 - fronten_pc.txd - PC UI textures, only two cursor textures
 - fronten1.txd - Radio Logos including the map arrow
 - fronten2.txd - Pause menu backgrounds and game map
 - fronten3.txd - Menu background piece, not sure where this is used
 - gta_int.img - Contains textures and models for interiors - Also includes some collision files
 - gta3.img - Main texture and model archive, includes collision files and some dat files. - Appears to include some node*.dat files?
 - hud.txd - HUD Icons, mainly contains radar icons
 - misc.txd - Misc textures, only seems to be wheel textures
 - particle.txd - Particle textures
 - pcbtns.txd - PC Button textures, only contains icons for Up, Down, Left & Right
 - player.img - COntains textures and models for the player

# /models/coll
*I'm assuming these are collision files left over from GTA3 or a previous iteration of the game pre-release, they don't appear to do much but are apparently required for the game to function?*
 - peds.col - Presumably collision data for pedestrians? - Unsure if used
 - vehicles.col - Presumably collision data for vehicles? - Unsure if used
 - weapons.col - Presumably collision data for weapons? - Unsure if used

# /models/generic
 - air_vlo.DFF - Low resolution model of an airplane
 - arrow.DFF - A 3D downward facing arrow
 - hoop.dff - A hoop
 - vehicle.txd - Generic vehicle textures such as police text, scratch/damage textures etc.
 - wheels.DFF - Vehicle wheel models
 - wheels.txd - Vehicle wheel textures
 - zonecylb.DFF - Appears to be a cylinder with no top/bottom. Maybe used for mission entry markers?

# /models/grass
 - grass*_*.dff - Multiple files, each one is a different model for grass
 - plant1.dff - A piece of grass
 - plant1.txd - Multiple textures for the grass models.

# /models/txd
*This directory only contains texture archives, some interesting ones too*
 - intro1.txd - Unused - "Marco's Bistro, Liberty City 1986" - Presumably from Vice City
 - intro2.txd - Unused - "Escobar International Airport, Vice City" - Presumably from Vice City
 - INTRO3.TXD - Unused - "Vice City Docks" - Presumably from Vice City
 - intro4.txd - Unused - "Vice Beach, outside Ken's office" - Presumably from Vice City
 - LD_BEAT.TXD - PS2 Icons for dancing minigame, not sure if any of its used.
 - LD_BUM.txd - Unused - Depicts someone getting bummed (lol), cut content from the game
 - LD_CARD.txd - Playing Card textures, the Joker cards have GTA characters on them.
 - LD_CHAT.txd - Unused - Some textures presumably used for multiplayer. I assume this is a left over from GTA3's scrapped multiplayer.
 - LD_DRV.txd - Driving School Menu textures
 - LD_DUAL.txd - Duality arcade game textures
 - ld_grav.txd - Bee minigame textures, seems to also contain a texture from the horse racing machine
 - LD_NONE.txd - "The crawled from Uranus" minigame textures
 - LD_OTB.txd - Horse racing machine textures
 - LD_OTB2.txd - Horse racing machine textures
 - LD_PLAN.txd - Airport ticket menu textures
 - LD_POKE.txd - Poker machine textures, also includes playing card textures
 - LD_POOL.txd - Pool game textures. Only has "nib" and "ball"
 - LD_RACE.txd - Street racing textures, contains map textures from an early version of the game.
 - LD_RCE1.txd - Street racing textures, contains map textures from an early version of the game.
 - LD_RCE2.txd - Street racing textures, contains map textures from an early version of the game.
 - LD_RCE3.txd - Street racing textures, contains map textures from an early version of the game.
 - LD_RCE4.txd - Street racing textures, contains map textures from an early version of the game.
 - LD_RCE5.txd - Street racing textures, contains map textures from an early version of the game.
 - LD_ROUL.txd - Roulette game textures
 - ld_shtr.txd - Go-Go Space Monkey game textures, also contains horse racing screen texture
 - LD_SLOT.txd - Slot machine texture
 - LD_SPAC.txd - Duality arcade game textures.. again
 - LD_TATT.txd - Tattoo textures, presumably for menus
 - load0uk.txd - UK GTA:SA Splash Screen
 - loadsc0.txd - Multiple loading screens, loadsc0.txd is a GTA:SA Splash screen, the rest are in-game characters - Unsure if any of these are used
 - loadsc14.txd - Same as above, but this is an early version of Big Smoke - Unsure if this is used
 - LOADSCS.txd - Various loading screens, including splash screens for GTA:SA, Nvidia and EAX. Contains current version Big Smoke too.
 - LOADSUK.txd - Various loading screens, including GTA:SA splash screen. Contains current version Big Smoke too.
 - outro.txd - Unused - "Greetings from Vice City", left over from Vice City.
 - splash1.txd - Unused - Vice City loading screen
 - splash2.txd - Unused - Vice City loading screen
 - splash3.txd - Unsued - Empty TXD File.

# /movies
- GTAtitles.mpg - GTA:SA Intro Movie
- Logo.mpg - Rockstar Games & Rockstar North title movies

# /ReadMe
 - Readme.txt - It's the basic Readme included from the game.

# /text
*All files in here follow the same file format*
 - american.gxt - American Language Strings
 - french.gxt - French Language Strings
 - german.gxt - German Language Strings
 - italian.gxt - Italian Language Strings
 - spanish.gxt - Spanish Language Strings