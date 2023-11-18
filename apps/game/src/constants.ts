/** How many people are generated in each district initially */
export const INITIAL_PEOPLE_PER_DISTRICT = 1000;

/** How many years to run */
export const YEARS_TO_SIMULATE = 50;

// Age settings
export const MIN_FIGHT_AGE = 14;
export const MIN_MARRIAGE_AGE = 18;
export const MIN_CHILD_BEARING_AGE = 18;
export const MAX_CHILD_BEARING_AGE = 40;
export const MAX_FIGHT_AGE = 84;

/** Currently has to be true */
export const CHOOSE_PEOPLE_RANDOMLY = true
/** Amount of people chosen per district */
export const RANDOM_PEOPLE_CHOSEN = 10
/** At least 25% of the chosen people have to be of each sex (can't be fully male) */
export const RANDOM_PEOPLE_GENDER_SPLIT = 0.25


import { MapBiomeConfig, MapBiome } from "./map/map-types.js";

/** When printing the map, use this as the legend */
export const mapConfig = {
    [MapBiome.Plain]: '🟩',
    [MapBiome.Grass]: '🌱',
    [MapBiome.Tree]: '🪴',
    [MapBiome.Forest]: '🌳',
    [MapBiome.Mountain]: '⛰️',
    [MapBiome.Lootbox]: '🎁',
    [MapBiome.SpawnPoint]: '🪂',
    [MapBiome.Lake]: '🌊'
} satisfies MapBiomeConfig

/** the size of game - not a square but circle */
export const MAP_SIZE = 100
export const MAP_SPAWN_SIZE = 10
export const MAP_SPAWN_GROUPS: 1 | 4 = 4
export const MAP_SPAWN_GROUPS_OFFSET = 20
