#!/bin/sh

sigint_handler()
{
  kill $PID
  exit
}

trap sigint_handler INT TERM

while true; do
  echo "[Watch] 🚀 Launch project"
  node ./build/index.js &
  PID=$!
  echo "[Watch] 👀 Watch files"
  inotifywait -e modify -e move -e create -e delete -e attrib ./build/index.js
  echo "[Watch] ⛔ Kill current process"
  kill $PID

  echo "[Watch] 🕑 Wait 3s (let time to the ftp upload to finish)"
  echo -n "\r3"
  sleep 1
  echo -n "\r2"
  sleep 1
  echo -n "\r1"
  sleep 1
  echo -n "\r"

  echo "[Watch] 🔁 Restarting..."
  echo ""
  echo "==========================="
  echo ""
done
