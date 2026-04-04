#!/usr/bin/env bash

PATH=$PATH:/home/nginx/.bun/bin

NAME=rhythm-place
SERVICE=rhythm.service
TEMP_DIR=/tmp/$NAME
PROJECT_DIR=/var/www/$NAME

[ -d "$TEMP_DIR" ] && rm -rf "$TEMP_DIR"
cp -a "$PROJECT_DIR" "$TEMP_DIR"
cd "$TEMP_DIR" || exit 1

git clean -fxd
# cp .env .env.production 

bun install

# if bun run push; then
#   echo "Push do banco de dados com sucesso."
#   bun run seed
# else
#   echo "Erro ao aplicar push do banco de dados. Abortando deploy."
#   exit 1
# fi

bun run build || exit 1

sudo /usr/bin/systemctl stop $SERVICE
rm -rf "$PROJECT_DIR"
mv "$TEMP_DIR" "$PROJECT_DIR"
sudo /usr/bin/systemctl start $SERVICE