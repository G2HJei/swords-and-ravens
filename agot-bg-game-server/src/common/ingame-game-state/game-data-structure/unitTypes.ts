import UnitType from "./UnitType";
import RegionKind from "./RegionKind";
import BetterMap from "../../../utils/BetterMap";

export const footman = new UnitType("footman", "Footman", "Adds 1 Combat Strength in battle. Costs 1 point of mustering.", RegionKind.LAND, 1);
export const knight = new UnitType("knight", "Knight", "Adds 2 Combat Strength in battle. Costs 2 points of mustering (or 1 point if upgraded from a Footman).", RegionKind.LAND, 2);
export const siegeEngine = new UnitType("siege-engine", "Siege Engine", "Adds 4 Combat Strength when attacking (or supporting an attack against) an area containing a Castle or Stronghold, otherwise it adds 0. Siege Engines may not retreat when losing combat; they are destroyed instead. Costs 2 points of mustering (or 1 point if upgraded from a Footman).", RegionKind.LAND, 0, 4, null, false);
export const ship = new UnitType("ship", "Ship", "Adds 1 Combat Strength in battle. Costs 1 point of mustering.", RegionKind.SEA, 1, null, RegionKind.LAND);
export const dragon = new UnitType("dragon", "Dragon", "Adds 0-5 Combat Strength in battle, depending on the current position of the dragon strength token. Dragons are extraordinarily rare creatures and cannot be mustered like regular units. Instead, they are in play from the beginning of the game.", RegionKind.LAND, 0, null, null, true, 2);

const unitTypes = new BetterMap<string, UnitType>([
    [footman.id, footman],
    [knight.id, knight],
    [siegeEngine.id, siegeEngine],
    [ship.id, ship],
    [dragon.id, dragon]
]);

export default unitTypes;
