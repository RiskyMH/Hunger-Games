import { GameMap } from "./map.js";
import Player from "./player.js";
import { makeCircleCords } from "./map-utils.js";
import { MAP_SIZE } from "../constants.js";
import { MapBiome, MapTile, MovementChoice } from "./map-types.js";
import { getCordAfterMove, howAdjacent } from "./find-moves.js";


/** Only gives the minimap for a certain radius */
function getProximityMap(map: GameMap, coordinates: [number, number], radius: number) {
    const circleCords = makeCircleCords(MAP_SIZE, radius, false, coordinates)

    const tiles: { x: number, y: number, tile: MapTile }[] = []
    for (const [x, y] of circleCords) {
        const tile = map.getTile(x, y, false)
        if (tile) tiles.push({ x, y, tile })

    }

    return tiles
}

/** Small pathfinding for close proximity and returns weightings */
export function pathfindingToClosestPlayer(map: GameMap, player: Player) {
    // check if currently in red zone, if so to go center
    if (player.currentTile.redZone) {
        const action = getBestDirection(map, player.location, [MAP_SIZE / 2, MAP_SIZE / 2])
        return action
    }


    // the only tiles that are going to be worked with in this function
    const tiles = getProximityMap(map, player.location, 3)

    const playerTiles = tiles
        .filter(({ tile }) =>
            tile.player?.person.district.type !== player.person.district.type
            && tile.player?.person.alive
        )
        .sort((tileA, tileB) => {
            const proximityA = howAdjacent(player.location, [tileA.x, tileA.y])
            const proximityB = howAdjacent(player.location, [tileB.x, tileB.y])
            const proximityComparison = proximityA - proximityB;
            const hpComparison = (tileA.tile.player?.hp ?? 0) - (tileB.tile.player?.hp ?? 0);

            return proximityComparison || hpComparison;
        });

    if (!playerTiles.length) return null

    // do through all the tiles and find the best one
    while (playerTiles.length) {

        const suggestedTile = playerTiles.shift()
        if (!suggestedTile) continue

        const action = getBestDirection(map, player.location, [suggestedTile.x, suggestedTile.y])
        if (!action) continue

        const moveCord = getCordAfterMove(player, action)
        const theTile = map.getTile(...moveCord, false)
        // if (!theTile || (theTile.player !== suggestedTile.tile.player && theTile.player !== null)) continue
        if (!theTile) continue
        if (theTile.player !== suggestedTile.tile.player && theTile.player) continue
        if (theTile.player && theTile.player?.person.district === suggestedTile.tile.player?.person.district) continue

        return action
    }

    return null
}

/** Find the best direction to get to a place */
export function getBestDirection(map: GameMap, current: [number, number], target: [number, number]): MovementChoice | null {
    const directions = [
        MovementChoice.Up,
        MovementChoice.Down,
        MovementChoice.Left,
        MovementChoice.Right
    ].sort(() => Math.random() - 0.5)

    let bestDirection: MovementChoice | null = null;
    let minDistance = Infinity;

    for (let direction of directions) {
        let newCoordinate: [number, number];
        let distance: number;

        switch (direction) {
            case MovementChoice.Up:
                newCoordinate = [current[0], current[1] - 1];
                break;
            case MovementChoice.Down:
                newCoordinate = [current[0], current[1] + 1];
                break;
            case MovementChoice.Left:
                newCoordinate = [current[0] - 1, current[1]];
                break;
            case MovementChoice.Right:
                newCoordinate = [current[0] + 1, current[1]];
                break;
            default:
                throw new Error("Invalid direction");
        }

        const tile = map.getTile(...newCoordinate, false)
        if (tile && !tile.player) {
            distance = Math.abs(newCoordinate[0] - target[0]) + Math.abs(newCoordinate[1] - target[1]);
            if (distance < minDistance) {
                minDistance = distance;
                bestDirection = direction;
            }
        }
    }

    return bestDirection;
}

/** Get best direction to lootbox - there are 4 lootboxes */
export function pathfindToPoint(map: GameMap, player: Player): MovementChoice | null {

    const lootBoxes = [...map.map.entries()]
        .filter(e => e[1].type === MapBiome.Lootbox)
        .map(e => {
            const [x, y] = e[0].split('-').map(n => parseInt(n)) as [number, number]
            return { x, y }
        })

    // find closest
    const closestLootBox = lootBoxes.sort((a, b) => {
        const proximityA = howAdjacent(player.location, [a.x, a.y])
        const proximityB = howAdjacent(player.location, [b.x, b.y])
        return proximityA - proximityB
    })[0]

    if (!closestLootBox) return null

    const action = getBestDirection(map, player.location, [closestLootBox.x, closestLootBox.y])
    return action

}

