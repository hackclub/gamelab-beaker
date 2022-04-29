from ST7735 import TFT
from machine import SPI, Pin, Timer
import time
import math

spi = SPI(
    1,
    baudrate=20000000,
    polarity=0,
    phase=0,
    sck=Pin(10),
    mosi=Pin(11),
    miso=None
)

tft = TFT(spi,16,17,18)
tft.initr()
tft.rgb(True)

led = Pin(25, Pin.OUT)
button = Pin(0, Pin.IN, Pin.PULL_UP)


led.value(0)

def checkButton():
    if not button.value():
        led.value(1)
    else:
        led.value(0)

tim = Timer(period=5, mode=Timer.PERIODIC, callback=lambda t:checkButton())


print("running")
