from machine import Pin, Timer

led = Pin(25, Pin.OUT)
timer = Timer()

def blink(timer):
    led.toggle()

timer.init(freq=10, mode=Timer.PERIODIC, callback=blink)
