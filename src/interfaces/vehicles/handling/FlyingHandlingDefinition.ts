// Looks to be the exact same as a car.. copy-pasta!
export default interface FlyingHandlingDefinition {
	id: string, // Vehicle DFF/GXT Name
	mass: number,
	turnMass: number,
	dragMult: number, // Drag Multiplier?
	centreOfMass: { x: number, y: number, z: number },
	percentSubmerged: number, // Likely how into water it should be till its counted as submerged
	tractionMultiplier: number,
	tractionLoss: number,
	tractionBias: number,

	// Prefixed with "TransmissionData" in handling.cfg
	transmissionData: {
		numberOfGears: number,
		maxVelocity: number,
		engineAcceleration: number,
		engineInertia: number,
		driveType: 'F' | 'R' | '4' | string, // Front, Rear, 4-Wheel Drive
		engineType: 'P' | 'D' | 'E' | string, // Petrol, Diesel, Electric
	},
	brakeDeceleration: number,
	brakeBias: number,
	abs: boolean, // 0/1 in handling.cfg
	steeringLock: boolean, // Unsure
	suspensionForceLevel: 'L' | 'M' | 'H' | string, // Low, Medium, High
	suspensionDampingLevel: 'L' | 'M' | 'H' | string, // Low, Medium, High
	suspensionHighSpdComDamp: number,
	suspensionUpperLimit: number,
	suspensionLowerLimit: number,
	suspensionBiasFront: number,
	suspensionAntiDiveMultiplier: number,
	seatOffsetDistance: number,
	collisionDamageMultiplier: number,
	monetaryValue: number,
	modelFlags: number, // Hex
	handlingFlags: number, // Hex
	frontLights: number, // 0 = Long, 1 = Small, 2 = Big, 3 = Tall
	rearLights: number, // 0 = Logn, 1 = Small, 2 = Big, 3 = Tall
	animGroup: number,
}