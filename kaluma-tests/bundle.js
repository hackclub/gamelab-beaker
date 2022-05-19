/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const { GPIO } = __webpack_require__(2);
const { ST7735 } = __webpack_require__(3);
const st7735 = new ST7735();

let width = 0, height = 0;
let legend = {};
let img = { data: new Uint8Array(0), width: 0, height: 0 };
let currentLevel = [];
let maxTileDim;
let zOrder = [];
let solids = [];
let pushable = {};
let afterInputFn = () => {};
function clear() { currentLevel = []; }

exports.afterInput = fn => afterInputFn = fn;
exports.setSolids = arr => solids = arr;
exports.setZOrder = arr => zOrder = arr;
exports.setPushables = obj => pushable = obj;

const getGrid = exports.getGrid = () => {
	const overlaps = {};
	const tiles = currentLevel.map(tile => [ `${tile.x},${tile.y}`, tile ]);
	tiles.forEach( tile => {
		const [ key, data ] = tile;
		if (key in overlaps) overlaps[key].push(data);
		else overlaps[key] = [data];
	});

	return overlaps;
}

const canMoveToPush = (tile, dx, dy) => {
	const grid = getGrid();
	const { x, y, type } = tile;
	const cellKey = `${x+dx},${y+dy}`;

	const notSolid = !solids.includes(type);
	const noMovement = dx === 0 && dy === 0;
	const movingToEmpty = !grid[cellKey];

	if (notSolid || noMovement || movingToEmpty) {
		tile._x += dx;
		tile._y += dy;
		return true;
	}

	let canMove = true;

	grid[cellKey].forEach(cell => {
		const isSolid = solids.includes(cell.type);
		const isPushable = (type in pushable) && pushable[type].includes(cell.type);

		if (isSolid && !isPushable)
                    canMove = false;

		if (isSolid && isPushable) {
			canMove = canMove && canMoveToPush(cell, dx, dy);
		}
	})

	if (canMove) {
		tile._x += dx;
		tile._y += dy;
	}

	return canMove;
}

const swap = exports.swap = (arr, newTypes) => { // swap could do multiple
	if (typeof arr === "string") arr = [ arr ];
	if (typeof newTypes === "string") newTypes = [ newTypes ];

	const grid = getGrid();

	let matched = false;
	let length = 0;

	Object.keys(grid).forEach(k => {
		const cell = grid[k];
		const typesInCell = cell.map(tile => tile.type);

		const matches = [];

		arr.forEach(t => {
			const index = typesInCell.indexOf(t);
			if (index !== -1 && !matches.includes(index)) {
				matches.push(index);
			} 
		});

		if (matches.length === arr.length) {
			matches.forEach(i => cell[i].remove());
			const [ x, y ] = k.split(",").map(Number);

			newTypes.forEach(t => addTile(x, y, t));

			matched = true;
			length++;
		}
	})

	return length;
}

class Tile {
	constructor(x, y, type) {
		this._type = null;
		this.type = type;
		this._x = x;
		this._y = y;
		this.dx = 0;
		this.dy = 0;
	}

	set type(t) {
		if (t === ".") t.remove(); // hmm

		this._type = t;
		this.img = (t in legend) ? legend[t] : defaultSprite;
	}

	get type() {
		return this._type;
	}

	set x(newX) {
		const dx = newX - this.x;
		if (canMoveToPush(this, dx, 0)) this.dx = dx;
		return this;
	}

	get x() {
		return this._x;
	}

	set y(newY) {
		const dy = newY - this.y;
		if (canMoveToPush(this, 0, dy)) this.dy = dy;
		return this;
	}

	get y() {
		return this._y;
	}

	remove() {
		currentLevel = currentLevel.filter(t => t !== this);

		return this;
	}

}

exports.getTile = type => currentLevel.find(t => t.type === type), // **
exports.getAllTiles = type => currentLevel.filter(t => t.type === type); // **

const addTile = exports.addTile = (x, y, type) => { // could take array
	// if (type === ".") 

	const tile = new Tile(x, y, type);
	currentLevel.push(tile);

	return tile;
};


const dpad = {
  up:      { last: 0, pin: new GPIO(0, INPUT_PULLUP) },
  down:    { last: 0, pin: new GPIO(3, INPUT_PULLUP) },
  left:    { last: 0, pin: new GPIO(2, INPUT_PULLUP) },
  right:   { last: 0, pin: new GPIO(1, INPUT_PULLUP) },
  action0: { last: 0, pin: new GPIO(4, INPUT_PULLUP) },
  action1: { last: 0, pin: new GPIO(5, INPUT_PULLUP) },
};
exports.onInput = function onInput(key, handler) {
	if (!dpad[key]) throw new Error(
		`expected one of "up", "down", "left", or "right", found ${key}`
	);
	dpad[key].handler = handler;
}

const spi = board.spi(1, {
  sck: 10,
  mosi: 11,
  baudrate: 30000000 // default: 3000000
});

st7735.setup(spi, { // ST7735R 1.8"
  width: 128,
  height: 160,
  xstart: 0,
  ystart: 0,
  dc: 16,
  rst: 17,
  cs: 18
});
const gc = st7735.getContext("buffer");

class ImageData {
	constructor(pixels, w, h) {
		this.width = w;
		this.height = h;
		const bytes = new Uint8Array(w*h*2);
		for (let x = 0; x < w; x++)
			for (let y = 0; y < h; y++) {
				let i = (y*w + x);
				const [r, g, b, a] = pixels.slice(i*4, (i + 1)*4);
				if (a < 255) continue;
				const col = gc.color16(Math.max(b, 5),
									   Math.max(g, 5),
									   Math.max(r, 5));
				bytes[i*2+0] = col >> 8;
				bytes[i*2+1] = col;
			}
		this.data = new Uint16Array(bytes.buffer);
	}
}

const fillImage = (function(x, y, w, h, buf) {
  digitalWrite(this.cs, LOW); // select
  this.cmd(0x2A, [0, x + this.xstart, 0, x + w - 1 + this.xstart]); // column addr set
  this.cmd(0x2B, [0, y + this.ystart, 0, y + h - 1 + this.ystart]); // row addr set
  this.cmd(0x2C); // write to RAM
  this.spi.send(buf);
  digitalWrite(this.cs, HIGH); // deselect
}).bind(st7735);

(() => {
    const width = 128, height = 160;
    const screen = new Uint16Array(width * height);
    const { rfill, sprdraw } = global.require("native");
    setInterval(() => {
            for (const [name, btn] of Object.entries(dpad)) {
                    const { pin, handler } = btn;
                    const now = pin.read();
                    if (handler && btn.last != now && !(btn.last = now))
                            handler();
            }
            afterInputFn();

            rfill(screen, gc.color16(255, 255, 255), width*height);

        currentLevel
          .sort((a, b) => zOrder.indexOf(b.type) - zOrder.indexOf(a.type))
          .forEach(tile => {

                    sprdraw(tile.img.data, tile.img.width, tile.img.height,
                            screen, tile.y*16, tile.x*16);
          });

            fillImage(0, 0, width, height, new Uint8Array(screen.buffer));
    }, 1000/20);
})();

const allEqual = arr => arr.every(val => val === arr[0]);
exports.sprite = function sprite(string) { // returns image data
	const rows = string.trim().split("\n").map(x => x.trim());
	const rowLengths = rows.map(x => x.length);
	const isRect = allEqual(rowLengths);
	if (!isRect) console.error("Level must be rect.");
	const width = rows[0].length;
	const height = rows.length;
	const data = new Uint8ClampedArray(16*16*4);

	const colors = {
		"0": [0, 0, 0, 255],
		"1": [255, 255, 255, 255],
		"r": [255, 0, 0, 255],
		"g": [0, 255, 0, 255],
		"b": [0, 0, 255, 255],
		".": [0, 0, 0, 0],
	}

	const chars = string.split("").filter(x => x.match(/\S/));
	for (let i = 0; i < 16*16; i++) {
		const type = chars[i % (width*height)];

		if (!(type in colors)) console.error("unknown color:", type);

		const [ r, g, b, a ] = colors[type];
		data[i*4] = r;
		data[i*4 + 1] = g;
		data[i*4 + 2] = b;
		data[i*4 + 3] = a;
	}

	const result = new ImageData(data, 16, 16);

	return img = result;
};

function parsePattern(string) {
    const parsedPattern = [];
    const rows = string.trim().split("\n").map(x => x.trim());
    const rowLengths = rows.map(x => x.length);
    const isRect = allEqual(rowLengths)
    if (!isRect) console.error("pattern must be rectangle");
    const w = rows[0].length;
    const h = rows.length;

    for (let i = 0; i < w*h; i++) {
        const type = string.split("").filter(x => x.match(/\S/))[i];
        parsedPattern.push(type)
    }

    const result = { width: w, height: h, pattern: parsedPattern };

    return result;
}

function matchPattern(patternData, testMap = {}) {
    const { width: w, height: h, pattern } = patternData;

    const grid = getGrid();

    // if no cell with key then cell empty
    for (let i = 0; i < width*height; i++) {
        const x = i%width; 
        const y = Math.floor(i/width); 
        const key = `${x},${y}`;


        if (!grid[key]) grid[key] = [{ x, y, type: "." }];
    }

    let allMatches = [];

    for (let i = 0; i < width*height; i++) {
      const x = i%width; 
      const y = Math.floor(i/width); 

      if (x + w > width || y + h > height) continue;
      
      let match = true;
      let matches = [];
      for (let j = 0; j < w*h; j++) {
        const dx = j%w; 
        const dy = Math.floor(j/w);
        const type = pattern[j];
        const key = `${x+dx},${y+dy}`;
        
        let testFn;
        if (type in testMap) {
          const val = testMap[type];
          if (Array.isArray(val)) testFn = t => val.includes(t.type);
          if (typeof val === "function") testFn = val
        }

        let matchValue = (testFn)
            ? grid[key].find(testFn) // could take whole tile or tile type
            : grid[key].find(t => t.type === type)

        match = match && matchValue !== undefined;

        matches.push(matchValue);
      }

      if (match) {
        // if match doesn't have overlap with existing matches
        const overlap = matches.some(t => allMatches.flat().includes(t));
        if (!overlap) allMatches.push(matches);
      }
    }

    return allMatches;
}

exports.match = function match(pattern, testMap = {}) {
    const p = parsePattern(pattern);
    const matches = matchPattern(p, testMap);
    return matches;
};

const setScreenSize = exports.setScreenSize = function() {}
exports.setLegend = function setLegend(newLegend) { legend = newLegend; }
exports.setMap = function setMap(string) { // could have background and sprites
	// check that level is rectangle

	clear();

	const rows = string.trim().split("\n").map(x => x.trim());
	const rowLengths = rows.map(x => x.length);
	const isRect = allEqual(rowLengths)
		if (!isRect) console.error("Level must be rect.");
	const w = rows[0].length;
	const h = rows.length;
	width = w;
	height = h;

	// scale the ctx based on aspect ratio of level
	// tiles should always be square
	// find max tile width to fit

	maxTileDim = Math.min(width/w, height/h);

	// should this adjust screen size?
	setScreenSize(w*maxTileDim, h*maxTileDim);

	const chars = string.split("").filter(x => x.match(/\S/));
	for (let i = 0; i < w*h; i++) {
		const type = chars[i];

		if (type === ".") continue;

		const x = i%w; 
		const y = Math.floor(i/w); 
		const newTile = new Tile(x, y, type);
		currentLevel.push(newTile)
	}

	return currentLevel;
}


/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("gpio");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var graphics = __webpack_require__(4);

/**
 * ST7735 class
 */
class ST7735 {
  /**
   * Setup ST7735 for SPI connection
   * @param {SPI} spi
   * @param {Object} options
   *   .width {number=128}
   *   .height {number=128}
   *   .dc {number=-1}
   *   .rst {number=-1}
   *   .cs {number=-1}
   *   .rotation {number=0}
   */
  setup (spi, options) {
    this.spi = spi;
    options = Object.assign({
      width: 128,
      height: 128,
      dc: -1,
      rst: -1,
      cs: -1,
      rotation: 0,
      xstart: 2,
      ystart: 3,
    }, this.init, options);
    this.width = options.width;
    this.height = options.height;
    this.dc = options.dc;
    this.rst = options.rst;
    this.cs = options.cs;
    this.rotation = options.rotation;
    this.xstart = options.xstart;
    this.ystart = options.ystart;
    this.context = null;
    if (this.dc > -1) pinMode(this.dc, OUTPUT);
    if (this.rst > -1) pinMode(this.rst, OUTPUT);
    if (this.cs > -1) pinMode(this.cs, OUTPUT);
    // reset
    digitalWrite(this.cs, HIGH);
    digitalWrite(this.rst, LOW);
    delay(10);
    digitalWrite(this.rst, HIGH);
    delay(10);
    digitalWrite(this.cs, LOW);
    this.initR();
  }

  initR () {
    this.cmd(0x01);                         // Software reset
    delay(150);
    this.cmd(0x11);                       // Out of sleep mode
    delay(500);
    // 1st commands
    this.cmd(0xB1, [0x01, 0x2C, 0x2D]); // Framerate ctrl (normal mode): rate = fosc/(1x2+40) * (LINE+2C+2D)
    this.cmd(0xB2, [0x01, 0x2C, 0x2D]); // Framerate ctrl (idle mode): rate = fosc/(1x2+40) * (LINE+2C+2D)
    this.cmd(0xB3, [0x01, 0x2C, 0x2D, 0x01, 0x2C, 0x2D]); // Framerate ctrl (partial mode): [Dot inversion,,, Line inversion,,]
    this.cmd(0xB4, [0x07]);             // Display inversion ctrl: [No inversion]
    this.cmd(0xC0, [0xA2, 0x02, 0x84]); // Power ctrl: [-4.6V,, Auto mode]
    this.cmd(0xC1, [0xC5]);             // Power ctrl: [VGH25=2.4C VGSEL=-10 VGH=3 * AVDD]
    this.cmd(0xC2, [0x0A, 0x00]);       // Power ctrl: [Opamp current small, Boost frequency]
    this.cmd(0xC3, [0x8A, 0x2A]);       // Power ctrl: [BCLK/2, opamp current small & medium low]
    this.cmd(0xC4, [0x8A, 0xEE]);       // Power ctrl
    this.cmd(0xC5, [0x0E]);             // Power ctrl
    this.cmd(0x20);                     // Don't invert display
    this.cmd(0x36, [0xC8]);             // Mem access ctrl: [row/col addr bottom-top refresh]
    this.cmd(0x3A, [0x05]);             // Set color mode: [16-bit color]
    // 2nd commands (init based on display types)
    // Init 7735R
    this.cmd(0x2A, [0x00, 0x00, 0x00, this.width - 1]); // Column addr set: XSTART=0, XEND=width
    this.cmd(0x2B, [0x00, 0x00, 0x00, this.height - 1]); // Row addr set: YSTART=0, YEND=height
    // 3rd commands
    this.cmd(0xE0,             // Gamma adjustments (pos. polarity)
      [0x02, 0x1c, 0x07, 0x12,
       0x37, 0x32, 0x29, 0x2d,
       0x29, 0x25, 0x2B, 0x39,
       0x00, 0x01, 0x03, 0x10]); 
    this.cmd(0xE1,             // Gamma adjustments (neg. polarity)
      [0x03, 0x1d, 0x07, 0x06,
       0x2E, 0x2C, 0x29, 0x2D,
       0x2E, 0x2E, 0x37, 0x3F,
       0x00, 0x00, 0x02, 0x10]);
    this.cmd(0x13);            // Normal display on
    delay(10);
    this.cmd(0x29);          // Main screen turn on
    delay(100);
    // this.cmd(0x36, [0x40 | 0x80 | 0x08]); // Mem access ctrl: ST77XX_MADCTL_MX | ST77XX_MADCTL_MY | ST7735_MADCTL_BGR;
  }

  /**
   * Send command
   * @param {number} cmd
   * @param {Array<number>} data
   */
  cmd (cmd, data) {
    digitalWrite(this.dc, LOW); // command
    this.spi.send(new Uint8Array([cmd]));
    digitalWrite(this.dc, HIGH); // data
    if (data) this.spi.send(new Uint8Array(data));
  }
  
  /**
   * Get a graphic context
   * @param {string} type Type of graphic context.
   *     'buffer' or 'callback'. Default is 'callback'
   */
  getContext (type) {
	if (!this.context) {
      if (type === 'buffer') {
        this.context = new graphics.BufferedGraphicsContext(this.width, this.height, {
          rotation: this.rotation,
          bpp: 16,
          display: (buffer) => {
            digitalWrite(this.cs, LOW); // select
            this.cmd(0x2A, [0, this.xstart, 0, this.width - 1 + this.xstart]); // column addr set
            this.cmd(0x2B, [0, this.ystart, 0, this.height - 1 + this.ystart]); // row addr set
            this.cmd(0x2C, buffer); // write to RAM
            digitalWrite(this.cs, HIGH); // deselect
          }
        });
      } else { // 'callback'
        this.context = new graphics.GraphicsContext(this.width, this.height, {
          rotation: this.rotation,
          setPixel: (x, y, c) => {
            digitalWrite(this.cs, LOW); // select
            this.cmd(0x2A, [0, x + this.xstart, 0, x + 1 + this.xstart]); // column addr set
            this.cmd(0x2B, [0, y + this.ystart, 0, y + 1 + this.ystart]); // row addr set
            this.cmd(0x2C, [c>>8, c]); // write to RAM
            digitalWrite(this.cs, HIGH); // deselect
          },
          fillRect: (x, y, w, h, c) => {
            digitalWrite(this.cs, LOW); // select
            this.cmd(0x2A, [0, x + this.xstart, 0, x + w - 1 + this.xstart]); // column addr set
            this.cmd(0x2B, [0, y + this.ystart, 0, y + h - 1 + this.ystart]); // row addr set
            this.cmd(0x2C); // write to RAM
            this.spi.send(new Uint8Array([c>>8, c]), 5000, w * h);
            digitalWrite(this.cs, HIGH); // deselect
          }
        });
      }
    }
    return this.context;
  }
}

exports.ST7735 = ST7735;


/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";
module.exports = require("graphics");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
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
} = __webpack_require__(1);

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

})();

/******/ })()
;