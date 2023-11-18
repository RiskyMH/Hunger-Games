import { GameMap } from "./map.js";
import Player from "./player.js";
import { MapTile, MovementChoice, TurnAction } from "./map-types.js";
import { pathfindingToClosestPlayer, pathfindToPoint } from "./pathfinding.js";



/** Get a random move with no actual smarts */
export function getRandomMove(map: GameMap, player: Player) {
    const validMoves = findValidMoves(map, player)
    return validMoves[Math.floor(Math.random() * validMoves.length)]
}

/** Use the player's weightings and choose action (and still use random) */
export function getSmartMove(map: GameMap, player: Player) {
    let move: MovementChoice | null = null

    // decide the action
    if (Math.random() <= (player.preferTurnAction[TurnAction.Fight] / 100) * 6.5) {
        // decide to fight
        move = pathfindingToClosestPlayer(map, player)

    } else if (Math.random() <= (player.preferTurnAction[TurnAction.Move] / 10) * 6.5) {
        // maybe move to random tile
        return getRandomMove(map, player)
    } else if (Math.random() <= (player.preferTurnAction[TurnAction.Hide] / 10) * 6.5) {
        // or possibly decide to hide
        return {
            choice: MovementChoice.None,
            action: TurnAction.Hide,
            location: {
                cords: player.location,
                tile: player.currentTile
            }
        }
    } else if (Math.random() <= (player.preferTurnAction[TurnAction.Loot] / 100) * 6.5) {
        // or possibly decide to loot
        move = pathfindToPoint(map, player)
    }

    // if no move, just do a random move
    if (!move) return getRandomMove(map, player)

    // get the tile that is proposed to move into
    const cord = getCordAfterMove(player, move)
    const tile = map.getTile(...cord, false)
    if (!tile) return getRandomMove(map, player)

    // some edge cases when it somehow bypasses from pathfinder, so just do a random move
    if (tile.player?.person.district === player.person.district) return getRandomMove(map, player)
    if (tile.player?.hp !== 0 && !tile.player?.person.alive) return getRandomMove(map, player)

    // return the move data
    return {
        choice: move,
        action: tile.player ? TurnAction.Fight : TurnAction.Move,
        fight: tile.player,
        location: {
            cords: cord,
            tile
        }
    }

}

/** Respect the map and fighting decision, but just randomly decide on action later */
export default function findValidMoves(map: GameMap, player: Player, allowFighting = false) {
    const moves = [
        MovementChoice.Up,
        MovementChoice.Down,
        MovementChoice.Left,
        MovementChoice.Right
    ]

    const validMoves: {
        choice: MovementChoice,
        action: TurnAction,
        fight?: Player,
        location: {
            cords: [number, number],
            tile: MapTile
        }
    }[] = []

    // see if any player is already there
    for (const move of moves) {
        const tileCord = getCordAfterMove(player, move)
        const tile = map.map.get(`${tileCord[0]}-${tileCord[1]}`)

        // if the tile doesn't exist, don't bother going there
        if (!tile) {
            continue
        }

        if (tile.player) {
            if (!allowFighting) {
                continue
            }

            if (tile.player.person.district === player.person.district) {
                continue
            }

            // really make sure it is a valid fight and ajacent
            const testValid = isValidFight(player, tile.player)
            if (!testValid.valid) {
                console.log("not valid location to actually fight")
                continue
            }

            // if the player is dead, don't bother
            if (tile.player.hp === 0 || !tile.player.person.alive) {
                continue
            }

            // push the valid move to list
            validMoves.push({
                choice: move,
                action: TurnAction.Fight,
                fight: tile.player,
                location: {
                    cords: tileCord,
                    tile
                }
            })
        } else {
            // they don't want to fight so just move
            validMoves.push({
                choice: move,
                action: TurnAction.Move,
                location: {
                    cords: tileCord,
                    tile
                }
            })
        }

    }

    return validMoves

}

/** Uses the movement choices and works out the new coordinate  */
export function getCordAfterMove(player: Player, choice: MovementChoice) {
    const newCords = structuredClone(player.location)
    switch (choice) {
        case MovementChoice.Up:
            newCords[0] -= 1
            break;
        case MovementChoice.Down:
            newCords[0] += 1
            break;
        case MovementChoice.Left:
            newCords[1] -= 1
            break;
        case MovementChoice.Right:
            newCords[1] += 1
            break;
        case MovementChoice.None:
            break;
        default:
            choice satisfies never
            throw new Error("not a move")
    }
    return newCords
}

/** Work out how many turns it will take to get to a certain coordinate */
export function howAdjacent(coordinateA: [number, number], coordinateB: [number, number]): number {
    let xDistance = Math.abs(coordinateA[0] - coordinateB[0]);
    let yDistance = Math.abs(coordinateA[1] - coordinateB[1]);

    // Check if coordinates are the same
    if (coordinateA[0] === coordinateB[0] && coordinateA[1] === coordinateB[1]) {
        return 0;
    }
    // Check if coordinates are adjacent (up/down/left/right)
    else if (xDistance === 1 && yDistance === 0 || xDistance === 0 && yDistance === 1) {
        return 1;
    }
    // Check if coordinates are diagonal
    else if (xDistance === 1 && yDistance === 1) {
        return 2;
    }
    // If more distance, return the length
    else {
        return Math.sqrt(xDistance ** 2 + yDistance ** 2);
    }
}

/** Checks if the player is adjacent because fighting is only that */
export function isValidFight(fighter: Player, opponent: Player) {

    const [thisX, thisY] = fighter.location
    const [fightX, fightY] = opponent.location

    const isUp = (thisX - 1 === fightX) && (thisY === fightY)
    const isDown = (thisX + 1 === fightX) && (thisY === fightY)
    const isLeft = (thisX === fightX) && (thisY - 1 === fightY)
    const isRight = (thisX === fightX) && (thisY + 1 === fightY)

    return { isUp, isDown, isLeft, isRight, valid: isUp || isDown || isLeft || isRight }

}