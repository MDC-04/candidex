#!/bin/bash

echo "🛑 Arrêt de Candidex"

pkill -f "spring-boot:run"
pkill -f "ng serve"

echo "✅ Candidex arrêté"