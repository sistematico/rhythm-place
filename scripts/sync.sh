#!/usr/bin/env bash

DELETE="--delete"
MACHINE="tyche"
REMOTE_USER="liquidsoap"
PARAMS="-avz --progress"
LOCAL_DIR="/home/lucas/music/rtm/"
REMOTE_DIR="/var/music/rtm/"
EXCLUDES="--exclude '*.part' --exclude 'lost+found/' --exclude 'temp/' --exclude 'incomplete/' --exclude '.DS_Store'"

if [ "$(sw_vers -productName 2> /dev/null)" == "macOS" ]; then
  PARAMS="-avz"
  LOCAL_DIR="/Users/lucas/music/rtm/"
fi

#rsync $PARAMS $REMOTE_USER@$MACHINE:$REMOTE_DIR $LOCAL_DIR $DELETE $EXCLUDES
rsync $PARAMS $LOCAL_DIR $REMOTE_USER@$MACHINE:$REMOTE_DIR $DELETE $EXCLUDES