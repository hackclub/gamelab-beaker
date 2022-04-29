# TODO

## build kuluma

```
git clone https://github.com/kaluma-project/kaluma.git
```

```
cd kaluma
```

```
npm i
```

```
git submodule init
```

```
git submodule update --init --recursive
```

```
node build.js --clean
```

might need:

```
brew install --cask gcc-arm-embedded
```


```
git clone https://github.com/raspberrypi/pico-examples.git
git submodule init
git submodule update --init --recursive
export PICO_SDK_PATH=~/hackclub/pico-sdk/
mkdir build
cd build
cmake ..
make
```

```
echo $PICO_SDK_PATH
```

## better micropython development process

what we want

- to be able to run one script that bundles our dependencies and sends a single micropython file to the board

- get debug information

- to easily interop c into that file

list ports

```
ls /dev/*
```

```
minicom -o -D /dev/tty.usbmodem11301
```

https://github.com/dhylands/rshell

```
rshell --buffer-size=512 -p /dev/tty.usbmodem11301
```

get boards
```
boards
```

navigate to board directory
```
cd /pyboard
```

copy to board name from directory you want to copy
```
cp *.py /pyboard
```

## Other

- write it in c
- create our own dev process
  - web-based
- get game to run on pico rp2040
- hook up audio amplifier


## Chat with Brian

- lowest level transfer from pico to display

