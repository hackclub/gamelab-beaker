/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("pwm");

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
// Generate 1000 Hz 50% duth PWM signal on the pin 1.
const { PWM } = __webpack_require__(1);
const pwm = new PWM(0, 1000, 0.5); // Create the PWM instance with pin 1
pwm.start(); // Generate PWM signal

function playSong(song) {
  const startTime = millis();
  let elapsedTime = 0;

  let noteIndex = 0;

  while (noteIndex < song.length) {
    elapsedTime = millis() - startTime;

    if (elapsedTime > 1000) {
      const note = song[i];
      const f = tones[note];
      pwm.setFrequency(f);
      noteIndex++;
      elapsedTime = 0;
    }
  }

  pwm.stop(); // Stop PWM signal
  pwm.close(); // Close PWM port.
}

// playSong(["A4","A4","C5","B5","A5"])


const tones = {
"B0": 31,
"C1": 33,
"C#1": 35,
"D1": 37,
"D#1": 39,
"E1": 41,
"F1": 44,
"F#1": 46,
"G1": 49,
"G#1": 52,
"A1": 55,
"A#1": 58,
"B1": 62,
"C2": 65,
"C#2": 69,
"D2": 73,
"D#2": 78,
"E2": 82,
"F2": 87,
"F#2": 93,
"G2": 98,
"G#2": 104,
"A2": 110,
"A#2": 117,
"B2": 123,
"C3": 131,
"C#3": 139,
"D3": 147,
"D#3": 156,
"E3": 165,
"F3": 175,
"F#3": 185,
"G3": 196,
"G#3": 208,
"A3": 220,
"A#3": 233,
"B3": 247,
"C4": 262,
"C#4": 277,
"D4": 294,
"D#4": 311,
"E4": 330,
"F4": 349,
"F#4": 370,
"G4": 392,
"G#4": 415,
"A4": 440,
"A#4": 466,
"B4": 494,
"C5": 523,
"C#5": 554,
"D5": 587,
"D#5": 622,
"E5": 659,
"F5": 698,
"F#5": 740,
"G5": 784,
"G#5": 831,
"A5": 880,
"A#5": 932,
"B5": 988,
"C6": 1047,
"C#6": 1109,
"D6": 1175,
"D#6": 1245,
"E6": 1319,
"F6": 1397,
"F#6": 1480,
"G6": 1568,
"G#6": 1661,
"A6": 1760,
"A#6": 1865,
"B6": 1976,
"C7": 2093,
"C#7": 2217,
"D7": 2349,
"D#7": 2489,
"E7": 2637,
"F7": 2794,
"F#7": 2960,
"G7": 3136,
"G#7": 3322,
"A7": 3520,
"A#7": 3729,
"B7": 3951,
"C8": 4186,
"C#8": 4435,
"D8": 4699,
"D#8": 4978
}

})();

/******/ })()
;