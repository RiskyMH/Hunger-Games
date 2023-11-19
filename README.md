<h1 align="center">
  <img src="./apps/visualization/app/icon.png" width="84">
  <br>
  Hunger Games
</h1>

<p align="center">A simulation of a game with random fighting like Hunger Games</p>

> **Note:** I made this for a school assignment, but decided to put it here because it was cool enough :)

## How to run

1. Install bun: <https://bun.sh/>
   * can be inside wsl
2. Install dependencies: `bun install`
3. Run game `bun run start:game`
   * `bun run start:game --print-map` can print the map to the console
4. Build website `bun run build:website`
5. Go to `./apps/visualization/out` to use the static html

## How it works

### [The game](./apps/game)

This is the effectively a way dumber down version of Hunger Games, but this is trying to just let the computer use random to fight in an arena. I had intended for this to be more amazing but ran out of time to actually implement cool things.

**General Info:**

* Make large amount of people for all 12 districts
* Get some people to fight in district
  * Currently 10 per district (and at min ~25% split of sex)
* Make it turn based
* Players can move in grid to fight or hide
* Map kind of inspired by civilisation games

**The Map:**

* Turns go until only one district is remaining
* Can do many actions (will discuss below)
* Player’s move around the board doing their action
* Point of game is to eliminate all other players (as long as they are not your teammate)

**The Actions:**

* **Move** is for going to random place without player
* **Fight** is finding the closest player with least health
* **Nothing** shouldn’t be used
* **Hide** makes it harder for other players to see them – lower chance of  going on that tile (for both fight or move)
* **Loot** is finding lootbox

**_"Genetic Algorithm":_**

* This works by finding the best player for each district and “copying” its stat
* The next year’s players uses that but +/- a bit
* Every year the amount of change is reduced
And thus the players learn from previous participants

*Can view latest simulation: <https://github.com/RiskyMH/Hunger-Games/actions/workflows/action.yml>*

### [The visualization](./apps/visualization)

**Shows some data from the game:**

* Age distribution grouped by district
* The 4 changeable actions on columns coloured by districts
* Population per year by district – population/deaths/births
* The top person leaderboard for all years (ie 11th)

*Can view the latest graphs: <https://riskymh.github.io/Hunger-Games/>*

## Future goals

* Try and make this an actually playable game and not just a simulation
* Add items to make the game more interesting (ie bow and arrow)
* Give districts their own unique bonuses
