import Game from "./game.js";
import { TurnAction } from "./map/map-types.js";
import Person from "./people.js";

export interface DistrictProps {
    // name: string,
    type: DistrictType,
    game: Game
}

export interface CensusProp {
    year: number,
    deaths: number,
    births: number,
    bestTurnAction: Record<TurnAction, number>,
}

/** Districts for Hunger Games */
export default class District {
    readonly type: DistrictType;
    readonly game: Game;
    readonly people: Person[] = [];

    /** 0-100 */
    nourishment: number = 50;

    constructor(district: DistrictProps) {
        this.type = district.type;
        this.game = district.game;
    }

    /** The decision weightings for players to build their decisions upon */
    currentTurnActionWeightings: Record<TurnAction, number> | null = null

    get name() {
        return `District ${this.type}: ${districtsNamed[this.type]}`;
    }

    addPerson(person: Person) {
        this.people.push(person);
    }

    /** The deaths and births for each year - just information to show */
    readonly census: DistrictCensus[] = [];

    addCensus(census: CensusProp) {
        this.census.push({
            ...census,
            population: this.people.length,
            nourishment: this.nourishment,

        });
    }

    /**  */
    readonly leaderboard: Record<number, number> = {};

}

/** The deaths and births for each year - just information to show */
export interface DistrictCensus {
    year: number,
    deaths: number,
    births: number,
    population: number,
    nourishment: number,
    bestTurnAction: Record<TurnAction, number>,
}


/** Districts for Hunger Games */
export enum DistrictType {
    // the names can be changed later
    Luxury = 1,
    Masonry = 2,
    Electronics = 3,
    Fishing = 4,
    Power = 5,
    Transportation = 6,
    Lumber = 7,
    Textiles = 8,
    Grain = 9,
    Livestock = 10,
    Agriculture = 11,
    Coal = 12,
}

export const districts = [
    DistrictType.Luxury,
    DistrictType.Masonry,
    DistrictType.Electronics,
    DistrictType.Fishing,
    DistrictType.Power,
    DistrictType.Transportation,
    DistrictType.Lumber,
    DistrictType.Textiles,
    DistrictType.Grain,
    DistrictType.Livestock,
    DistrictType.Agriculture,
    DistrictType.Coal,
] satisfies DistrictType[]

/** Names for each district (not just the number) */
export const districtsNamed = {
    [DistrictType.Luxury]: "Luxury Items",
    [DistrictType.Masonry]: "Masonry",
    [DistrictType.Electronics]: "Electronics",
    [DistrictType.Fishing]: "Fishing",
    [DistrictType.Power]: "Power",
    [DistrictType.Transportation]: "Transportation",
    [DistrictType.Lumber]: "Lumber",
    [DistrictType.Textiles]: "Textiles",
    [DistrictType.Grain]: "Grain",
    [DistrictType.Livestock]: "Livestock",
    [DistrictType.Agriculture]: "Agriculture",
    [DistrictType.Coal]: "Coal",
} satisfies Record<DistrictType, string>
