import Player from "./player.js";

export enum MapBiome {
    Plain,
    Grass,
    Tree,
    Forest,
    Mountain,
    Lootbox,
    SpawnPoint, // effectively plain
    Lake
}

export const tileBiomeList = [
    MapBiome.Plain,
    MapBiome.Grass,
    MapBiome.Tree,
    MapBiome.Forest,
    MapBiome.Mountain,
    // MapBiome.Lootbox,
    // MapBiome.SpawnPoint,
    MapBiome.Lake
]

export interface MapBiomeConfig {
    [MapBiome.Plain]: string,
    [MapBiome.Grass]: string,
    [MapBiome.Tree]: string,
    [MapBiome.Forest]: string,
    [MapBiome.Mountain]: string,
    [MapBiome.Lootbox]: string,
    [MapBiome.SpawnPoint]: string,
    [MapBiome.Lake]: string
}


export type MapCord = `${number}-${number}`
export type MapTile = {
    type: MapBiome,
    player?: Player,
    /** how many turns left until it kills you (if 0 and player on it, death) */
    redZone?: number
}

/** The choice a player can do for moving */
export enum MovementChoice {
    Up,
    Down,
    Left,
    Right,
    None
}

/** The actual action the user will do */
export enum TurnAction {
    Move,
    Fight,
    Pass,
    Hide,
    Loot,
}