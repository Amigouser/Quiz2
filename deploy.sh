#!/bin/bash
cd /opt/quiz2
git pull
npm install --prefix client
npm install
npm run build --prefix client
pkill -f "node server/index.js" || true
pkill -f "npm run dev" || true
pkill -f "vite" || true
sleep 1
nohup node server/index.js > /tmp/quiz.log 2>&1 &
echo "Сайт запущен на порту 3001"
