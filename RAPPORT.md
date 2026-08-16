# 📘 CandiNote — Rapport de passation & Documentation complète

> Document de reprise destiné à toute personne (ou à toi-même plus tard) qui reprend le projet.
> Il couvre la **conception**, le **développement**, les **tests**, le **déploiement** et l'**exploitation**.
>
> **Dernière mise à jour :** 14 août 2026

---

## ⚠️ Note de marque importante (à lire en premier)
- Le produit s'appelle **CandiNote** (marque **affichée** à l'utilisateur).
- Les **identifiants internes** (nom du dépôt, package Java `com.candidex`, dossiers `candidex-api`/`candidex-frontend`, base Mongo `candidex`, conteneurs Docker `candidex-*`, clé localStorage `candidex_access_token`) sont restés en **« candidex »** — c'est un **choix délibéré** pour éviter un refactor invasif et une migration de données. **Ne PAS renommer** sans plan de migration.
- En résumé : **`candidex` = technique/interne**, **`CandiNote` = marque visible**.

---

## Table des matières
1. [Présentation](#1-présentation)
2. [Stack technique](#2-stack-technique)
3. [Architecture](#3-architecture)
4. [Structure du dépôt](#4-structure-du-dépôt)
5. [Conception — Modèle de domaine](#5-conception--modèle-de-domaine)
6. [API REST](#6-api-rest)
7. [Frontend (Angular)](#7-frontend-angular)
8. [Authentification & sécurité](#8-authentification--sécurité)
9. [Configuration & variables d'environnement](#9-configuration--variables-denvironnement)
10. [Développement local](#10-développement-local)
11. [Tests](#11-tests)
12. [Conteneurisation (Docker)](#12-conteneurisation-docker)
13. [Déploiement en production](#13-déploiement-en-production)
14. [Workflow de mise à jour](#14-workflow-de-mise-à-jour)
15. [Accès, URLs & emplacement des secrets](#15-accès-urls--emplacement-des-secrets)
16. [Sécurité — état & recommandations](#16-sécurité--état--recommandations)
17. [Pièges connus & dépannage](#17-pièges-connus--dépannage)
18. [Roadmap / ce qui reste](#18-roadmap--ce-qui-reste)
19. [Cheat-sheet des commandes](#19-cheat-sheet-des-commandes)
20. [Onboarding d'un nouveau développeur](#20-onboarding-dun-nouveau-développeur)

---

## 1. Présentation
**CandiNote** est une application SaaS de **suivi de candidatures d'emploi** : l'utilisateur centralise ses candidatures, suit leur progression dans un **pipeline (Kanban)**, planifie ses **entretiens**, et gère son **profil** (avec upload de CV). Chaque enregistrement appartient à **un seul utilisateur** (pas de partage multi-utilisateurs dans cette version).

Fonctionnalités principales :
- Comptes utilisateurs (inscription / connexion par email + mot de passe, JWT).
- CRUD **candidatures** (entreprise, poste, statut, source, salaire, notes, prochaine action…).
- Vue **liste** + **tableau de bord** (stats) + **pipeline Kanban** (glisser-déposer).
- CRUD **entretiens** (liés à une candidature, type/mode/date/fuseau horaire).
- **Profil** utilisateur + **upload/consultation/suppression de CV**.
- Autocomplétion **entreprise** (Clearbit) + **logo** (logo.dev) + **localisation** (Nominatim/OpenStreetMap) — APIs externes côté navigateur.

Les spécifications d'origine sont dans le dossier **`specs/`** (`SPEC.md`, `DOMAIN.md`, `API.md`, `ARCHITECTURE.md`, `SECURITY.md`, `CONTRIBUTING.md`) — à consulter en complément.

---

## 2. Stack technique

### Backend
| Élément | Version / détail |
|---|---|
| Langage | **Java 21** |
| Framework | **Spring Boot 3.4.2** |
| Build | **Maven** (`pom.xml`, wrapper non présent → `mvn` requis) |
| Base de données | **MongoDB** (via Spring Data MongoDB) — hébergée sur **MongoDB Atlas** en prod |
| Sécurité | Spring Security + **JWT** (`io.jsonwebtoken:jjwt 0.12.3`) |
| Hash mot de passe | **BCrypt** (Spring Security) |
| Rate limiting | **bucket4j-core 8.10.1** (token bucket) |
| Monitoring | Spring Boot **Actuator** (health seulement) |
| Divers | Lombok, Bean Validation, DevTools (dev) |

### Frontend
| Élément | Version / détail |
|---|---|
| Framework | **Angular 18** (composants **standalone**) |
| UI | **Angular Material 18.2** (thème `azure-blue` surchargé en indigo) + **CDK** (drag-drop Kanban) |
| Langage | **TypeScript 5.4** |
| Réactif | **RxJS 7.8** |
| Build | Angular CLI 18 |
| Tests | Karma + Jasmine (scaffolding) |

### Infrastructure (production)
| Élément | Détail |
|---|---|
| Serveur | **VPS OVH** (Ubuntu 26.04 LTS, Strasbourg 🇫🇷) |
| Conteneurs | **Docker** + **Docker Compose** |
| Reverse proxy / HTTPS | **Caddy 2** (certificats Let's Encrypt automatiques) |
| Serveur web frontend | **nginx** (sert Angular + proxy `/api`) |
| Base de données | **MongoDB Atlas** (cluster gratuit M0, région AWS Paris `eu-west-3`) |
| Domaine | **candinote.fr** (acheté chez OVH) |

---

## 3. Architecture

```mermaid
flowchart LR
    U[Navigateur / Mobile] -->|HTTPS 443| C[Caddy<br/>reverse proxy + TLS]
    C -->|HTTP interne| F[nginx<br/>sert Angular + proxy /api]
    F -->|/api/v1| B[Spring Boot API<br/>:8080]
    B -->|driver mongodb+srv| A[(MongoDB Atlas<br/>☁️ Paris)]
    B -.CV uploadés.-> V[(Volume Docker<br/>candidex-cv-uploads)]
    U -. autocomplete .-> EXT[APIs externes<br/>Clearbit / logo.dev / Nominatim]
```

**Flux d'une requête** :
1. Le navigateur ouvre `https://candinote.fr` → **Caddy** (443) termine le TLS.
2. Caddy transmet à **nginx** (conteneur `frontend`, port 80 interne) qui sert l'app Angular.
3. Les appels API `/api/v1/...` sont **proxifiés par nginx** vers le **backend** Spring Boot (`:8080`, interne).
4. Le backend lit/écrit dans **MongoDB Atlas**.
5. Les **CV** (fichiers) sont stockés sur un **volume Docker** du serveur (pas dans Atlas).
6. Les **autocomplétions** (entreprise, logo, localisation) sont appelées **directement par le navigateur** vers des APIs tierces.

> ⚠️ Aucune donnée applicative n'est stockée sur le disque du VPS **sauf les CV** (volume `candidex-cv-uploads`). Tout le reste est dans Atlas.

---

## 4. Structure du dépôt
Dépôt Git : **https://github.com/MDC-04/candidex** (public).

```
candidex/
├── backend/candidex-api/            # API Spring Boot
│   ├── pom.xml
│   ├── Dockerfile                   # build multi-stage (maven → jre-alpine, non-root)
│   └── src/main/
│       ├── java/com/candidex/api/
│       │   ├── CandidexApiApplication.java
│       │   ├── config/              # MongoConfig, SecurityConfig
│       │   ├── controller/          # Auth, Application, Interview, User
│       │   ├── dto/                 # DTOs requêtes/réponses
│       │   ├── model/               # User, Application, Interview, NextAction, ApplicationLinks
│       │   │   └── enums/           # statuts, sources, types…
│       │   ├── repository/          # Spring Data Mongo repositories
│       │   ├── security/            # JwtUtil, JwtAuthenticationFilter, RateLimitingFilter
│       │   ├── service/             # logique métier
│       │   └── exception/           # ApiErrorResponse, GlobalExceptionHandler
│       └── resources/
│           ├── application.properties       # config commune / dev
│           └── application-prod.properties   # surcharges prod (profil "prod")
├── frontend/candidex-frontend/      # App Angular
│   ├── package.json
│   ├── angular.json
│   ├── Dockerfile                   # build node → nginx
│   ├── nginx.conf                   # SPA + proxy /api + headers sécurité + gzip
│   ├── public/                      # assets (logos, favicon…)
│   └── src/
│       ├── environments/            # environment.ts (dev) + environment.prod.ts
│       ├── styles.scss              # design system global (tokens CSS, classes .cx-*)
│       └── app/
│           ├── core/                # services, guards, interceptors, models, i18n
│           ├── features/            # applications, interviews (composants + services + models)
│           ├── layout/shell/        # coquille (sidebar, toolbar)
│           ├── pages/               # auth, dashboard, home, applications, profile
│           └── shared/              # composants/pipes réutilisables (confirm-dialog…)
├── docker-compose.yml               # orchestration prod (backend + frontend + caddy)
├── Caddyfile                        # config reverse proxy / HTTPS
├── scripts/                         # scripts de dev (run-*.sh, mongo-init.js)
├── specs/                           # specs produit/technique d'origine
├── .env.example                     # template des variables (SANS secrets)
├── .env                             # secrets réels (git-ignoré, PAS dans le dépôt)
└── RAPPORT.md                       # ce document
```

---

## 5. Conception — Modèle de domaine
Trois collections MongoDB : `users`, `applications`, `interviews`. Chaque `application`/`interview` référence un `userId` (propriété d'un seul utilisateur).

### 5.1 `User` (collection `users`)
| Champ | Type | Notes |
|---|---|---|
| `id` | String | `@Id` |
| `email` | String | **unique** (index), validé `@Email` |
| `passwordHash` | String | **BCrypt** — jamais exposé au client |
| `authProvider` | enum `AuthProvider` | `LOCAL` (défaut) / `GOOGLE` (réservé futur) |
| `fullName` | String | |
| `currentPosition`, `company`, `location`, `phone`, `bio` | String | champs profil (bio ≤ 500) |
| `linkedinUrl`, `portfolioUrl` | String | liens |
| `cvFilename` | String | nom du fichier CV stocké sur disque |
| `cvOriginalFilename` | String | nom d'origine affiché à l'utilisateur |
| `createdAt`, `updatedAt` | Instant | auditing auto |

### 5.2 `Application` (collection `applications`)
Index composés : `{userId, updatedAt desc}` et `{userId, status, updatedAt desc}`.

| Champ | Type | Notes |
|---|---|---|
| `id` | String | |
| `userId` | String | index, propriétaire |
| `companyName` | String | requis, 1–120 |
| `companyDomain` | String | ≤255 (pour le logo) |
| `roleTitle` | String | requis, 1–120 |
| `city`, `country` | String | localisation |
| `source` | enum `ApplicationSource` | requis |
| `status` | enum `ApplicationStatus` | requis |
| `employmentType` | enum `EmploymentType` | |
| `appliedDate` | String | date ISO `YYYY-MM-DD` |
| `salary` | Integer | ≥ 0 |
| `currency` | String | défaut `EUR` |
| `salaryPeriod` | enum `SalaryPeriod` | |
| `tags` | List\<String\> | ≤ 10 |
| `links` | `ApplicationLinks` | objet imbriqué |
| `notes` | String | ≤ 5000 |
| `nextAction` | `NextAction` | objet imbriqué (date + note) |
| `createdAt`, `updatedAt` | Instant | |

### 5.3 `Interview` (collection `interviews`)
Index composés : `{userId, startAt}` et `{userId, applicationId}`.

| Champ | Type | Notes |
|---|---|---|
| `id` | String | |
| `userId` | String | index |
| `applicationId` | String | requis — lien vers la candidature |
| `title` | String | requis, 1–200 |
| `type` | enum `InterviewType` | requis (RH, technique, manager…) |
| `startAt` | Instant | requis |
| `endAt` | Instant | optionnel |
| `timezone` | String | fuseau (ex. `Europe/Paris`) |
| `mode` | enum `InterviewMode` | requis (visio, présentiel, téléphone…) |
| `location`, `meetingUrl` | String | |
| `status` | enum `InterviewStatus` | défaut `SCHEDULED` |
| `notes`, `feedback` | String | ≤ 5000 |
| `checklistItems`, `questionsToAsk`, `links` | List\<String\> | |
| `createdAt`, `updatedAt` | Instant | |

### 5.4 Énumérations
Définies dans `backend/candidex-api/src/main/java/com/candidex/api/model/enums/`. **Consulter les fichiers pour la liste exhaustive** ; valeurs principales :
- **`ApplicationStatus`** : `APPLIED`, `HR_INTERVIEW`, `TECH_INTERVIEW`, `OFFER`, `OFFER_ACCEPTED`, `OFFER_DECLINED`, `REJECTED`, `GHOSTED`.
- **`ApplicationSource`** : LinkedIn, site entreprise, recommandation, job board, email, forum école, autre.
- **`EmploymentType`** : CDI, CDD, stage, alternance, freelance…
- **`SalaryPeriod`** : annuel / mensuel.
- **`InterviewType`**, **`InterviewMode`**, **`InterviewStatus`** : voir `InterviewTypeLabels`/`InterviewModeLabels` côté frontend (`features/interviews/models`).
- **`AuthProvider`** : `LOCAL`, `GOOGLE`.

---

## 6. API REST
Base : `/api/v1`. Toutes les routes (sauf auth) exigent un **JWT** dans l'en-tête `Authorization: Bearer <token>`.

### Auth — `/api/v1/auth`
| Méthode | Chemin | Rôle |
|---|---|---|
| POST | `/register` | Créer un compte (retourne un token) |
| POST | `/login` | Se connecter (retourne un token) |
| GET | `/me` | Profil de l'utilisateur courant |

### Candidatures — `/api/v1/applications`
| Méthode | Chemin | Rôle |
|---|---|---|
| GET | `/` | Lister (pagination + filtres) |
| GET | `/{id}` | Détail |
| POST | `/` | Créer |
| PATCH | `/{id}` | Modifier |
| PATCH | `/batch/status` | Modifier le statut en lot (drag-drop Kanban) |
| DELETE | `/{id}` | Supprimer |

### Entretiens — `/api/v1/interviews`
| Méthode | Chemin | Rôle |
|---|---|---|
| GET | `/` | Lister |
| GET | `/{id}` | Détail |
| POST | `/` | Créer |
| PATCH | `/{id}` | Modifier |
| DELETE | `/{id}` | Supprimer |
| GET | `/by-application/{applicationId}` | Entretiens d'une candidature |

### Utilisateur / Profil — `/api/v1/users`
| Méthode | Chemin | Rôle |
|---|---|---|
| GET | `/profile` | Lire le profil |
| PUT | `/profile` | Mettre à jour le profil |
| POST | `/profile/cv` | Uploader un CV (`multipart/form-data`, max 5 Mo, PDF/DOC/DOCX) |
| GET | `/profile/cv` | Télécharger/consulter le CV |
| DELETE | `/profile/cv` | Supprimer le CV |

**Erreurs** : format standardisé via `GlobalExceptionHandler` + `ApiErrorResponse` (`timestamp`, `status`, `error`, `message`, `path`, `validationErrors`). Les 401/403 renvoient aussi ce format (JSON). Voir aussi `specs/API.md`.

---

## 7. Frontend (Angular)

### Organisation
- **`core/`** : `services/` (auth, user, applications, interviews, company-suggestion, location-suggestion, http-error, notification), `guards/auth.guard.ts`, `interceptors/auth.interceptor.ts`, `models/`, `i18n/` (paginator FR).
- **`features/`** : `applications/` et `interviews/` (composants + services + models spécifiques, dont les dialogs de formulaire).
- **`layout/shell/`** : coquille de l'app (sidebar de navigation + toolbar).
- **`pages/`** : `auth/` (login, register), `dashboard/`, `home/`, `applications/` (liste, kanban, détail), `profile/`.
- **`shared/`** : `confirm-dialog/` (dialog de confirmation réutilisable), pipes.

### Routing
Défini dans `app.routes.ts` : routes publiques `/auth/login`, `/auth/register` ; routes protégées par **`authGuard`** (dashboard, applications, interviews, profile, home). Lazy-loading des composants de page.

### Communication API
- URL de base via `environment.apiUrl` :
  - **dev** : `http://localhost:8080/api/v1` (absolu).
  - **prod** : `/api/v1` (**relatif** → même origine → proxifié par nginx → **pas de CORS**).
- L'**`authInterceptor`** ajoute le `Authorization: Bearer <token>` **uniquement** aux requêtes contenant `/api/v1` (les APIs externes ne reçoivent pas le token).
- Le token est stocké dans **sessionStorage** (clé `candidex_access_token`).

### Design system
- Tout est centralisé dans **`src/styles.scss`** : tokens CSS (`--cx-primary #5566f0`, `--cx-accent #7c4dcf`, `--cx-gradient`, rayons, ombres teintées indigo), et **classes réutilisables globales** : `.cx-btn-gradient`, `.cx-btn-outline`, `.cx-card`, `.cx-hero`, `.cx-badge--*`, snackbars, menus, dialogs.
- ⚠️ Le CSS des composants est **encapsulé** (ViewEncapsulation par défaut) → pour réutiliser un style entre composants, passer par une **classe globale** dans `styles.scss` (voir `.cx-btn-gradient`).
- Material `azure-blue` est **surchargé** en indigo (`--mat-sys-primary: #5566f0`) pour coller à la marque.

### APIs externes (autocomplétion)
Configurées dans `environment.ts` / `environment.prod.ts` :
- `companyAutocompleteUrl` : `https://autocomplete.clearbit.com/v1/companies/suggest`
- `logoApiUrl` + `logoApiToken` : `https://img.logo.dev` (token public)
- `nominatimUrl` : `https://nominatim.openstreetmap.org/search`

---

## 8. Authentification & sécurité
- **Inscription/connexion** : email + mot de passe. Mot de passe **haché en BCrypt** (jamais stocké en clair). L'email sert d'identifiant unique. **Aucune vérification d'email** n'est faite (pas d'envoi d'email) → un email au bon format mais inexistant est accepté.
- **JWT** : généré à la connexion/inscription (`JwtUtil`, lib jjwt). Durée via `JWT_EXPIRATION` (défaut 24 h). Secret via `JWT_SECRET` (**obligatoire en prod**, ≥ 32 octets — validé au démarrage, fail-fast).
- **Filtre** `JwtAuthenticationFilter` : valide le token sur chaque requête protégée.
- **Rate limiting** : `RateLimitingFilter` (bucket4j) pour limiter les abus.
- **CORS** : centralisé dans `SecurityConfig`, origines autorisées via `CORS_ALLOWED_ORIGINS` (obligatoire en prod, séparées par virgule).
- **Spring Security par défaut neutralisé** : `UserDetailsServiceAutoConfiguration` exclue (pas de « generated security password »).
- **Erreurs** normalisées (voir §6). `server.error.include-message/stacktrace = never/false` en prod (pas de fuite d'info).
- **Actuator** : seul `/actuator/health` est exposé (utilisé par le healthcheck Docker), en `permitAll`.

---

## 9. Configuration & variables d'environnement

### Backend — `application.properties` (commun/dev)
- `spring.application.name=candidex-api`, `server.port=8080`
- Mongo (dev) : `spring.data.mongodb.host/port/database` (défaut `localhost:27017/candidex`)
- `jwt.secret` a un **fallback dev** (ne PAS utiliser en prod).

### Backend — `application-prod.properties` (profil `prod`, utilisé par Docker)
- **Mongo via chaîne unique** : `spring.data.mongodb.uri=${MONGODB_URI}` (Atlas). ⚠️ le **nom de base** doit être dans l'URI (`.../candidex?...`), sinon base `test` par défaut.
- `jwt.secret=${JWT_SECRET}` (**obligatoire**, pas de fallback)
- `cors.allowed-origins=${CORS_ALLOWED_ORIGINS}` (**obligatoire**)
- Logs moins verbeux (WARN).

### Frontend — `src/environments/`
- `environment.ts` (dev) : `apiUrl: http://localhost:8080/api/v1`, `production:false`.
- `environment.prod.ts` (prod) : `apiUrl: /api/v1` (relatif), `production:true`. Substitué au build via `angular.json` (`fileReplacements`).

### Variables `.env` (lues par docker-compose) — **noms uniquement**
Voir `.env.example`. En **production** (sur le serveur), le `.env` contient :
| Variable | Rôle |
|---|---|
| `MONGODB_URI` | Chaîne de connexion **Atlas** (`mongodb+srv://user:pass@cluster0.xxx.mongodb.net/candidex?...`) — **secret** |
| `JWT_SECRET` | Clé de signature JWT (générée via `openssl rand -base64 48`) — **secret** |
| `JWT_EXPIRATION` | Durée du token en ms (ex. `86400000`) |
| `CORS_ALLOWED_ORIGINS` | `https://candinote.fr,https://www.candinote.fr` |

> ⚠️ Le `.env` **n'est pas** dans Git (git-ignoré). Il existe **uniquement** sur le serveur (`~/candidex/.env`) et en local. Les anciennes clés `MONGO_*` / `MONGODB_APP_*` / `FRONTEND_PORT` du template ne sont plus utilisées depuis le passage à Atlas + Caddy (peuvent rester, ignorées).

---

## 10. Développement local

### Pré-requis
Java 21, Maven, Node.js 20+, Angular CLI, Docker (pour Mongo local ou pour tester la stack).

### Lancer en dev
- **Base** : un MongoDB local (ex. `docker run -d --name candidex-mongo -p 27017:27017 mongo:7`) ou pointer le backend dev sur Atlas.
- **Backend** : depuis `backend/candidex-api/` → `mvn spring-boot:run` (port **8080**).
- **Frontend** : depuis `frontend/candidex-frontend/` → `ng serve` (port **4200**).
- ⚠️ En dev, le backend attend l'origine `http://localhost:4200` pour le CORS → **servir le front sur 4200**.
- Scripts pratiques dans `scripts/` (`run-db.sh`, `run-backend.sh`, `run-frontend.sh`, `run-all.sh`, `stop-all.sh`). ⚠️ ces `.sh` ont des fins de ligne **CRLF** → sous WSL, `pkill` peut ne pas matcher (erreurs `$'\r'`).

### Rappels
- Après un changement, `ng serve` recharge tout seul ; le navigateur peut nécessiter un **`Ctrl+Shift+R`** (cache).
- Ne pas laisser de **`ng serve` fantôme** occuper 4200 (`npx kill-port 4200`).

---

## 11. Tests
> **État actuel : couverture de tests minimale.** À renforcer.

- **Frontend** : Karma + Jasmine. 6 fichiers `*.spec.ts` présents (`app.component`, `shell`, `applications-list`, `applications-kanban`, `application-detail`, `dashboard`) — essentiellement du **scaffolding** généré, pas de vraie couverture métier. Lancer : `ng test`.
- **Backend** : `spring-boot-starter-test` présent (JUnit/Mockito dispo) mais **pas de suite de tests métier significative**. Lancer : `mvn test`.
- **Validation manuelle** utilisée pendant le projet : builds de prod (`ng build --configuration production`), tests HTTP (`curl`), vérifs de santé conteneurs (`docker compose ps`, `/actuator/health`).

**Reco reprise** : ajouter des tests d'intégration backend (services + repositories avec Mongo embarqué/testcontainers) et des tests de composants/services critiques côté Angular.

---

## 12. Conteneurisation (Docker)

### `backend/candidex-api/Dockerfile`
Multi-stage : `maven:3.9-eclipse-temurin-21` (build `mvn package`) → `eclipse-temurin:21-jre-alpine` (runtime). Utilisateur **non-root** (`candidex`), dossier `/app/uploads/cvs`, `JAVA_OPTS` (MaxRAMPercentage 75%). Expose 8080.

### `frontend/candidex-frontend/Dockerfile`
Multi-stage : `node:20-alpine` (`npm ci` + `ng build --configuration production`) → `nginx:1.27-alpine`. Copie `dist/candidex-frontend/browser` dans nginx + `nginx.conf`. Expose 80.

### `nginx.conf` (frontend)
- **SPA fallback** (`try_files ... /index.html`).
- **Proxy** `location /api/ → http://backend:8080`.
- **Headers sécurité** (X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy) + **gzip** + cache agressif des assets hashés.

### `docker-compose.yml` (production)
Trois services sur le réseau `candidex-network` :
- **`backend`** : build local, profil `prod`, env `MONGODB_URI`/`JWT_SECRET`/`JWT_EXPIRATION`/`CORS_ALLOWED_ORIGINS`, volume `candidex-cv-uploads:/app/uploads`, healthcheck sur `/actuator/health`. **Interne** (pas de port publié).
- **`frontend`** : build local (nginx). **Interne** (pas de port publié — Caddy s'en charge).
- **`caddy`** : image `caddy:2-alpine`, publie **80** et **443**, monte `./Caddyfile` + volumes `caddy-data`/`caddy-config`, reverse-proxy vers `frontend:80`, **HTTPS auto**.
- Volumes : `candidex-cv-uploads`, `caddy-data`, `caddy-config`.
- ⚠️ Le service **`mongodb` a été retiré** (base déportée sur Atlas).

### `Caddyfile`
```
candinote.fr, www.candinote.fr {
	reverse_proxy frontend:80
}
```

---

## 13. Déploiement en production
Chaîne complète : **VPS OVH → Docker Compose (backend + frontend + Caddy) → MongoDB Atlas**, exposé sur **https://candinote.fr**.

### 13.1 Serveur (VPS OVH)
- Ubuntu **26.04 LTS**, datacenter **Strasbourg** (France).
- Utilisateur SSH : **`ubuntu`** (sudo). IP : `51.178.87.209`.
- Docker + plugin compose installés (`curl -fsSL https://get.docker.com | sudo sh` + `usermod -aG docker ubuntu`).

### 13.2 Base de données (MongoDB Atlas)
- Cluster **Cluster0**, tier **M0 (gratuit)**, région **AWS Paris (eu-west-3)**.
- Un **utilisateur de base** (Database Access) + **accès réseau restreint** à `51.178.87.209/32` (Network Access).
- Chaîne de connexion dans `MONGODB_URI` (`.env` serveur).

### 13.3 Domaine & DNS (OVH)
- **candinote.fr** acheté chez OVH.
- Zone DNS : enregistrements **A** de `@` et `www` → **`51.178.87.209`**. (NS/SPF/TXT/MX/CNAME laissés intacts pour l'email.)

### 13.4 HTTPS (Caddy)
- Caddy obtient **automatiquement** les certificats **Let's Encrypt** pour `candinote.fr` et `www.candinote.fr` (challenge HTTP-01 sur port 80). Renouvellement auto.
- `http://` redirige vers `https://`.

### 13.5 Première mise en ligne (résumé des étapes réalisées)
1. `git clone` du dépôt sur le serveur (`~/candidex`).
2. Création du **`.env` de prod** (secrets réels : `MONGODB_URI`, `JWT_SECRET` généré, `CORS_ALLOWED_ORIGINS`).
3. `docker compose up -d --build` → build des images + démarrage.
4. Ajout du domaine + Caddy → `docker compose up -d` → certificats obtenus.
5. Vérification : `https://candinote.fr` renvoie 200 avec cadenas.

---

## 14. Workflow de mise à jour
Pour déployer une modification de code :

1. **En local** : coder, puis
   ```bash
   git add . && git commit -m "..." && git push
   ```
2. **Sur le serveur** :
   ```bash
   ssh ubuntu@51.178.87.209
   cd candidex
   git pull
   docker compose up -d --build frontend   # ou backend, ou les deux (sans nom de service)
   ```
   → reconstruit uniquement le service modifié (~2 min pour le frontend).

- Un `git pull` récupère **tous** les commits poussés → pas besoin de redéployer à chaque commit ; on peut grouper.
- Après un changement **backend** (ex. `application-prod.properties`), rebuild **backend** obligatoire (la config est dans le jar).
- Après un changement de `.env` (serveur), `docker compose up -d` suffit à recréer les conteneurs concernés.

---

## 15. Accès, URLs & emplacement des secrets

### URLs / accès
| Ressource | Adresse |
|---|---|
| Application (prod) | **https://candinote.fr** |
| Dépôt Git | https://github.com/MDC-04/candidex (public) |
| Serveur (SSH) | `ssh ubuntu@51.178.87.209` |
| Base de données | MongoDB Atlas → console cloud.mongodb.com (Cluster0) |
| Hébergeur serveur/domaine | Espace client OVHcloud |

### Où vivent les secrets (⚠️ **valeurs jamais dans Git ni dans ce rapport**)
| Secret | Emplacement |
|---|---|
| Mot de passe root/`ubuntu` du VPS | Fourni par OVH (lien secret) — connu de toi seul |
| `MONGODB_URI` (contient le mot de passe Atlas) | `~/candidex/.env` sur le serveur (+ `.env` local) |
| `JWT_SECRET` | `~/candidex/.env` sur le serveur |
| Mot de passe utilisateur Atlas | Défini dans Atlas (Database Access) |
| Identifiants OVH / Atlas | Comptes personnels (email `mohameddyaeche@gmail.com`) |

> 🔐 Le `.env` de prod est le **coffre** : il n'est **pas** versionné. En cas de perte du serveur, il faut le **recréer** (URI Atlas + nouveau `JWT_SECRET` + CORS). Garde une copie sûre hors-ligne.

---

## 16. Sécurité — état & recommandations

### En place ✅
- HTTPS (Let's Encrypt via Caddy), redirection http→https.
- JWT avec secret fort (généré, ≥ 32 octets), mots de passe **BCrypt**.
- CORS restreint au domaine.
- **Accès réseau Atlas restreint** à l'IP du VPS (`51.178.87.209/32`).
- Headers de sécurité (nginx), erreurs sans fuite d'info, rate limiting, Actuator limité à `health`.
- Backend en conteneur **non-root**.

### À faire / recommandé 🔧
1. **Régénérer le mot de passe Atlas** (il est apparu en clair dans l'historique de chat) — non urgent grâce à la restriction réseau, mais bonne hygiène. Si régénéré → mettre à jour `MONGODB_URI` dans le `.env` serveur + `docker compose up -d`.
2. **Sauvegarde des CV** : le volume `candidex-cv-uploads` vit sur le VPS → prévoir une sauvegarde (ou migrer vers un stockage objet type S3/Cloudflare R2).
3. **Durcir le serveur** : clé SSH (au lieu du mot de passe), `ufw` (autoriser 22/80/443), `fail2ban`, mises à jour automatiques.
4. **Sauvegardes Atlas** : le M0 gratuit a des sauvegardes limitées → envisager un export régulier si les données deviennent précieuses.
5. **RGPD** : si vrais utilisateurs, prévoir droit à l'effacement / mentions.

---

## 17. Pièges connus & dépannage
Leçons apprises pendant le projet (gain de temps garanti) :

- **Noms de variables `.env`** : `docker-compose.yml` lit des noms **précis** (`MONGODB_URI`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`). Un mauvais nom → variable vide → backend qui plante (`Failed to bind ... NullPointerException`). Toujours partir de `.env.example`.
- **CORS = « Invalid CORS request »** : l'origine (protocole+domaine+port) doit être **exactement** dans `CORS_ALLOWED_ORIGINS`. En dev `http://localhost:4200`, en Docker local `http://localhost:8080`, en prod `https://candinote.fr`.
- **Cache navigateur CORS** : une réponse d'API externe mise en cache pour une origine (ex. `:4200`) peut être resservie pour une autre origine (ex. `:8080`) et **bloquée** → symptôme trompeur (marche pour un mot, pas pour un autre). Solution : navigation privée / vider le cache.
- **Cache DNS local** : après modif DNS, `ipconfig /flushdns` (Windows) ; sinon la machine garde l'ancienne IP (page parking OVH qui redirige vers `www`).
- **PowerShell 5.1** : `Invoke-WebRequest` échoue souvent en TLS moderne → utiliser **`curl.exe`**.
- **Init Mongo une seule fois** (si on ré-héberge Mongo soi-même) : le script d'init ne s'exécute que sur un **volume vide** → changer les identifiants nécessite de recréer le volume.
- **Dépendances stacking/overflow (CSS)** : les dropdowns d'autocomplétion peuvent être masqués par un `overflow:hidden` parent ou un **contexte d'empilement** (élément avec `transform`) → cf. `/memories`… ou : `overflow:visible` + z-index sur le **conteneur** (pas seulement le panneau).
- **Apostrophe dans une expression Angular** : `{{ isEdit ? 'Modifier l'entretien' : ... }}` casse le template (l'apostrophe ferme la chaîne) → utiliser des **guillemets doubles** : `"Modifier l'entretien"`.
- **Logo sidebar** : `Logo_CandiNote_Trans.png` est une image portrait avec le logo dans la bande centrale → affiché via **background-crop** (`background-size`/`position`) ; sensible à la hauteur du conteneur (ne pas casser le recadrage sur mobile).
- **Maven absent en local** (Windows/WSL) pendant le projet → le backend n'était compilable que dans l'image Docker. Prévoir Maven si dev backend local.

---

## 18. Roadmap / ce qui reste
- 🎨 **Refonte / peaufinage du rendu** de plusieurs écrans, surtout en **mobile** (responsive global, logo de la sidebar jugé perfectible). L'infra étant indépendante, ces changements se déploient via le workflow §14.
- ✉️ **Fonctions email** (nécessitent un service SMTP type Brevo/Resend) : **vérification d'email**, **mot de passe oublié / reset**, **notifications** (rappels d'entretien). Le champ email est déjà là.
- 🔐 **Google OAuth** (`AuthProvider.GOOGLE` est réservé).
- ☁️ **Stockage des CV** vers un stockage objet (S3/R2) + sauvegardes.
- 📱 **Mobile natif** (Capacitor) — nécessiterait `apiUrl` absolu + origine CORS capacitor.
- 🧪 **Tests** : renforcer la couverture backend + frontend.
- 🔎 **Autocomplete intitulé de poste** (ESCO ou liste statique).

---

## 19. Cheat-sheet des commandes

### Dev local
```bash
# Backend (port 8080)
cd backend/candidex-api && mvn spring-boot:run
# Frontend (port 4200)
cd frontend/candidex-frontend && ng serve
# Build de prod (valider)
ng build --configuration production
```

### Git / déploiement
```bash
# En local
git add . && git commit -m "..." && git push
# Sur le serveur
ssh ubuntu@51.178.87.209
cd candidex && git pull
docker compose up -d --build            # tout
docker compose up -d --build frontend   # seulement le frontend
```

### Exploitation Docker (sur le serveur)
```bash
docker compose ps                        # état des conteneurs
docker compose logs -f backend           # logs backend en direct
docker compose logs caddy                # logs Caddy (certificats)
docker compose restart backend           # redémarrer un service
docker compose down                      # arrêter (garde les volumes)
docker compose up -d                     # relancer
```

### Vérifications
```bash
# Depuis n'importe où
curl.exe -sS -o NUL -w "HTTP %{http_code}\n" https://candinote.fr
# Résolution DNS (après flush si besoin : ipconfig /flushdns)
Resolve-DnsName candinote.fr -Type A
```

---

## 20. Onboarding d'un nouveau développeur

> Objectif : partir de **zéro accès** jusqu'à faire tourner l'app en local, puis déployer un changement. À suivre dans l'ordre.

### 20.1 Obtenir les accès
1. **Dépôt Git** : public (`github.com/MDC-04/candidex`) → `git clone` suffit pour lire/coder. Pour **pousser**, demander à être **collaborateur** GitHub (ou fork + pull request).
2. **Serveur (VPS OVH)** : demander au propriétaire un accès SSH — idéalement en ajoutant sa **clé SSH publique** dans `~/.ssh/authorized_keys` du serveur (plutôt que le mot de passe `ubuntu`).
3. **MongoDB Atlas** : se faire **inviter au projet Atlas** (ou obtenir l'utilisateur DB) ; pour un dev local contre Atlas, ajouter son IP dans **Network Access**.
4. **Domaine / DNS** : accès à l'**espace client OVH** (uniquement si on touche au domaine/DNS/HTTPS).
5. **Secrets** : récupérer le contenu du `.env` de prod (`~/candidex/.env` sur le serveur) via un **canal privé** — jamais public. À défaut, savoir le **recréer** (voir 20.4).

### 20.2 Prérequis machine
- **Node.js 18+** + Angular CLI (`npm i -g @angular/cli`).
- **Java 21** + **Maven** (backend en local ; sinon il se compile dans Docker).
- **Docker** + **Docker Compose**.
- **Git**.

### 20.3 Lancer en local
```bash
git clone https://github.com/MDC-04/candidex.git
cd candidex

# Frontend (http://localhost:4200, proxy /api -> backend :8080)
cd frontend/candidex-frontend && npm install && npm start

# Backend (autre terminal) — Java 21 + Maven + un Mongo (local ou Atlas)
cd backend/candidex-api && mvn spring-boot:run     # http://localhost:8080
```
- **Mongo local rapide** : `docker run -d --name candidex-mongo -p 27017:27017 mongo:7` (le backend dev pointe sur `localhost:27017` par défaut) — ou renseigner l'URI **Atlas**.
- Vérifier le backend : `http://localhost:8080/actuator/health` → `{"status":"UP"}`.

### 20.4 Recréer le `.env` de prod (si perdu)
Sur le serveur, dans `~/candidex/.env` (voir aussi `.env.example`) :
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/candidex?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=<clé générée : openssl rand -base64 48>
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=https://candinote.fr,https://www.candinote.fr
```
Puis `docker compose up -d --build`. ⚠️ Le nom de base (`/candidex`) doit être **dans** l'URI, sinon Mongo écrit dans la base `test`.

### 20.5 Déployer un changement
Suivre **§14** : en local `git add . && git commit && git push` ; sur le serveur `ssh ubuntu@51.178.87.209`, `cd candidex && git pull && docker compose up -d --build <frontend|backend>` (rebuild **backend** obligatoire si la config a changé, car embarquée dans le jar).

### 20.6 Quand ça casse — où regarder
- **Logs** : `docker compose logs -f backend` · `docker compose logs caddy` (certificats HTTPS).
- **Santé** : `docker compose ps` · `/actuator/health`.
- **Pièges fréquents** : voir **§17** (noms de variables `.env`, CORS exact, cache DNS, TLS sous PowerShell).

---

*Fin du rapport. Pour tout détail non couvert ici, se référer au code source, au dossier `specs/`, et aux commentaires en tête de fichiers.*
