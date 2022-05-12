BOARD_PORT="/dev/tty.usbmodem1422101"

REMOVE="rm -rf /pyboard/*"
COPY="cp *.py /pyboard"
RUN="repl ~ import main"

MAIN="rshell --buffer-size=512 -p $BOARD_PORT $REMOVE"

TEST="echo hello"

rshell --buffer-size=512 -p $BOARD_PORT $REMOVE
rshell --buffer-size=512 -p $BOARD_PORT $COPY
rshell --buffer-size=512 -p $BOARD_PORT $RUN