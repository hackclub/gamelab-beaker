// import { init } from "../engine/gamelab_functions.js";

// const canvas = document.querySelector(".minimal");

const {
  setScreenSize,
  setLegend, 
  setMap, 
  getCell,
  addTile, 
  clearTile, 
  setSolids,
  setPushables, 
  replace, 
  onInput,
  afterInput, 
  getGrid,
  getAllTiles, 
  clear, 
  setZOrder, 
  sprite,
  swap,
  match,
  setBackground,
  getTile
} = require("./engine.js");

setLegend({
  "p": sprite(`
................
................
.......0000.....
.......0ggg0....
......0ggggg0...
......0gggbgr...
......0gggggrr..
.......0gggg0...
..00000ggggg0...
..0ggggggggg0...
..0ggggggggg0...
...0ggggggg0....
....0ggggg00....
.....00000......
......00.00.....
................

    `),
  "w": sprite("b"),
  "b": sprite("0"),
  "*": sprite("r"),
  "#": sprite(`
................
................
................
......rrrrr.....
.....rrrrrrr....
....rrrrrrrrr...
....rrrrrrrrr...
....rrrrrrrrr...
....rrrrrrrrr...
....rrrrrrrrr...
....rrrrrrrrr...
.....rrrrrrr....
......rrrrr.....
................
................
................
    `),
    "g": sprite(`
................
................
................
......ggggg.....
.....ggggggg....
....ggggggggg...
....ggggggggg...
....ggggggggg...
....ggggggggg...
....ggggggggg...
....ggggggggg...
.....ggggggg....
......ggggg.....
................
................
................
    `)
})

// setBackground("w")

let level = 0;
const levels = [
`
bbbbbbbbbb
bp.b.....b
b..b.....b
b..b.#b..b
b.....b.gb
bbbbbbbbbb
`,
`
bbbbbbbbbb
bp......gb
b....b...b
b.b#bg.#.b
b......b.b
bbbbbbbbbb
`,
`
bbbbbbbbbb
b........b
b........b
b........b
b........b
bbbbbbbbbb
`
];

setSolids(["p", "b", "#"])

setZOrder(["d", "b","g", "r"])

setPushables({ "p": ["#"] })

setMap(levels[level]);

let countMatches;
onInput("up",      _ => getTile("p").y -= 1);
onInput("down",    _ => getTile("p").y += 1);
onInput("left",    _ => getTile("p").x -= 1);
onInput("right",   _ => getTile("p").x += 1);

afterInput(_ => {

  // this pattern could be improved
  countMatches = swap(["#", "g"], "*");
  swap("*", ["#", "g"]);

  if (countMatches === match("g").length)
    setMap(levels[++level]);
});