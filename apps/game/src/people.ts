import District from "./districts.js";
import { Sex } from "./types.js";
import { ExportedPerson } from "./export.js";
import { Family } from "./family.js";
import Game from "./game.js";
import assert from "assert/strict";


export interface PersonProps {
    district: District,
    name: string,
    sex: Sex,
    age: number,
    game: Game
}

/** IDs are hard... so I make a counter to still have them unique */
let _idIncrement = 0;

export default class Person {
    readonly game: Game;
    readonly district: District;
    readonly name: string;
    readonly sex: Sex;

    alive: boolean = true;
    age: number
    diedAt: number | null = null;
    family?: Family

    id: number = _idIncrement++;

    constructor(person: PersonProps) {
        // Object.assign(this, player);
        this.district = person.district;
        this.name = person.name;
        this.sex = person.sex;
        this.age = person.age;
        this.game = person.game;

    }

    export(): ExportedPerson {
        return {
            district: this.district.type,
            name: this.name,
            age: this.age,
            sex: this.sex,
            diedAt: this.diedAt,
            id: this.id
        }
    }

    /** Kill the person */
    kill(year: number) {
        assert(this.alive, 'Person is already dead')
        this.alive = false;
        this.diedAt = year;
    }


}