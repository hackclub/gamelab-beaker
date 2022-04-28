# TODO

- build kuluma

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

- right it in c
- create our own dev process
  - web-based
- get game to run on pico rp2040
- hook up audio amplifier