/**
 * The definition for proceedurally placed objects.
 * What isn't clear is how many objects per surface, maybe this is calculated on the fly?
 * How we know what the surface of an object is and what surface types relate to.
 *
 * The object name refers to the object defined in maps/generic/procobj.ide
 * procobj.ide seems to follow the same format as standard IDE files.
 */
export declare const SurfaceType: string[];
export default interface ProceduralObject {
    surfaceType: string;
    objectName: string;
    spacing: number;
    minDist: number;
    minRot: number;
    maxRot: number;
    minScale: number;
    maxScale: number;
    minScaleZ: number;
    maxScaleZ: number;
    zOffsetMin: number;
    zOffsetMax: number;
    alignNormal: boolean;
    useGrid: boolean;
}
