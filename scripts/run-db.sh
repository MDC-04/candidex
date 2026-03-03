#!/bin/bash

echo "🚀 Démarrage de MongoDB (Docker)..."

docker start candidex-mongo

if [ $? -eq 0 ]; then
  echo "✅ MongoDB démarré"
else
  echo "❌ Erreur lors du démarrage de MongoDB"
fi
