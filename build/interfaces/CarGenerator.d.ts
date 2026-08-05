/**
 * A parked car generator - one fixed spot where the game puts a vehicle.
 *
 * These are what fill driveways, car parks, airfields and docks. They're
 * distinct from traffic, which the game spawns dynamically along the path
 * node network according to popcycle.dat.
 */
export default interface CarGenerator {
    /** Byte offset in main.scm this was read from, useful for cross-checking. */
    offset: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    /** Heading in degrees. */
    angle: number;
    /**
     * Vehicle model id, matching vehicles.ide.
     *
     * -1 means the game picks one at random from whatever is appropriate for
     * the zone, so there's no single correct vehicle to show for it.
     */
    modelId: number;
    /**
     * Paint colours as indices into carcols.dat's palette, or -1 to let the
     * game pick a permitted combination for that model at random.
     */
    primaryColour: number;
    secondaryColour: number;
    /**
     * Whether the vehicle appears regardless of how many cars already exist
     * nearby. Set on the ones the game wants you to be able to rely on.
     */
    forceSpawn: boolean;
    /** Chance out of 100 that the vehicle has a car alarm. */
    alarmChance: number;
    /** Chance out of 100 that the vehicle's doors are locked. */
    doorLockChance: number;
    /** Respawn delay bounds, in milliseconds. */
    minDelay: number;
    maxDelay: number;
}
