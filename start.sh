#!/bin/sh

echo "[GPS] 🚀 Launch project"
node ./build/index.js &

PID=$!
wait $PID
EXIT_CODE=$?

echo "[GPS] Exited with code $EXIT_CODE"
if [ $EXIT_CODE = 42 ]
then
  echo "[GPS] Ask for shutdown"
  sudo shutdown 0
fi