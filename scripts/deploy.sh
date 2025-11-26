#!/usr/bin/env bash

PATH=$PATH:/usr/local/bin

NAME=rhythm
FULLNAME=$NAME.place
SERVICE=$NAME.service
TEMP_DIR=/tmp/$FULLNAME
PROJECT_DIR=/var/www/$FULLNAME

[ -d "$TEMP_DIR" ] && rm -rf "$TEMP_DIR"
cp -a "$PROJECT_DIR" "$TEMP_DIR"
cd "$TEMP_DIR" || exit 1

git clean -fxd -e .env
cp .env.production .env

pnpm install
pnpm run push
pnpm run seed
pnpm run build || exit 1

sudo /usr/bin/systemctl stop $SERVICE
ln -s $PROJECT_DIR/public/music /var/music/rtm
rm -rf "$PROJECT_DIR"
mv "$TEMP_DIR" "$PROJECT_DIR"
sudo /usr/bin/systemctl start $SERVICE