# 🌍 GeoLock - Plateforme de Géolocalisation GPS

## 📌 Introduction

**GeoLock** est une plateforme complète de géolocalisation GPS composée de trois applications principales :

- **Frontend** : Interface utilisateur moderne en Next.js avec Tailwind CSS, ShadCN et Lucide Icons
- **Backend** : API REST en NestJS avec TypeScript et Prisma ORM
- **GPS Receiver** : Service de traitement des données GPS en Go pour la communication avec les boîtiers GPS

Le système utilise deux bases de données PostgreSQL distinctes :
- Une base **PostgreSQL** pour les données applicatives (utilisateurs, entités, notifications, etc.)
- Une base **TimescaleDB** pour les données de géolocalisation GPS optimisées pour les séries temporelles

## 🏗️ Architecture du Projet

```
📦 geolock/
├── 📁 apps/
│   ├── 📁 geolock-frontend/     # Application Next.js
│   ├── 📁 geolock-backend/      # API NestJS
│   └── 📁 gps_receiver/         # Service Go
├── 📄 docker-compose.yml        # Configuration Docker
├── 📄 .env                      # Variables d'environnement
└── 📄 README.md
```

## 🚀 Démarrage Rapide

### 1️⃣ Prérequis

- **Docker** et **Docker Compose**
- **Node.js** (pour le développement local)
- **Go** (pour le développement du service GPS)

### 2️⃣ Configuration

1. Copiez le fichier `.env` du discord dans le projet à la racine :


2. Modifiez les variables d'environnement selon vos besoins dans le fichier `.env`.

### 3️⃣ Lancement des Services

```bash
# Démarrer tous les services
docker compose up --build

# Ou en arrière-plan
docker compose up --build -d
```

### 4️⃣ Initialisation des Données

Une fois les services démarrés, initialisez les données de test :

```bash
# Seed de la base PostgreSQL principale
docker compose exec geolock-backend npm run seed

# Redémarrer le seeder TimescaleDB pour générer les données GPS
docker compose restart timescale-seeder
```

## 🔧 Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | `3000` | Interface utilisateur Next.js |
| **Backend** | `3001` | API NestJS |
| **GPS Receiver** | `42612` | Service Go pour données GPS (port TCP Teltonika) |
| **PostgreSQL** | `${POSTGRES_PORT}` | Base de données principale |
| **TimescaleDB** | `${POSTGRES_TIMESCALE_PORT}` | Base de données GPS |
| **Adminer** | `8080` | Interface d'administration DB |
| **Prisma Studio** | `${PRISMA_PORT}` | Interface Prisma |

## 🗄️ Bases de Données

### PostgreSQL Principal
Contient les données applicatives :
- Utilisateurs et authentification
- Entités (clients, partenaires)
- Notifications et préférences
- Moteurs et boîtiers GPS
- Rôles et permissions

### TimescaleDB
Optimisée pour les données de géolocalisation :
- Table `log_traceur` pour les positions GPS
- Indexation temporelle pour les performances
- Stockage des données IoT des boîtiers

## 🔄 Migrations Prisma

Le backend utilise deux schémas Prisma distincts :

```bash
# Migration de la base PostgreSQL principale
npx prisma migrate dev --schema prisma/schema-postgres.prisma

# Migration de la base TimescaleDB
npx prisma migrate dev --schema prisma/schema-timescale.prisma
```

## 📊 Données de Test

### Seed PostgreSQL
Le seed crée automatiquement :
- **Rôles** : 3 role differents
- **Entités** : 4 entités de test (clients, partenaires, interne)
- **Utilisateurs** : 7 utilisateurs avec différents rôles
- **Boîtiers GPS** : 1-2 boîtiers par utilisateur avec IMEI unique
- **Données** : Notifications, cookies, historiques de connexion

### Seed TimescaleDB (Automatique)
Le service `timescale-seeder` génère automatiquement :
- Points GPS réalistes pour chaque IMEI
- Trajectoires simulées (mouvement de véhicule)
- Données horodatées sur plusieurs jours
- Paramètres configurables via `SEED_POINTS_PER_IMEI`

## 🛠️ Développement

### Frontend (Next.js)
```bash
cd apps/geolock-frontend
npm install
npm run dev
```

Technologies utilisées :
- **Next.js** : Framework React
- **Tailwind CSS** : Styling
- **ShadCN** : Composants UI
- **Lucide Icons** : Iconographie

### Backend (NestJS)
```bash
cd apps/geolock-backend
npm install
npm run start:dev
```

Technologies utilisées :
- **NestJS** : Framework Node.js
- **Prisma** : ORM
- **TypeScript** : Langage principal
- **Deux clients Prisma** : PostgreSQL et TimescaleDB

### GPS Receiver (Go)
```bash
cd apps/gps_receiver
go mod tidy
go run main.go
```

Fonctionnalités :
- **Communication TCP** sur port 42612 (protocole Teltonika)
- **Parsing des données GPS** en temps réel
- **ETL vers TimescaleDB** avec optimisation des performances
- **Logging structuré** avec rotation automatique
- **Build multi-stage** pour une image optimisée

## 🐳 Services Docker

### Frontend (Next.js)
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
EXPOSE 3000
CMD ["npm","run","dev"]
```

### Backend (NestJS)
```dockerfile
FROM node:20-alpine
WORKDIR /app
# Dépendances pour bcrypt
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm install
COPY . .
# Génération des deux clients Prisma
RUN npx prisma generate --schema=./prisma/schema-postgres.prisma
RUN npx prisma generate --schema=./prisma/schema-timescale.prisma
EXPOSE 3001
CMD ["npm","run","start:dev"]
```

### GPS Receiver (Go)
```dockerfile
# Build multi-stage pour optimiser la taille
FROM golang:1.21.6-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o teltonika-server

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/teltonika-server /app/teltonika-server
EXPOSE 42612
CMD ["./teltonika-server"]
```

## 📝 Logs & Monitoring

- **Logs GPS** : Stockés dans `./logs/` (volume Docker)
- **Logs Docker** : Rotation automatique (10MB, 3 fichiers)
- **Health Checks** : TimescaleDB avec vérification de santé
- **Adminer** : Interface web pour explorer les bases de données

## 🔐 Sécurité

- **Variables d'environnement** : Toutes les configurations sensibles
- **Hachage des mots de passe** : bcrypt avec salt
- **Tokens JWT** : Pour l'authentification
- **Validation des données** : Côté frontend et backend
- **CORS** : Configuration restrictive

## 🚀 Déploiement

### Production
```bash
# Build et démarrage optimisé
docker compose -f docker-compose.prod.yml up --build -d
```

## 🔧 Maintenance

### Sauvegarde des données
```bash
# Sauvegarde PostgreSQL
docker compose exec postgres_app pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql

# Sauvegarde TimescaleDB
docker compose exec timescaledb pg_dump -U $POSTGRES_TIMESCALE_USER $POSTGRES_TIMESCALE_DB > backup_gps.sql
```

### Nettoyage
```bash
# Arrêt des services
docker compose down

# Nettoyage des volumes (⚠️ Supprime les données)
docker compose down -v

# Nettoyage des images
docker system prune -a
```

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de connexion base de données**
   ```bash
   docker compose logs postgres_app
   docker compose logs timescaledb
   ```

2. **Problème de migration Prisma**
   ```bash
   docker compose exec geolock-backend npx prisma migrate reset
   ```

3. **Service GPS ne démarre pas**
   ```bash
   docker compose logs gps_receiver
   ```

### Commandes utiles
```bash
# Vérifier l'état des services
docker compose ps

# Redémarrer un service spécifique
docker compose restart geolock-backend

# Accéder au shell d'un container
docker compose exec geolock-backend bash
```

## 📈 Performances

- **TimescaleDB** : Optimisé pour les séries temporelles GPS
- **Indexation** : Sur IMEI, timestamp, et coordonnées
- **Compression** : Automatique des données anciennes
- **Requêtes** : Optimisées pour les plages temporelles


---

## 📞 Support

Pour toute question ou problème, consultez :
- Les logs Docker : `docker compose logs [service]`
- L'interface Adminer : `http://localhost:8080`
- Prisma Studio : `http://localhost:${PRISMA_PORT}`
