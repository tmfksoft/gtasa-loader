export default interface VehicleHandlingDefinition {
    id: string;
    mMass: number;
    turnMass: number;
    dragMult: number;
    centreOfMass: {
        x: number;
        y: number;
        z: number;
    };
    percentSubmerged: number;
    tractionMultiplier: number;
    tractionLoss: number;
    tractionBias: number;
    transmissionData: {
        numberOfGears: number;
        maxVelocity: number;
        engineAcceleration: number;
        engineInertia: number;
        driveType: 'F' | 'R' | '4' | string;
        engineType: 'P' | 'D' | 'E' | string;
    };
    brakeDeceleration: number;
    brakeBias: number;
    abs: boolean;
    steeringLock: boolean;
    suspensionForceLevel: 'L' | 'M' | 'H' | string;
    suspensionDampingLevel: 'L' | 'M' | 'H' | string;
    suspensionHighSpdComDamp: number;
    suspensionUpperLimit: number;
    suspensionLowerLimit: number;
    suspensionBiasFront: number;
    suspensionAntiDiveMultiplier: number;
    seatOffsetDistance: number;
    collisionDamageMultiplier: number;
    monetaryValue: number;
    modelFlags: number;
    handlingFlags: number;
    frontLights: number;
    rearLights: number;
    animGroup: number;
}
