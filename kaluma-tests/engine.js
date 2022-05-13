const { GPIO } = require("gpio");
const { ST7735 } = require('st7735');
const st7735 = new ST7735();

let legend = {};
let img = { data: new Uint8Array(0), width: 0, height: 0 };
let currentLevel = [];
let maxTileDim;
let zOrder = [];
function clear() { currentLevel = []; }

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

exports.getAll = function getAll(type) {
	return currentLevel.find(t => t.type === type);
}
exports.addTile = function addTile(x, y, type) { // could take array
	// if (type === ".") 

	const tile = new Tile(x, y, type);
	currentLevel.push(tile);

	return tile;
}


const dpad = {
  up:    { last: 0, pin: new GPIO(0, INPUT_PULLUP) },
  down:  { last: 0, pin: new GPIO(3, INPUT_PULLUP) },
  left:  { last: 0, pin: new GPIO(2, INPUT_PULLUP) },
  right: { last: 0, pin: new GPIO(1, INPUT_PULLUP) }
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
				const col = gc.color16(b, g+5, r);
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

	rfill(screen, gc.color16(255, 255, 255), width*height);

    currentLevel
      .sort((a, b) => zOrder.indexOf(b.type) - zOrder.indexOf(a.type))
      .forEach(tile => {

		sprdraw(tile.img.data, tile.img.width, tile.img.height,
		        screen, tile.x, tile.y);
      });

	fillImage(0, 0, width, height, new Uint8Array(screen.buffer));
}, 1000/20);

const allEqual = arr => arr.every(val => val === arr[0]);
exports.sprite = function sprite(string) { // returns image data
	const rows = string.trim().split("\n").map(x => x.trim());
	const rowLengths = rows.map(x => x.length);
	const isRect = allEqual(rowLengths);
	if (!isRect) console.error("Level must be rect.");
	const width = rows[0].length;
	const height = rows.length;
	const data = new Uint8ClampedArray(width*height*4);

	const colors = {
		"0": [0, 0, 0, 255],
		"1": [255, 255, 255, 255],
		"r": [255, 0, 0, 255],
		"g": [0, 255, 0, 255],
		"b": [0, 0, 255, 255],
		".": [0, 0, 0, 0],
	}

	const chars = string.split("").filter(x => x.match(/\S/));
	for (let i = 0; i < width*height; i++) {
		const type = chars[i];

		if (!(type in colors)) console.error("unknown color:", type);

		const [ r, g, b, a ] = colors[type];
		data[i*4] = r;
		data[i*4 + 1] = g;
		data[i*4 + 2] = b;
		data[i*4 + 3] = a;
	}

	const result = new ImageData(data, width, height);

	return img = result;
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
	// width = w;
	// height = h;

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
