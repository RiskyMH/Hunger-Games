import { TurnAction } from "./map-types.js"

const TOTAL_STAT_VALUE = 20
const MIN_STAT_VALUE = 1
const MAX_STAT_VALUE = TOTAL_STAT_VALUE - MIN_STAT_VALUE * 4

export function getStatRange(bestStat: number | null, allowedDifference: number) {
    // check if a stat was provided
    if (bestStat !== null) {
        // incase it was being averaged out, round the value
        bestStat = Math.round(bestStat)
        const minRange = Math.max(bestStat! - allowedDifference, MIN_STAT_VALUE)
        const maxRange = Math.min(bestStat! + allowedDifference, MAX_STAT_VALUE)
        return [minRange, maxRange]
    } else {
        // just use the min and max values because no stat was provided
        const minRange = MIN_STAT_VALUE
        const maxRange = MAX_STAT_VALUE
        return [minRange, maxRange]
    }
}

export function makeRandomStats(bestStat: Record<TurnAction, number> | null, allowedDifference = 6): Record<TurnAction, number> {
    // work out the total amount of stats to distribute
    let remainingTotal = TOTAL_STAT_VALUE + 0

    const stats = {} as Record<TurnAction, number>

    // shuffle the stat options so that they are randomised and make sure they are all set to 0
    const shuffledStatOptions = [TurnAction.Loot, TurnAction.Hide, TurnAction.Fight, TurnAction.Move]
        .sort(() => Math.random() - 0.5)

    for (const statName of shuffledStatOptions) {
        stats[statName] = 0
    }

    // loop through the stat options and set them to a random value
    for (const statName of shuffledStatOptions) {
        const [minRange, maxRange] = getStatRange(bestStat?.[statName] ?? null, allowedDifference)
        let stat: number
        if (minRange > maxRange) {
            stat = maxRange
        } else {
            stat = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange
        }
        stats[statName] = stat
        remainingTotal -= stat
    }

    // if there is any remaining total, add or remove it to a random stat
    if (remainingTotal > 0) {
        const statName = shuffledStatOptions.sort(() => Math.random() - 0.5)[0]
        stats[statName] += remainingTotal
    } else if (remainingTotal < 0) {
        // if there is too much total, remove it from random stats
        const statNames = shuffledStatOptions.sort(() => Math.random() - 0.5)

        for (const statName of statNames) {
            const remainingAdjustment = Math.abs(remainingTotal)
            if (remainingAdjustment <= stats[statName] - MIN_STAT_VALUE) {
                stats[statName] -= remainingAdjustment
                break
            } else {
                const remainingAdjustment = stats[statName] - MIN_STAT_VALUE
                stats[statName] = MIN_STAT_VALUE
                remainingTotal += remainingAdjustment
            }
        }
    }

    return stats
}




