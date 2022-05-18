![image](https://user-images.githubusercontent.com/27078897/164332709-5167cbc6-32a4-49e7-8eef-5b4c7a7e7dd5.png)

# Game Lab Beaker
People learn best when they are making things that they are proud of, things that can share with others. We made [gamelab](https://github.com/hackclub/game-lab) to help facilitate this style of learning. People who have never written code before can use it to get started right away changing real code and eventually making their own games. The Beaker is a handheld console meant to further enhance and popularize this style of learning; we will send them to technical teenagers who make games to run on one, and they will be able to show their games running on this device to anyone.

https://user-images.githubusercontent.com/25539554/169143730-565797fc-a0e5-44eb-96f9-02093b27bbcb.mp4

Kaluma is a JS runtime implemented on top of JerryScript, which we've been extending with the parts of this project that require C optimization.
our fork:
https://github.com/hackclub/kaluma/tree/ced
the original repo:
https://github.com/kaluma-project/kaluma

# The Repo
We've been testing various runtimes and their hardware drivers as we make sure all of our components work and are configured correctly, hence `micropython_tests/` and `kaluma-tests/`. The file extension for the executables which run on these devices is `.uf2`, the `uf2/` folder contains the kaluma and micropython runtimes we've used to run the code in their respective files. This folder also contains `flash_nuke.uf2` which was compiled from a small C program designed to wipe the persistent memory on the chip, which is useful for recoverring from invalid states.

# Parts

- Raspberry Pi Pico RP2040 PID: 4864
- 1.8" Color TFT LCD display with MicroSD Card Breakout - ST7735R PID: 358
- Adafruit I2S 3W Class D Amplifier Breakout - MAX98357A
- Mini Metal Speaker w/ Wires - 8 ohm 0.5W PID: 1890
- PowerBoost 1000 Charger - Rechargeable 5V Lipo USB Boost @ 1A - 1000C
- plus asorted switches and buttons

# Raspberry Pi Pico, rp2040

We're planning on using this chip.

Here is a [pinout diagram](https://datasheets.raspberrypi.com/pico/Pico-R3-A4-Pinout.pdf).

# Hooking Up the Screen, ST7735

We're planning on using [this screen](https://learn.adafruit.com/1-8-tft-display/breakout-pinouts).

This [video](https://www.youtube.com/watch?v=9rDXPcwuXLA) and [repo](https://github.com/stechiez/raspberrypi-pico) were very helpful in setting up the screen:

It uses this [version](https://www.banggood.in/1_44-Inch-TFT-SPI-Serial-Port-LCD-Module-Colorful-Screen-Display-Module-LCD-Screen-ST7735-Drive-p-1903603.html?warehouse=CN&ID=0&p=09122211383184201706&custlinkid=1784032&cur_warehouse=CN) of the screen. 

This [c library](https://github.com/bablokb/pico-st7735) may also be relevant.

Naming conventions vary slightly the below snippet from [this thread](https://forums.raspberrypi.com/viewtopic.php?t=212810) could help clear up some confusion here:

```
LED - GPIO18 - pin 12
SCK - GPIO11 - pin 23
SDA (MOSI) - GPIO10 - pin 19
A0 (D/C) - GPIO24 - pin 18
RESET - GPIO25 - pin 22
CS - GPIO8 - pin 24
GND - pin 6
VCC - pin 2
```

Other possibly useful links:

- https://helloraspberrypi.blogspot.com/2021/02/raspberry-pi-picomicropython-st7789-spi.html

# Kuluma

Instructions on how to build Kuluma.

https://github-wiki-see.page/m/kaluma-project/kaluma/wiki/Build

Which uses [Jerryscript](https://jerryscript.net/).

It has a [nice web IDE](https://kalumajs.org/ide/).

# Wiping Flash Memory

Load `flash_nuke.uf2` onto the Pico.

Can also refer to [this example](https://github.com/raspberrypi/pico-examples/blob/master/flash/nuke/nuke.c) from Raspberry Pi.



