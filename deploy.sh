#!/bin/bash
set -e
cd /opt/quiz2
echo "== git pull =="
git fetch origin
git reset --hard origin/master
echo "== npm install =="
npm install --prefix client
npm install
echo "== build =="
npm run build --prefix client
echo "== restart =="
fuser -k 3001/tcp 2>/dev/null || true
sleep 2
nohup node server/index.js > /tmp/quiz.log 2>&1 &
sleep 2
if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "Сайт запущен на порту 3001"
else
  echo "ОШИБКА: сервер не стартовал! Лог:"
  cat /tmp/quiz.log
  exit 1
fi