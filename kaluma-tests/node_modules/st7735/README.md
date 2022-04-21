# Overview

Kaluma library for ST7735 (Color TFT LCD driver).

You can get displays from belows:
 
- [1.44" 128x128 (from Adafruit)](https://www.adafruit.com/product/2088)
- [1.8" 128x160 (from Adafruit)](https://www.adafruit.com/product/358)

# Wiring
 
Here is a wiring example for `SPI0`.

Raspberry Pi Pico | ST7735
------------ | -------------
3V3 | 3V3
GND | GND
GP19 (SPI0 TX) | DATA (MOSI)
GP18 (SPI0 CLK) | CLK
GP20 | D/C
GP21 | RST
GP17 | CS

![circuit](https://github.com/niklauslee/st7735/blob/main/images/circuit.jpg?raw=true)

# Install

```sh
npm i https://github.com/niklauslee/st7735
```

# Usage

You can initialize ST7735 driver using SPI interface as below:

```js
const {ST7735} = require('st7735');
const st7735 = new ST7735();

var options = { // ST7735R 1.44"
  dc: 20,
  rst: 21,
  cs: 17
};

/*
var options = { // ST7735R 1.8"
  width: 128,
  height: 160,
  xstart: 0,
  ystart: 0,
  dc: 20,
  rst: 21,
  cs: 17
}
*/

st7735.setup(board.spi(0), options);
const gc = st7735.getContext();
gc.drawRect(0, 0, width, height);
```

You can use `BufferedGraphicsContext` instead of general callback-based graphics context as below:
 
```js
// buffered graphic context
var gc = st7735.getContext('buffer');
gc.drawRect(0, 0, width, height);
gc.display(); // must call if buffered graphic context
...
```
 
> Note that `BufferedGraphicsContext` allocates a lot of memory (32KB for 128x128 resolution).

# API
 
## Class: ST7735
 
A class for ST7735 driver communicating with SPI interface.
 
### new ST7735()
 
Create an instance of ST7735 driver for SPI interface.
 
### st7735.setup(spi[, options])
 
- **`spi`** `<SPI>` An instance of `SPI` to communicate.
- **`options`** `<object>` Options for initialization.
  - **`width`** `<number>` Width of display in pixels. Default: `128`.
  - **`height`** `<number>` Height of display in pixels. Default: `128`.
  - **`xstart`** `<number>` x-start of display in pixels. Default: `2`.
  - **`ystart`** `<number>` y-start of display in pixels. Default: `3`.
  - **`dc`** `<number>` Pin number for DC. Default: `-1`.
  - **`rst`** `<number>` Pin number for RST (Reset). Default: `-1`.
  - **`cs`** `<number>` Pin number of CS (Chip select). Default: `-1`.
  - **`rotation`** `<number>` Rotation of screen. One of `0` (0 degree), `1` (90 degree in clockwise), `2` (180 degree in clockwise), and `3` (270 degree in clockwise). Default: `0`.
 
Setup ST7735 driver for a given SPI bus and options based on the below table.

| Display Types | `height` | `width` | `xstart` | `ystart` |
| ------------- | -------- | ------- | -------- | -------- |
| 1.44"         | 128      | 128     | 2        | 3        |
| 1.8"          | 128      | 160     | 0        | 0        |

### st7735.getContext([type])
 
- **`type`**: Optional. Type of graphic context. If `"buffer"` is given, `BufferedGraphicContext` is returned.
- **Returns**: `<GraphicContext>` An instance of graphic context for ST7735.
 
Get a graphic context.
 
> Note that `BufferedGraphicContext` is much faster, but it consumes memory a lot.
 
> Note that `gc.getPixel(x, y)` function is supported only if `BufferedGraphicsContext`.
 
# Examples
 
* `ex_144.js` (1.44" 128x128 resolution)
* `ex_18.js` (1.8" 128x160 resolution)
