import { INITIAL_PEOPLE_PER_DISTRICT } from "./constants.js";

interface RangeOptions {
    end: number;
    start: number;
    step?: number;
}

/** A way to create a for loop with range (like Python) */
export function* range(range: RangeOptions | number) {
    let rangeEnd: number;
    let start = 0;
    let step = 1;

    if (typeof range === 'number') {
        rangeEnd = range;
    } else {
        start = range.start;
        rangeEnd = range.end;
        step = range.step ?? 1;
    }

    for (let index = start; index < rangeEnd; index += step) {
        yield index;
    }
}

/** Round a number to specified decimal points */
export function round(number: number, dps: number) {
    const decimal = dps * 100
    return Math.round(number * decimal) / decimal
}


/** A function to generate age based on num - most age is between 25-40 */
export function chooseAge(num: number) {
    // use a seed based on the num and the amount of people to ensure consistency
    const seed = (num * 320) % INITIAL_PEOPLE_PER_DISTRICT;
    // use a normal distribution with mean 32.5 and standard deviation 4.5
    const mean = 32.5;
    const sd = 4.5;
    // use the Box-Muller transform to generate a random number from the normal distribution
    const u1 = (seed + 1) / (INITIAL_PEOPLE_PER_DISTRICT + 1); // uniform random number between 0 and 1
    const u2 = (seed + 2) / (INITIAL_PEOPLE_PER_DISTRICT + 2); // another uniform random number between 0 and 1
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); // standard normal random number
    const age = mean + sd * z; // normal random number with mean and sd
    // round the age to the nearest integer and clamp it between 18 and 65
    return Math.max(10, Math.min(65, Math.round(age)));
}

/** A function to make sorting easy */
export function randomSort<T>(array: T[]): T[] {
    // return array.sort(() => Math.random() - 0.5);
    const arrayBuffer = new Uint32Array(array.length * 16);
    const randomValues = crypto.getRandomValues(arrayBuffer);
    let arrayBufferIndex = 0;

    return array.sort(() => {
        const randomValueA = randomValues[arrayBufferIndex];
        const randomValueB = randomValues[arrayBufferIndex + 1];
        arrayBufferIndex += 2;
        return randomValueA > randomValueB ? 1 : -1;
    });

}