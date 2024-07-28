import Color from "./Color";
export default interface WeatherDefinition {
    ambientColor: Color;
    ambientObjectColor: Color;
    directLight: Color;
    skyTop: Color;
    skyBottom: Color;
    sunCore: Color;
    sunCorona: Color;
    sunSize: number;
    spriteSize: number;
    spriteBrightness: number;
    shadowIntensity: number;
    lightShd: number;
    poleShd: number;
    farClipping: number;
    fogStart: number;
    lightOnGround: number;
    lowCloudsColor: Color;
    bottomCloudColor: Color;
    waterColor: Color;
    alpha1: number;
    RGB1: Color;
    alpha2: number;
    RGB2: Color;
    cloudAlpha: Color;
}
