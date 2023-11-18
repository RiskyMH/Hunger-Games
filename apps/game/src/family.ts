import { MIN_MARRIAGE_AGE } from "./constants.js";
import { MAX_CHILD_BEARING_AGE, MIN_CHILD_BEARING_AGE } from "./constants.js";
import District from "./districts.js";
import { ExportedFamily } from "./export.js";
import Game from "./game.js";
import Person from "./people.js";
import assert from "assert/strict";


export class Family {
    readonly parentMale: Person
    readonly parentFemale: Person
    readonly district: District
    readonly game: Game

    readonly children: Person[] = []

    constructor(parentMale: Person, parentFemale: Person) {
        this.parentMale = parentMale;
        this.parentFemale = parentFemale;
        this.district = parentMale.district;
        this.game = parentMale.game;

        // need to be same district
        assert.equal(
            this.parentFemale.district.type,
            this.parentMale.district.type,
            "Parents must be in the same district"
        );

        // check that they are the correct sex
        assert.equal(this.parentMale.sex, "male", "Parents must be correct sex")
        assert.equal(this.parentFemale.sex, "female", "Parents must be correct sex")

        // make sure they are both over 18
        assert(this.parentMale.age > MIN_MARRIAGE_AGE, "Parents must be over 18")
        assert(this.parentFemale.age > MIN_MARRIAGE_AGE, "Parents must be over 18")

        // already has a family?
        assert.notEqual(this.parentMale, this.parentMale.family?.parentMale, "Male parent already has a family")
        assert.notEqual(this.parentFemale, this.parentFemale.family?.parentFemale, "Female parent already has a family")

        // set family on people
        this.parentMale.family = this;
        this.parentFemale.family = this;
    }

    /** A function to decide weather or not the family should have a child
     * 
     * - higher probability of having a child if the family has fewer children
     * - both parents are younger than 40 and alive
     */
    shouldHaveChild(): number {
        // if one of them isn't alive, they can't reproduce
        if (!this.parentMale.alive || !this.parentFemale.alive) {
            return 0;
        }

        // too old to have children
        if (this.parentMale.age > MAX_CHILD_BEARING_AGE || this.parentFemale.age > MAX_CHILD_BEARING_AGE) {
            return 0;
        }

        // too young to have children
        if (this.parentMale.age < MIN_CHILD_BEARING_AGE || this.parentFemale.age < MIN_CHILD_BEARING_AGE) {
            return 0;
        }

        // the probability of having a child is decent but twins are rare
        // takes into account the current number of children

        // if 5+ alive children, no more children
        if (this.children.filter(child => child.alive).length >= 5) {
            return 0;
        }

        // make fancy probability based on the number of children
        const probability = 1 / (this.children.length + 2);
        return Math.random() < probability ? 1 : 0;

    }

    addChild(child: Person) {
        this.children.push(child);
        this.district.addPerson(child);
        child.family = this;
    }

    /** Uses the fathers surname to get the family name */
    get familyName() {
        return this.parentMale.name.split(' ').at(-1)
    }

    export(): ExportedFamily {
        return {
            parentMale: this.parentMale.id,
            parentFemale: this.parentFemale.id,
            children: this.children.map(child => child.id)
        }
    }
}