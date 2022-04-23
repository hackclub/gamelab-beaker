/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var graphics = __webpack_require__(2);

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
/* 2 */
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
// echo ./index.js | entr -s "kaluma flash ./index.js --bundle"

const { ST7735 } = __webpack_require__(1);
const st7735 = new ST7735();

const A = 0;
const B = 3;
const UP = 13;
const DOWN = 12;
const LEFT = 11;
const RIGHT = 10;


// const a = pinMode(A, INPUT_PULLUP);
// pinMode(Input.B, INPUT_PULLUP);
// pinMode(Input.UP, INPUT_PULLUP);
// pinMode(Input.DOWN, INPUT_PULLUP);
// pinMode(Input.LEFT, INPUT_PULLUP);
// pinMode(Input.RIGHT, INPUT_PULLUP);

// var options = { // ST7735R 1.44"
//   dc: 21,
//   rst: 22,
//   cs: 24
// };

const led = pinMode(25, OUTPUT);

let size = 10;


digitalToggle(25)
// digitalWrite(25, LOW); // Set the pin 1 to HIGH.

pinMode(A, INPUT_PULLUP);

setWatch(
  function () {
    digitalToggle(25); // Set the pin 1 to HIGH.
    size += 10;
    // if (size === 80 || size === 0) delta *= -1;
  },
  A,
  FALLING,
  5
); 

var options = { // ST7735R 1.8"
  width: 128,
  height: 160,
  xstart: 0,
  ystart: 0,
  dc: 16,
  rst: 17,
  cs: 18
}

const spiOptions = {
  sck: 10,
  mosi: 11,
}

const spi = board.spi(1, spiOptions);

st7735.setup(spi, options);
const gc = st7735.getContext("buffer");

const color = gc.color16(255, 100, 255);


let delta = 5;
// setInterval(() => {
//   gc.fillScreen(color);
//   // gc.drawRect(0, 0, size, 160);
//   gc.drawCircle(128/2, 160/2, size);
//   gc.display();
// }, 10);


// gc.display(); // must call if buffered graphic context

})();

/******/ })()
;