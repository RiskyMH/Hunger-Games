import { range, chooseAge } from "./utils.js";
import { faker } from "@faker-js/faker";
import {
    INITIAL_PEOPLE_PER_DISTRICT,
    MAX_FIGHT_AGE,
    MIN_FIGHT_AGE,
    MIN_MARRIAGE_AGE,
    YEARS_TO_SIMULATE,
    CHOOSE_PEOPLE_RANDOMLY, RANDOM_PEOPLE_CHOSEN, RANDOM_PEOPLE_GENDER_SPLIT
} from "./constants.js";
import { Family } from "./family.js";
import Person from "./people.js";
import District, { CensusProp, districts } from "./districts.js";
import { Learboard, Sex } from "./types.js";
import { ExportedData } from "./export.js";
import { GameMap } from "./map/map.js";
import assert from "assert/strict";


export default class Game {
    readonly districts: District[]
    readonly families: Family[] = []
    readonly learboards: Learboard[] = []
    year = 1;

    constructor() {
        // generate districts and their people
        this.districts = districts.map(d => new District({ type: d, game: this }));
        for (const district of this.districts) {
            this.generateInitialPeople(district);
        }
    }

    start() {
        console.time("Running game")

        // run game for a few years (specified in constants file)
        while (this.year <= YEARS_TO_SIMULATE) {
            this.newYear()
        }

        console.timeEnd("Running game")
        console.log("Game over!!")
    }

    newYear() {
        //? Pre hunger games (district stuff for the whole "year")
        for (const district of this.districts) {

            // add age
            for (const person of district.people) {
                if (!person.alive) continue
                person.age += 1;
            }

            // make new families + children + kill people randomly
            this.makeNewFamilies(district);
            this.makeNewChildren();
            this.killPeople();
        }

        // get some players from each district (some male and female)
        const players: Person[] = []
        for (const district of this.districts) {
            players.push(...this.choosePlayers(district))
        }


        // check that there are players that can actually play
        if (players.length) {
            //? Start hunger games
            console.time("game " + this.year)

            // create the map and start the turns
            const map = new GameMap(players, this)
            map.start()

            console.timeEnd("game " + this.year)
            console.log()

        } else {
            console.log("No players that can play")
        }


        //? Save data
        for (const district of this.districts) {
            const deaths = district.people.filter(person => person.diedAt === this.year).length;
            const births = district.people.filter(person => person.age === 0).length;
            district.addCensus({ year: this.year, deaths, births, bestTurnAction: district.currentTurnActionWeightings! });
        }

        // new year!
        this.year += 1;
    }

    /** A way of getting all the people in the game without directly using districts */
    get people() {
        return this.districts.flatMap(d => d.people);
    }

    /** Generate the initial people and a random name */
    private generateInitialPeople(district: District) {
        for (const num of range(INITIAL_PEOPLE_PER_DISTRICT)) {
            const sex = (num % 2) ? "male" : "female";
            const name = faker.person.fullName({ sex })
            const age = chooseAge(num);

            const person = new Person({ district, name, sex, age, game: this })
            district.addPerson(person)
        }
    }

    /** 
     * Decide if 2 people should be allowed to marry (based on actual logic and random) 
     * 
     * - higher chance when there is fewer families
     * - also higher chance when there are more people in the district
     * 
     * */
    private allowMarriage(male: Person, female: Person): boolean {

        // just check that they are valid inputs
        assert.equal(male.district.type, female.district.type, "People must be in the same district")
        assert.equal(male.sex, "male", "Parents must be correct sex")
        assert.equal(female.sex, "female", "Parents must be correct sex")

        // if they are already a parent, just ignore they request of affair
        if (male.family?.parentMale === male) return false
        if (female.family?.parentFemale === male) return false

        // Check that they are the correct age to marry (parents must be over 18)
        if (male.age < MIN_MARRIAGE_AGE || female.age < MIN_MARRIAGE_AGE) {
            return false;
        }

        // get the data to choose from
        const district = male.district;
        const numFamilies = this.families.length;
        const numPeople = district.people.length;

        const probability = 1 / (numFamilies + numPeople);

        // make decision based on probability
        return Math.random() < probability;
    }

    /** A function to choose the players fighting in a map */
    private choosePlayers(district: District) {
        // only allow choose players randomly for now
        if (CHOOSE_PEOPLE_RANDOMLY !== true) {
            throw new Error("Not implemented")
        }

        // only get the people that are alive and are the correct age (not too young or old)
        const availablePeople = district.people
            .filter((p) => p.age > MIN_FIGHT_AGE)
            .filter((p) => p.age < MAX_FIGHT_AGE)
            .filter((p) => p.alive)
            .sort(() => Math.random() - 0.5);


        const chosen: Person[] = []

        // choose a few people randomly
        for (const i of range(RANDOM_PEOPLE_CHOSEN)) {
            const amountOfMales = chosen.filter(e => e?.sex === 'male').length
            const amountOfFemales = chosen.filter(e => e?.sex === 'female').length

            // make sure each district has a good split if each gender
            if (Math.abs(amountOfMales / amountOfFemales) < RANDOM_PEOPLE_GENDER_SPLIT) {
                if (amountOfMales > amountOfFemales) {
                    chosen.push(availablePeople.filter(e => e.sex === 'female').pop()!)
                } else {
                    chosen.push(availablePeople.filter(e => e.sex === 'male').pop()!)
                }
            }
            chosen.push(availablePeople.pop()!);

        }

        return chosen
    }

    /** A function to match people up together and marry (to make children) */
    private makeNewFamilies(district: District) {
        // make tuples randomly for males + females and see if they should get married
        const males = district.people.filter((p) => p.sex === "male")
            .filter((p) => p.age > MIN_MARRIAGE_AGE)
            .filter((p) => p.family === undefined)
            .filter((p) => p.alive)
            .sort(() => Math.random() - 0.5);

        const females = district.people.filter((p) => p.sex === "female")
            .filter((p) => p.age > MIN_MARRIAGE_AGE)
            .filter((p) => p.family === undefined)
            .filter((p) => p.alive)
            .sort(() => Math.random() - 0.5);

        // use shuffled arrays to make tuples of the people
        const amount = Math.min(males.length, females.length);
        for (const num of range(amount)) {
            const male = males[num];
            const female = females[num];

            // work out if they should get married
            const allowed = this.allowMarriage(male, female);
            if (!allowed) continue

            // create the family
            const family = new Family(male, female)
            this.families.push(family);
        }

    }

    /** A function to make children inside families */
    private makeNewChildren() {
        // just a tally to see how many children are created
        let created = 0

        // find all the families that should have a child
        const families = this.families.filter(family => family.shouldHaveChild() === 1);

        for (const family of families) {
            // get a random sex and name (with same last name as family)
            const sex = faker.person.sex() as Sex;
            const name = faker.person.fullName({ sex, lastName: family.familyName })

            // create the child and add to the family
            const child = new Person({ district: family.district, name, sex, age: 0, game: this })
            family.addChild(child);
            created++
        }

        return created
    }

    /** A function to randomly kill a few people
     * 
     * - kill only a few people
     * - meant to symbolize random death (ie. disease)
     */
    private killPeople() {
        // go through the districts
        for (const district of this.districts) {
            const people = district.people.filter(person => person.alive);

            // choose how many people to kill
            const amountToKill = Math.floor(Math.random() * people.length / 250);
            for (const num of range(amountToKill)) {
                // now kill them (but its randomly selected)
                const randomPerson = people[Math.floor(Math.random() * people.length)];
                if (randomPerson.alive) randomPerson.kill(this.year);
            }
        }
    }

    /** A function to create exporting data to json easy */
    export(): ExportedData {
        const data: ExportedData = {
            people: [],
            districtCensus: {},
            leaderboard: this.learboards,
            families: {},
            metadata: {
                date: new Date().toISOString(),
                years_simulated: YEARS_TO_SIMULATE,
                people_per_district: INITIAL_PEOPLE_PER_DISTRICT,
            }
        };

        for (const district of this.districts) {
            data.districtCensus[district.type] = district.census;
            data.people.push(...district.people.map(person => person.export()));
            data.families[district.type] = [];
            data.families[district.type].push(...this.families.map(family => family.export()));
        }

        return data;

    }

}