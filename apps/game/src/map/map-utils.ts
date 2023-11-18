import { districts } from "../districts.js"
import { range } from "../utils.js"
import assert from "assert/strict";
import { MapBiome, MapBiomeConfig, MapCord, MapTile, tileBiomeList } from "./map-types.js";
import { MAP_SIZE, MAP_SPAWN_GROUPS, MAP_SPAWN_GROUPS_OFFSET, MAP_SPAWN_SIZE } from "../constants.js";
import pc from "picocolors"
import { GameMap } from "./map.js";

/** Use rudimentary method to find the map size */
export function mapSize(map: Map<MapCord, MapTile>): [number, number] {
    const mapEntries = [...map.entries()]

    const maxX = Math.max(...mapEntries.map(e => parseInt(e[0].split('-')[0])))
    const maxY = Math.max(...mapEntries.map(e => parseInt(e[0].split('-')[1])))
    return [maxX, maxY]
}

/** Convert a string map to a Map - useful when testing and not wanting to use random */
export function convertStrMapToActual(mapStr: string, mapConfig: MapBiomeConfig) {
    // map = map.replace(/[\w\W]+?\n+?/, "");
    const map = new Map<MapCord, MapTile>()

    let playerSpawnPoints = 0

    let x = 0
    for (const line of mapStr.split('\n')) {
        if (line == '') {
            continue
        }

        x += 1
        let y = 0

        for (const char of line.split(/\s+/g)) {
            y += 1

            const typeStr = Object.entries(mapConfig).find(e => e[1] === char)

            if (!typeStr) {
                if (char !== '') console.warn('Unknown Char: ' + char)
                continue
            }

            const type = parseInt(typeStr[0])
            map.set(`${x}-${y}`, { type })

            if (type === MapBiome.SpawnPoint) {
                playerSpawnPoints += 1;
            }

        }
    }

    assert.equal(
        playerSpawnPoints,
        districts.length * 2,
        `Not enough spawn points, received ${playerSpawnPoints} but expected ${districts.length * 2}`
    )


    // make sure the map is all filled out
    const [maxX, maxY] = mapSize(map)
    for (const x of range({ start: 1, end: maxX + 1 })) {
        for (const y of range({ start: 1, end: maxY + 1 })) {
            const entry = map.has(`${x}-${y}`)
            if (!entry) map.set(`${x}-${y}`, { type: MapBiome.Plain })
        }
    }

    return map
}

/** Make the random map */
export function makeMap() {
    const map = new Map<MapCord, MapTile>()

    // make a circle map
    for (const [x, y] of makeCircleCords(MAP_SIZE, MAP_SIZE / 2)) {
        const randomIndex = Math.floor(Math.random() * tileBiomeList.length);
        const tileType = tileBiomeList[randomIndex];
        map.set(`${x}-${y}`, { type: tileType })
    }

    // make the mini circles
    const miniCircles = [...makeCircleCords(MAP_SIZE, MAP_SPAWN_SIZE, true)]
    // console.log(miniCircles.length)
    for (const group of range(MAP_SPAWN_GROUPS)) {
        for (const [x, y] of miniCircles) {
            let key: MapCord = `${x}-${y}`
            if (MAP_SPAWN_GROUPS === 1) {
                // pass
            } else if (MAP_SPAWN_GROUPS === 4) {
                // get the offset for each group
                const [xOffset, yOffset] =
                    group === 0 ? [-MAP_SPAWN_GROUPS_OFFSET, MAP_SPAWN_GROUPS_OFFSET]
                        : group === 1 ? [MAP_SPAWN_GROUPS_OFFSET, -MAP_SPAWN_GROUPS_OFFSET]
                            : group === 2 ? [-MAP_SPAWN_GROUPS_OFFSET, -MAP_SPAWN_GROUPS_OFFSET]
                                : group === 3 ? [MAP_SPAWN_GROUPS_OFFSET, MAP_SPAWN_GROUPS_OFFSET]
                                    : [0, 0]

                key = `${x - xOffset}-${y - yOffset}` as MapCord
            }
            map.set(key, { type: MapBiome.SpawnPoint })
        }

        if (MAP_SPAWN_GROUPS === 1) {
            map.set(`${MAP_SIZE / 2}-${MAP_SIZE / 2}`, { type: MapBiome.Lootbox })
        } else if (MAP_SPAWN_GROUPS === 4) {
            // lootbox in middle of each group
            const [xOffset, yOffset] =
                group === 0 ? [-MAP_SPAWN_GROUPS_OFFSET, MAP_SPAWN_GROUPS_OFFSET]
                    : group === 1 ? [MAP_SPAWN_GROUPS_OFFSET, -MAP_SPAWN_GROUPS_OFFSET]
                        : group === 2 ? [-MAP_SPAWN_GROUPS_OFFSET, -MAP_SPAWN_GROUPS_OFFSET]
                            : group === 3 ? [MAP_SPAWN_GROUPS_OFFSET, MAP_SPAWN_GROUPS_OFFSET]
                                : [0, 0]

            map.set(`${MAP_SIZE / 2 + xOffset}-${MAP_SIZE / 2 + yOffset}`, { type: MapBiome.Lootbox })
        }

    }

    return map
}

/** Function to create a circle and give out coordinates */
export function* makeCircleCords(size = 100, R = 50, ring = false, centerCord?: [number, number]): Generator<[number, number]> {
    // logic from https://gist.github.com/shalithasuranga/0ca72ad75047f00f654e295e70a61911
    const [centerX, centerY] = centerCord ?? [size / 2, size / 2];

    for (const x of range(size)) {
        for (const y of range(size)) {
            const dx = Math.pow(x - centerX, 2);
            const dy = Math.pow(y - centerY, 2);
            const d = Math.sqrt(dx + dy);

            // ring is just the outside of circle and not filled in
            if ((ring && Math.round(d) === R) || (!ring && d <= R)) {
                yield [x, y];
            }
        }
    }
}


/** Turns a map into a printable visualization */
export function printMap(map: GameMap, mapConfig: MapBiomeConfig, highlight?: [number, number]) {
    const [maxX, maxY] = mapSize(map.map)
    let msg = ''

    for (const x of range({ start: 1, end: maxX + 1 })) {
        let line = ''
        for (const y of range({ start: 1, end: maxY + 1 })) {
            // get the actual entry here
            const entry = map.map.get(`${x}-${y}`)
            let emoji = entry?.type !== undefined ? mapConfig[entry.type] : "  "
            if (entry?.player) {
                emoji = entry.player.hp.toString()
            }

            // add background colors 
            if ((highlight?.[0] === x || highlight?.[1] === y)) emoji = pc.bgYellow(emoji)
            if ((entry?.redZone || Infinity) <= map.turn) emoji = pc.bgRed(emoji)
            if (entry?.redZone) emoji = pc.bgMagenta(emoji)
            
            process.stdout.write(emoji)
            line += `${emoji}`
        }

        process.stdout.write('\n')
        msg += line + '\n'
    }

    // return 
    return ''

}
