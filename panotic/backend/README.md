# 🛠️ Panotic Backend

**API Core de la Plateforme Panotic**

Ce répertoire contient le backend de l'application Panotic, conçu pour offrir performance, scalabilité et une gestion avancée des données géospatiales.

---

## 🛠 Stack Technique

- **Runtime** : [Node.js](https://nodejs.org/) (Express.js)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Base de données** : PostgreSQL avec l'extension **PostGIS** pour les requêtes géospatiales.
- **ORM** : [Prisma](https://www.prisma.io/)
- **Validation** : [Zod](https://zod.dev/)
- **Sécurité** : JWT (JSON Web Tokens) & Bcrypt

---

## 📂 Structure du Projet

```text
src/
├── controllers/    # Logique de traitement des requêtes
├── middlewares/    # Middlewares (Auth, Validation, Error handling)
├── routes/         # Définition des points d'entrée de l'API
├── services/       # Services métier (interaction DB, calculs)
└── index.ts        # Point d'entrée de l'application
prisma/
├── schema.prisma   # Modèle de données
└── seed.ts         # Données initiales de test
```

---

## 🚀 Installation & Lancement

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Configuration de l'environnement**
   Créez un fichier `.env` à la racine en vous basant sur `.env.example` :
   ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/aanid?schema=public"
   JWT_SECRET="votre_secret_super_secure"
   PORT=3000
   ```

3. **Préparation de la base de données**
   ```bash
   # Générer le client Prisma
   npx prisma generate

   # Appliquer les migrations
   npx prisma migrate dev

   # Insérer les données de base (Seed)
   npx prisma db seed
   ```

4. **Démarrage**
   ```bash
   # Mode développement
   npm run dev

   # Production
   npm run build
   npm start
   ```

---

## 📡 Endpoints Principaux

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Inscription utilisateur |
| `POST` | `/auth/login` | Connexion et obtention du token |
| `GET` | `/signalements` | Liste des signalements (avec filtres géo) |
| `POST` | `/signalements` | Créer un nouveau signalement |
| `GET` | `/formations` | Catalogue des formations disponibles |
| `GET` | `/ugc/feed` | Fil d'actualité communautaire |

---

## 🛡️ Sécurité

Toutes les routes sensibles sont protégées par un middleware d'authentification. Le token JWT doit être passé dans le header `Authorization: Bearer <token>`.

---

© 2025 Panotic Backend Team.
