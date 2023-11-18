import Person from "../people.js"
import Player from "./player.js"
import Game from "../game.js"
import { printMap, makeCircleCords, makeMap } from "./map-utils.js"
import assert from "assert/strict";
import { MapBiome, MapCord, MapTile, TurnAction } from "./map-types.js";
import { getSmartMove } from "./find-moves.js";
import { MAP_SIZE, mapConfig } from "../constants.js";
import District from "../districts.js";

export class GameMap {
    readonly map: Map<MapCord, MapTile>
    readonly players: Player[] = []
    readonly game: Game
    turn = 0
    gameOver = false

    constructor(players: Person[], game: Game) {
        this.game = game
        this.map = makeMap()

        const mapEntries = [...this.map.entries()]
        const spawnPoints = mapEntries
            .filter(([location, content]) => content.type === MapBiome.SpawnPoint)
            .sort(() => Math.random() - 0.5);

        for (const person of players) {
            if (!person) continue

            const spawnPoint = spawnPoints.pop()
            assert(spawnPoint, "Should have spawn point to use")

            // add the player to the map (in spawn point)
            const location = spawnPoint[0].split('-').map(n => parseInt(n)) as [number, number]
            const player = new Player(person, this, location)
            this.players.push(player)
        }
    }

    start() {
        while (!this.gameOver) {
            this.newTurn()
        }

        // get the best players in each district
        const bestPlayers = this.players.sort((a, b) => (a.diedAtTurn ?? Infinity) - (b.diedAtTurn ?? Infinity))
        const districtsMentioned = [] as District[]
        const bestPlayerss = [] as Player[]

        for (const player of bestPlayers) {
            if (player.person.diedAt === null) continue
            if (districtsMentioned.includes(player.person.district)) continue
            districtsMentioned.push(player.person.district)
            bestPlayerss.push(player)
        }

        // get the best player in each district
        for (const district of this.game.districts) {
            // save the best player's stats
            const bestPlayer = bestPlayerss.filter(p => p.person.district === district)[0]
            district.currentTurnActionWeightings = bestPlayer?.preferTurnAction

            // add pos
            this.game.learboards.push({
                district: district.type,
                position: bestPlayerss.indexOf(bestPlayer) + 1,
                year: this.game.year
            })
        }
    }

    newTurn() {

        // kill those who are in read zone
        for (const tile of this.map.values()) {
            if (tile.redZone && tile.redZone <= this.turn && tile.player) {
                if (!tile.player.person.alive) continue
                tile.player.hp = 0
                tile.player.kill()
            }
        }

        // make border smaller by 5 every 15th turn (starting from 100)
        if (this.turn > 100 && (this.turn % 15) === 0) {
            const size = (MAP_SIZE - (this.turn - 95))

            const goodTiles = [...makeCircleCords(MAP_SIZE, (size / 2))]
            for (const location of this.map.keys()) {
                const [x, y] = location.split('-').map(Number)

                const tile = this.getTile(x, y)
                if (!tile) continue

                if (goodTiles.find(([goodX, goodY]) => goodX === x && goodY === y)) continue
                this.setTile(x, y, { redZone: Math.min((tile.redZone ?? Infinity), this.turn + 10) })
            }
        }



        for (const player of this.players) {
            if (player.person.diedAt !== null) {
                continue
            }

            // get the move
            const move = getSmartMove(this, player)

            // if indecisive, just do nothing
            if (!move) continue

            // choose a move and action it
            if (move.action === TurnAction.Fight) {
                player.fight(move.location.tile.player!, 10)
            } else if (move.action === TurnAction.Loot) {
                move.location.tile.type = MapBiome.Plain
                // gives the loot to player
                player.hp = 150
            } else if (move.action === TurnAction.Hide) {
                // they hid
                player.hp += 10
            } else {
                player.move(...move.location.cords)
            }

        }


        // print the map if requested
        if (process.argv.includes('--print-map')) {
            // console.clear();
            printMap(this, mapConfig, [this.game.year, this.turn % MAP_SIZE])
            // @ts-ignore Web app doesn't like this
            Bun.sleepSync(2500)
            console.log('\n\n\n\n\n')
        } else if (process.argv.includes('--debug-map')) {
            console.clear()
            console.log(`Year: ${this.game.year}, Turn: ${this.turn}`)
        }

        this.turn += 1;
        if (!this.players.some(p => p.person.alive)) {
            console.log(`${this.game.year}: A game over in ${this.turn} turns`)
            this.gameOver = true
        }

    }

    getTile(x: number, y: number, required?: true): MapTile
    getTile(x: number, y: number, required: false): MapTile | undefined
    getTile(x: number, y: number, required = true) {
        const tile = this.map.get(`${x}-${y}`)
        if (!tile && required) {
            console.log(printMap(this, mapConfig, [x, y]))
        }

        if (required) assert(tile, `Tile (${x}, ${y}) is not a valid tile`)
        return tile
    }

    setTile(x: number, y: number, data: Partial<MapTile>) {
        const d = this.getTile(x, y)

        this.map.set(`${x}-${y}`, { ...d, ...data })
    }

}

