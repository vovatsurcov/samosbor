#!/usr/bin/env bash
set -euo pipefail

GAME_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$GAME_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Не найден Node.js. Установите Node.js 22 или новее и повторите запуск."
  exit 1
fi

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "Нужен Node.js 22 или новее. Сейчас установлен: $(node --version)"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Первый запуск: устанавливаю зависимости..."
  npm ci
fi

GAME_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo ""
echo "Игра запускается для домашней сети."
echo "На компьютере: http://localhost:4173"
if [ -n "$GAME_IP" ]; then
  echo "На телефоне:   http://$GAME_IP:4173"
fi
echo "Остановить сервер: Ctrl+C"
echo ""

npm run lan
