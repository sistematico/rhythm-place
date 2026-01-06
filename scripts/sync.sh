#!/usr/bin/env bash

# rsync \
#   -avz \
#   --progress \
#   liquidsoap@tyche:/var/music/rtm/ \
#   /home/lucas/music/rtm/ \
#   --exclude '*.part' \
#   --exclude 'lost+found/' \
#   --exclude 'temp/' \
#   --exclude 'incomplete/' \
#   --exclude '.DS_Store'

rsync \
  -avz \
  --progress \
  /home/lucas/music/rtm/ \
  liquidsoap@tyche:/var/music/rtm/ \
  --exclude '*.part' \
  --exclude 'lost+found/' \
  --exclude 'temp/' \
  --exclude 'incomplete/' \
  --exclude '.DS_Store'