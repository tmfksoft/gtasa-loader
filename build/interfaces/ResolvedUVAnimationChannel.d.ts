import AnimAnimationChunk from "@majesticfudgie/dff-reader/build/interfaces/chunks/UVAnimationChunk";
export default interface ResolvedUVAnimationChannel {
    slot: number;
    name: string;
    animation?: AnimAnimationChunk;
}
