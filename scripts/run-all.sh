#!/bin/bash

echo "🚀 Lancement de Candidex (DB + Backend + Frontend)"

# DB
docker start candidex-mongo

# Backend
echo "▶️ Backend..."
cd backend/candidex-api || exit 1
mvn spring-boot:run &
BACKEND_PID=$!

# Frontend
echo "▶️ Frontend..."
cd ../frontend/candidex-frontend || exit 1
ng serve &
FRONTEND_PID=$!

echo "✅ Tout est lancé"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

wait
