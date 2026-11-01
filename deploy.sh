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
# Если установлен systemd-сервис quiz2 (deploy/quiz2.service) — перезапускаем через него,
# тогда сайт сам поднимется после перезагрузки сервера и после падения.
if systemctl is-enabled quiz2 >/dev/null 2>&1; then
  systemctl restart quiz2
  LOG_CMD="journalctl -u quiz2 -n 50 --no-pager"
else
  fuser -k 3001/tcp 2>/dev/null || true
  sleep 2
  nohup node server/index.js > /tmp/quiz.log 2>&1 &
  LOG_CMD="cat /tmp/quiz.log"
fi
for i in 1 2 3 4 5 6 7 8 9 10; do
  sleep 1
  if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "Сайт запущен на порту 3001"
    exit 0
  fi
done
echo "ОШИБКА: сервер не стартовал! Лог:"
$LOG_CMD
exit 1