#!/usr/bin/env bash

NAME="rhythm-place"
TMPDIR="/tmp/rhythm.place"
WORKDIR="/var/www/rhythm.place"
SERVICE="${NAME}.service"
PATH=$PATH:/home/nginx/.bun/bin

echo "📦 Preparando ambiente de deploy..."

[ -e $TMPDIR ] && rm -rf $TMPDIR
[ -e $WORKDIR ] && cp -af $WORKDIR $TMPDIR
cd $TMPDIR || exit 1

git clean -fxd -e .env
cp -f .env .env.production

echo "📥 Instalando dependências..."
bun install

if ! bun run push; then
  echo "❌ Falha na migração de dados. Abortando deploy."
  exit 1
fi
echo "🗃️ Migração de dados concluída!"

if ! bunx tsx ./src/db/seed.ts; then
  echo "❌ Falha ao executar seed. Abortando deploy."
  exit 1
fi
echo "✅ Seed concluído com sucesso!"

if bun run build; then
  echo "✅ Build concluído com sucesso!"
  sudo /usr/bin/systemctl stop "$SERVICE"
  [ -e $WORKDIR ] && rm -rf $WORKDIR
  [ -e $TMPDIR ] && mv $TMPDIR $WORKDIR 
  sudo /usr/bin/systemctl start "$SERVICE"
  echo "🚀 Serviços reiniciados!"
fi