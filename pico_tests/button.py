from machine import Pin, Timer
import time
import math

led = Pin(25, Pin.OUT);

buttons = [(i, Pin(i, Pin.IN, Pin.PULL_UP)) for i in [0, 1, 2, 3, 4, 5]]
blinks = 0

led.value(0)

def input():
    global blinks
    for i, btn in buttons:
        if not btn.value():
            blinks += (i+1)*2

def blink():
    global blinks

    led.value(0)

    if blinks > 0:
        blinks -= 1
        if blinks % 2:
            led.value(1)


tim = Timer(period=500, mode=Timer.PERIODIC, callback=lambda t:input())
tim = Timer(period=250, mode=Timer.PERIODIC, callback=lambda t:blink())


print("running v0.0.9")
