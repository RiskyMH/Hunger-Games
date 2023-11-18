import Game from "./game.js";
import { resolve } from "path";
import { mkdirSync } from "fs"

console.time("Init game")
const game = new Game();
console.timeEnd("Init game")
game.start();

// export data and save it as data.json (in public folder of website)
const data = JSON.stringify(game.export());

// get locations
const path1 = resolve(import.meta.path, "../../../visualization/public/data.json");
const path2 = resolve(import.meta.path, "../../../visualization/out/data.json");
mkdirSync(resolve(import.meta.path, "../../../visualization/out/"), { recursive: true })

// save data
await Bun.write(path1, data)
await Bun.write(path2, data)
