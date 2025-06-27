# 🚀 Hackathon - Plateforme IA & Prestataires

## 📝 Présentation

Ce projet est une plateforme web composée de deux applications principales :

- **Frontend** : Application Next.js (React, TypeScript, Tailwind CSS, Shadcn, Lucide Icons)
- **Backend** : API NestJS (TypeScript, Prisma ORM, PostgreSQL)

L'objectif est de fournir une interface moderne pour la gestion d'agents IA, de prestataires, d'utilisateurs et d'organisations, avec une authentification sécurisée JWT.

---

## 🗂️ Structure du projet

```
hackathon/
├── apps/
│   ├── backend/    # API NestJS (Prisma, PostgreSQL)
│   └── frontend/   # Application Next.js (UI)
├── docker-compose.yml
├── readme.md
```

---

## ⚡ Démarrage rapide

### 1️⃣ Prérequis
- Node.js >= 18
- Docker & Docker Compose
- PostgreSQL (ou utiliser le service Docker inclus)

### 2️⃣ Lancer en développement

#### Backend
```bash
cd apps/backend
npm install
npm run start:dev
```

#### Frontend
```bash
cd apps/frontend
npm install
npm run dev
```

#### Accès
- Frontend : http://localhost:3000
- Backend : http://localhost:3001

### 3️⃣ Lancer avec Docker

```bash
docker compose up --build
```

---

## 🛠️ Technologies principales
- **Frontend** : Next.js, React, TypeScript, Tailwind CSS, Shadcn, Lucide Icons
- **Backend** : NestJS, TypeScript, Prisma ORM, PostgreSQL

---

## 🗃️ Commandes utiles

### Backend
- `sh backend` : être dans le container
- `npx prisma generate` : Lancer la generation des models Prisma
- `npx prisma db push` : Pousser la nouvelle db sur Prisma
- `npm run seed` : Peupler la base avec des données de test

### Frontend
- `npm run dev` : Démarrer Next.js en mode développement
- `npm run build` : Build de production

---

## 📁 Fonctionnalités principales
- Authentification JWT (cookie sécurisé)
- Gestion des utilisateurs, rôles, organisations, agents IA, prestataires
- Interface admin et espace utilisateur
- UI moderne et responsive

---

## 📦 Structure des dossiers

- `apps/backend/` : Code source de l'API (NestJS, Prisma, migrations, seed)
- `apps/frontend/` : Code source du frontend (Next.js, composants, hooks, contextes)

---

## 📝 Auteurs
- Willy PHANG
- Marion Groliere 
- Mohammed Achraf KHERRAZ
- Youri Ghlis 
- Matiss Haillouy
- Projet hackathon 5IW 2025
