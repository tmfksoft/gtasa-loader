import Color from "./Color";

// Values read from Timecyc
// https://gta.fandom.com/wiki/TimeCyc_Definition#San_Andreas

// I've tweaked the naming of some values to make them clearer.

export default interface WeatherDefinition {
	ambientColor: Color, 		// Controls amount of ambient color on static map objects, such as most buildings, structures and landmasses.
	ambientObjectColor: Color, 	// Controls amount of ambient color on dynamic objects, such as pedestrians and vehicles.
	directLight: Color,			// Controls amount of direct light on pedestrians and vehicles.
	skyTop: Color,				// Color of the top of the sky's gradient.
	skyBottom: Color,			// Color of the bottom of the sky's gradient.
	sunCore: Color,				// Color of the sun's core sprite.
	sunCorona: Color,			// Color of the sun's corona sprite and lens flare.
	sunSize: number,			// Size of the sun's corona sprite.
	spriteSize: number,			// Size of the sun's core sprite.
	spriteBrightness: number,	// How bright sprites will be. This also affects the brightness of the lampposts and traffic lights. Values over 1.00 will cause color problems. Due to a glitch in San Andreas's game engine, this value will also affect the brightness of all other corona sprites, including the sprites of headlights, lights on buildings and runways, vehicle sirens, and any other coronas on vehicles or objects.
	shadowIntensity: number,	// Intensity of pedestrian, vehicle, and lamp shadows. 0 is transparent, 100 seems to be about "normal", and values past that make the shadow darker and darker. 500 will produce almost pure black shadows.
	lightShd: number,			// The cast light alpha on traffic signals and lamp posts. Changing produces no visible results.
	poleShd: number,			// Lamppost shadow alpha. Changing produces no visible results.
	farClipping: number,		// The clipping plane that limits maximum visibility in meters. Setting the value to a smaller number produces a short visibility range, whereas larger numbers mean you can see further. If the number is set too low, the game will glitch, and may not load textures. The values for this entry range from 150 to 1500, and values higher than that will make parts of the map flicker and disappear when looking directly down; high values also may create "holes" from far away due to the map's short draw distance limit.
	fogStart: number,			// Controls the distance from the camera at which distance fogging will begin in meters. Although mostly positive, negative values are allowed and can be used to achieve a "foggy" effect. If the number is a higher value than the clipping value, the distance fogging will begin beyond of what is rendered and thus no fogging will be visible. This can cause graphical glitches. The average value for this entry is 100.
	lightOnGround: number,		// Amount of light on the ground of the sea.
	lowCloudsColor: Color,		// Sets colour for low thin clouds.
	bottomCloudColor: Color,	// Sets colour for underside of large clouds.
	waterColor: Color,			// Controls the color of the water. This value multiplies the texture's color and the last value 'A' is the alpha: 0 will make the water totally transparent, while 255 will make the water as opaque as the game will allow.
	alpha1: number,				// Alpha for RGB1.
	RGB1: Color,				// Color correction 1.
	alpha2: number,				// Alpha for RGB2 value.
	RGB2: Color,				// Color correction 2.
	cloudAlpha: Color,			// Defines alpha level of the clouds: 0 - no clouds, 255 - opaque clouds.
}