// https://gtamods.com/wiki/CARS_(IDE_Section)#San_Andreas

export interface VehicleBaseDefinition {
	id: number, // Model ID
	modelName: string, // Model Name
	txdName: string, // TXD Name
	type: 'car' | 'mtruck' | 'heli' | 'boat' | 'trailer' | 'bike' | 'train' | 'plane' |'bmx' | 'quad', // Vehicle Type
	handlingId: string, // Name of the handling config
	gameName: string, // GXT Key for the vehicle name
	anims: string | null, // Animations, if any
	vehicleClass: string, // Class of the vehicle e.g. "richfamily"
	frequency: number, // Random spawn frequency
	flags: number, // Flags, no real idea what this is used for. 0x01 = "Streams a vehicle out after it has been spawned once"?

	comprules: number, // Unknown, may be used in scripts?
}

export interface VehicleGroundDefinition extends VehicleBaseDefinition {
	type: 'car' | 'trailer' | 'quad' | 'mtruck' | 'bmx' | 'bike',
	wheelScaleFront: number, // Scale of the front wheel model and collision
	wheelScaleRear: number, // Scale of the rear wheel model and collision

	wheelId: number, // Wheel index. Not sure what it's an index of..?!
	wheelUpgradeClass: number, // Wheel set, see carmods.dat
}


type VehicleDefinition = VehicleGroundDefinition | VehicleBaseDefinition;
export default VehicleDefinition;