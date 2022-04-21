const { ST7735 } = require('st7735');
const st7735 = new ST7735();

// var options = { // ST7735R 1.44"
//   dc: 21,
//   rst: 22,
//   cs: 24
// };


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

const color = gc.color16(255, 255, 255);


let size = 10;
setInterval(() => {
  gc.fillScreen(color)
  // gc.drawRect(0, 0, size, 160);
  gc.drawCircle(128/2, 160/2, size);
  gc.display();
  size += 10;
}, 200);


// gc.display(); // must call if buffered graphic context
