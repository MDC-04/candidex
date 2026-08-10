#!/bin/bash

echo "🛑 Arrêt de CandiNote"

pkill -f "spring-boot:run"
pkill -f "ng serve"

echo "✅ CandiNote arrêté"