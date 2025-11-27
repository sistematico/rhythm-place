#!/usr/bin/env bash

NAME=rhythm
FULLNAME=$NAME.place
SERVICE=$NAME.service
TEMP_DIR=/tmp/$FULLNAME
PROJECT_DIR=/var/www/$FULLNAME

#[ -d "$TEMP_DIR" ] && rm -rf "$TEMP_DIR"
#cp -a "$PROJECT_DIR" "$TEMP_DIR"
#cd "$TEMP_DIR" || exit 1

cd $PROJECT_DIR

#git clean -fxd -e .env
#cp -f .env .env.production

npm install
npm run push
npm run seed
npm run build || exit 1

sudo /usr/bin/systemctl stop $SERVICE
#[ ! -L $PROJECT_DIR/public/music ] && ln -sf $PROJECT_DIR/public/music /var/music/rtm
#rm -rf "$PROJECT_DIR"
#mv "$TEMP_DIR" "$PROJECT_DIR"
sleep 10
sudo /usr/bin/systemctl start $SERVICE