#!/usr/bin/env bash

export PATH=$PATH:/home/nginx/.bun/bin

NAME=rhythm
FULLNAME=${NAME}-place
SERVICE=$NAME.service
TEMP_DIR=/tmp/$FULLNAME
PROJECT_DIR=/var/www/$FULLNAME

[ ! -L $PROJECT_DIR/public/music ] && ln -sf $PROJECT_DIR/public/music /var/music/rtm

rm -rf $TEMP_DIR
cp -a $PROJECT_DIR $TEMP_DIR
cd $TEMP_DIR

bun install

sudo /usr/bin/systemctl stop $SERVICE

bun run build && { 
  cd ~
  rm -rf $PROJECT_DIR
  mv $TEMP_DIR $PROJECT_DIR 
} || {
  echo "Build failed, deployment aborted."
  sudo /usr/bin/systemctl start $SERVICE
  exit 1  
}

sudo /usr/bin/systemctl start $SERVICE