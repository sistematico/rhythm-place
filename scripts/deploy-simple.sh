#!/usr/bin/env bash

NAME=rhythm
FULLNAME=$NAME.place
SERVICE=$NAME.service
TEMP_DIR=/tmp/$FULLNAME
PROJECT_DIR=/var/www/$FULLNAME

cd $PROJECT_DIR

npm install
npm run push
npm run seed
npm run build || exit 1

[ ! -L $PROJECT_DIR/public/music ] && ln -sf $PROJECT_DIR/public/music /var/music/rtm

sudo /usr/bin/systemctl restart $SERVICE