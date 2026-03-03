#!/bin/bash

echo "🚀 Démarrage du backend Spring Boot..."

cd backend/candidex-api || exit 1

mvn spring-boot:run
