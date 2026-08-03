import AnimAnimationChunk from "@majesticfudgie/dff-reader/build/interfaces/chunks/UVAnimationChunk";

// UV_Animation_PLG (material.uvAnimation.channels[]) only carries a name
// reference on-disk - dff-reader resolves the actual keyframe data via
// DFFReader.getUVAnimation(name), which needs the DFFReader instance itself.
// getDFF() only returns the parsed node tree, so LocalGameLoaderAPI resolves
// each channel against the dictionary before that instance goes out of scope
// and attaches it here.
export default interface ResolvedUVAnimationChannel {
	slot: number,
	name: string,
	animation?: AnimAnimationChunk,
}
