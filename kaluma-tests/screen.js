// echo ./index.js | entr -s "kaluma flash ./index.js --bundle"

const { ST7735 } = require('st7735');
const st7735 = new ST7735();

const A = 0;
const B = 3;
const UP = 13;
const DOWN = 12;
const LEFT = 11;
const RIGHT = 10;

const led = pinMode(25, OUTPUT);

let size = 10;


digitalToggle(25)

pinMode(A, INPUT_PULLUP);

setWatch(
  function () {
    digitalToggle(25); // Set the pin 1 to HIGH.
    size += 10;
    // if (size === 80 || size === 0) delta *= -1;
  },
  A,
  FALLING,
  // 5
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
  baudrate: 20000000 // default: 3000000
}

const spi = board.spi(1, spiOptions);

st7735.setup(spi, options);
const gc = st7735.getContext("buffer");

const color = gc.color16(255, 100, 255);


let delta = 5;
setInterval(() => {
  gc.fillScreen(color);
  // gc.drawRect(0, 0, size, 160);
  gc.drawCircle(128/2, 160/2, size);
  gc.display();
}, 1000/20);


// gc.display(); // must call if buffered graphic context
