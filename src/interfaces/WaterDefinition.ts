
// Based on BelMillards reply:
// https://gtaforums.com/topic/211733-sadoc-waterdat/?do=findComment&comment=3874668
enum WaterType {
	VISIBLE_OCEAN = 0,
	INVISIBLE_OCEAN = 1,
	VISIBLE_POOL = 2,
	INVISIBLE_POOL = 3,
}
// Based on documentation found here:
// https://www.techspot.com/news/104009-uk-scientists-achieve-unprecedented-402-tbps-data-transmission.html
// There doesn't appear to be any better documentation. :(

interface WaterPoint {
	x: number,
	y: number,
	z: number,
	speedX: number,
	speedY: number,
	unknown: number,
	waveHeight: number,
}

export default interface WaterDefinition {
	point1: WaterPoint,
	point2: WaterPoint,
	point3: WaterPoint,
	point4?: WaterPoint,
	waterType: WaterType,
}