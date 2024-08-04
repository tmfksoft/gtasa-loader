export interface VehicleBaseDefinition {
    id: number;
    modelName: string;
    txdName: string;
    type: 'car' | 'mtruck' | 'heli' | 'boat' | 'trailer' | 'bike' | 'train' | 'plane' | 'bmx' | 'quad';
    handlingId: string;
    gameName: string;
    anims: string | null;
    vehicleClass: string;
    frequency: number;
    flags: number;
    comprules: number;
}
export interface VehicleGroundDefinition extends VehicleBaseDefinition {
    type: 'car' | 'trailer' | 'quad' | 'mtruck' | 'bmx' | 'bike';
    wheelScaleFront: number;
    wheelScaleRear: number;
    wheelId: number;
    wheelUpgradeClass: number;
}
type VehicleDefinition = VehicleGroundDefinition | VehicleBaseDefinition;
export default VehicleDefinition;
