# AANID — Documentation Backend : Authentification & Profil

**Partie 8 — Responsable : Will-David**
**Fichier source :** `w-d/backend/src/server.js`
**Package :** `@aanid/w-d-backend`

---

## Table des matieres

1. [Vue d'ensemble](#1-vue-densemble)
2. [Dependances](#2-dependances)
3. [Variables d'environnement](#3-variables-denvironnement)
4. [Integration a l'application principale](#4-integration-a-lapplication-principale)
5. [Structure de donnees utilisateur](#5-structure-de-donnees-utilisateur)
6. [Roles et abonnements](#6-roles-et-abonnements)
7. [Reference des routes API](#7-reference-des-routes-api)
8. [Systeme de securite](#8-systeme-de-securite)
9. [Middlewares exportes](#9-middlewares-exportes)
10. [Feuille de route production](#10-feuille-de-route-production)

---

## 1. Vue d'ensemble

Ce module expose un **routeur Express** qui gere l'integralite des operations d'authentification et de gestion de profil de l'application AANID. Il est concu pour etre monte dans l'application principale sans aucune modification de son code interne.

Le module fournit :

- L'inscription avec verification d'email obligatoire
- La connexion avec emission d'un couple access token / refresh token
- Le renouvellement silencieux des tokens (rotation)
- La deconnexion avec invalidation du refresh token cote serveur
- La verification d'email et le renvoi du lien
- La reinitialisation de mot de passe par lien email
- La lecture et la mise a jour du profil
- Le changement de mot de passe authentifie
- La gestion des abonnements (lecture publique, mise a jour admin uniquement)
- Deux middlewares reutilisables par les autres modules : `authenticateToken` et `authorizeRoles`

---

## 2. Dependances

```json
{
  "express": "^4.18.2",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2"
}
```

Le module utilise egalement `crypto` de la bibliotheque standard Node.js (aucune installation requise) pour la generation des tokens opaques.

---

## 3. Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `AANID_ACCESS_SECRET` | **Oui en production** | Cle secrete pour la signature des access tokens JWT. Minimum 64 caracteres aleatoires. |
| `AANID_REFRESH_SECRET` | **Oui en production** | Cle secrete pour la signature des refresh tokens JWT. Doit etre differente de la precedente. |
| `NODE_ENV` | Non | En mode `production`, l'absence des secrets arrete le processus. En dehors, des valeurs de developpement sont utilisees et les tokens sont affiches dans les logs. |

**Generation des secrets (bash) :**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Executer cette commande deux fois pour obtenir deux secrets distincts.

**Exemple de fichier `.env` :**

```
AANID_ACCESS_SECRET=a3f8e1...64_caracteres_minimum...
AANID_REFRESH_SECRET=b7c2d0...64_caracteres_minimum...
NODE_ENV=production
```

---

## 4. Integration a l'application principale

### 4.1 Montage du routeur

Dans le fichier serveur principal de l'application AANID, importer et monter le routeur de ce module :

```js
const express = require('express');
const app = express();

// Middleware JSON obligatoire avant de monter le routeur
app.use(express.json());

// Montage du module authentification & profil
const authRouter = require('@aanid/w-d-backend');
app.use('/api', authRouter);
```

Toutes les routes du module seront disponibles sous le prefixe `/api`. Par exemple :

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile`

### 4.2 Protection des routes des autres modules

Les autres responsables de module peuvent proteger leurs propres routes en important les middlewares exportes :

```js
const { authenticateToken, authorizeRoles, ROLES } = require('@aanid/w-d-backend');

// Route accessible a tout utilisateur connecte
router.get('/villes', authenticateToken, (req, res) => {
  // req.user contient : { sub, email, role, subscription, iat, exp }
  res.json({ message: `Bonjour ${req.user.email}` });
});

// Route accessible uniquement aux administrateurs
router.patch('/admin/action', authenticateToken, authorizeRoles(ROLES.ADMIN), (req, res) => {
  res.json({ ok: true });
});

// Route accessible a plusieurs roles
router.post('/signalement', authenticateToken, authorizeRoles(ROLES.CITOYEN, ROLES.PROFESSIONNEL, ROLES.AUTORITE), (req, res) => {
  res.json({ ok: true });
});
```

### 4.3 Lire les informations de l'utilisateur dans une route protegee

Apres le passage par `authenticateToken`, l'objet `req.user` est disponible avec la structure suivante :

```js
{
  sub: "uuid-de-l-utilisateur",   // identifiant unique
  email: "utilisateur@exemple.com",
  role: "CITOYEN",                // voir section 6
  subscription: "FREE",           // voir section 6
  iat: 1700000000,               // timestamp d'emission
  exp: 1700000900                // timestamp d'expiration (15 minutes apres emission)
}
```

---

## 5. Structure de donnees utilisateur

L'objet utilisateur stocke en memoire (et qui sera migre en base de donnees) a la forme suivante :

```js
{
  id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", // UUID v4 genere par crypto.randomUUID()
  fullName: "Kofi Mensah",
  email: "kofi@exemple.com",                   // normalise en minuscules
  passwordHash: "$2b$12$...",                  // jamais expose dans les reponses
  role: "CITOYEN",
  subscription: "FREE",
  emailVerified: false,
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

**Note importante :** le champ `passwordHash` est toujours retire avant tout envoi au client via la fonction interne `safeUser()`. Aucune route n'expose ce champ.

---

## 6. Roles et abonnements

### Roles

| Constante | Valeur | Description |
|---|---|---|
| `ROLES.CITOYEN` | `"CITOYEN"` | Role par defaut a l'inscription |
| `ROLES.PROFESSIONNEL` | `"PROFESSIONNEL"` | Professionnel de la signaletique |
| `ROLES.REGIE` | `"REGIE"` | Regie publicitaire |
| `ROLES.FORMATEUR` | `"FORMATEUR"` | Formateur certifie |
| `ROLES.AUTORITE` | `"AUTORITE"` | Autorite publique ou municipale |
| `ROLES.ADMIN` | `"ADMIN"` | Administrateur plateforme — non assignable a l'inscription |

Le role `ADMIN` ne peut pas etre choisi lors de l'inscription. Il doit etre attribue manuellement en base de donnees.

### Abonnements

| Constante | Valeur | Acces |
|---|---|---|
| `SUBSCRIPTIONS.FREE` | `"FREE"` | Attribue par defaut a l'inscription |
| `SUBSCRIPTIONS.PREMIUM` | `"PREMIUM"` | Toutes les villes, formations gratuites, signalements illimites |
| `SUBSCRIPTIONS.PROFESSIONAL` | `"PROFESSIONAL"` | Relais publicitaires, statistiques avancees |
| `SUBSCRIPTIONS.ENTERPRISE` | `"ENTERPRISE"` | Acces complet, API dediee, support prioritaire |

La mise a jour d'abonnement est reservee au role `ADMIN` via `PATCH /profile/subscription`.

---

## 7. Reference des routes API

Toutes les routes retournent du JSON. Les corps de requete sont en JSON (`Content-Type: application/json`).

Les routes protegees requierent le header :
```
Authorization: Bearer <access_token>
```

---

### 7.1 Authentification

#### POST /auth/register

Cree un nouveau compte. Le role `ADMIN` ne peut pas etre demande via cette route.

**Corps de la requete :**

```json
{
  "fullName": "Kofi Mensah",
  "email": "kofi@exemple.com",
  "password": "MonMotDePasse1!",
  "role": "CITOYEN"
}
```

| Champ | Type | Obligatoire | Contraintes |
|---|---|---|---|
| `fullName` | string | Oui | 2 a 100 caracteres |
| `email` | string | Oui | Format email valide, normalise en minuscules |
| `password` | string | Oui | 8 a 128 caracteres, 1 majuscule, 1 minuscule, 1 chiffre, 1 special parmi `@$!%*?&-_#` |
| `role` | string | Non | Valeur parmi les roles (sauf `ADMIN`). Defaut : `CITOYEN` |

**Reponse 201 Created :**

```json
{
  "message": "Compte cree. Verifiez votre email pour activer votre compte.",
  "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

**Reponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "..." }` | Champ manquant ou validation echouee |
| 409 | `{ "error": "Cet email est deja utilise" }` | Email deja enregistre |
| 500 | `{ "error": "Erreur serveur" }` | Erreur interne |

**Comportement de securite :** si l'email existe deja, un hachage bcrypt est quand meme execute avant de repondre 409, afin d'eliminer toute difference de temps observable par un attaquant.

---

#### POST /auth/login

Authentifie un utilisateur. Retourne un couple access token / refresh token.

**Corps de la requete :**

```json
{
  "email": "kofi@exemple.com",
  "password": "MonMotDePasse1!"
}
```

**Reponse 200 OK :**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "fullName": "Kofi Mensah",
    "email": "kofi@exemple.com",
    "role": "CITOYEN",
    "subscription": "FREE",
    "emailVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Reponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "Email et mot de passe requis" }` | Champ manquant |
| 401 | `{ "error": "Identifiants incorrects" }` | Email inconnu ou mot de passe errone |
| 403 | `{ "error": "...", "code": "EMAIL_NOT_VERIFIED" }` | Email non encore verifie |
| 429 | `{ "error": "Trop de tentatives..." }` | Rate limit depasse (5 tentatives / 15 min par IP) |

**Tokens emis :**

- Access token : JWT HS256, expire dans **15 minutes**, contient `sub`, `email`, `role`, `subscription`
- Refresh token : JWT HS256, expire dans **7 jours**, contient uniquement `sub`

---

#### POST /auth/refresh

Renouvelle le couple de tokens. L'ancien refresh token est immediatement invalide (rotation).

**Corps de la requete :**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Reponse 200 OK :**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Reponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "Refresh token requis" }` | Corps vide ou type incorrect |
| 401 | `{ "error": "Refresh token invalide ou revoque" }` | Token inconnu du serveur |
| 401 | `{ "error": "Refresh token expire ou invalide" }` | Signature invalide ou expiration depassee |

---

#### POST /auth/logout

Invalide le refresh token cote serveur. Necessite un access token valide.

**Header requis :** `Authorization: Bearer <access_token>`

**Corps de la requete :**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Reponse 200 OK :**

```json
{
  "message": "Deconnexion reussie"
}
```

---

#### GET /auth/verify-email/:token

Active le compte en verifiant le token envoye par email. Le token est a usage unique et expire au bout de 24 heures.

**Parametre d'URL :** `:token` — chaine hexadecimale de 64 caracteres

**Reponse 200 OK :**

```json
{
  "message": "Email verifie avec succes. Vous pouvez vous connecter."
}
```

**Reponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "Lien de verification invalide ou expire" }` | Token inconnu ou TTL depasse |
| 404 | `{ "error": "Compte introuvable" }` | Utilisateur supprime entre temps |

---

#### POST /auth/resend-verification

Genere et envoie un nouveau token de verification. Rate limite a 3 envois par heure par IP.

**Corps de la requete :**

```json
{
  "email": "kofi@exemple.com"
}
```

**Reponse 200 OK (toujours le meme message, meme si l'email n'existe pas) :**

```json
{
  "message": "Si un compte non verifie existe, un email a ete envoye."
}
```

---

#### POST /auth/forgot-password

Initie la reinitialisation de mot de passe. Rate limite a 3 demandes par heure par IP.

**Corps de la requete :**

```json
{
  "email": "kofi@exemple.com"
}
```

**Reponse 200 OK (toujours le meme message) :**

```json
{
  "message": "Si un compte existe, un email de reinitialisation a ete envoye."
}
```

---

#### POST /auth/reset-password

Reinitialise le mot de passe avec le token recu par email. Invalide toutes les sessions actives de l'utilisateur.

**Corps de la requete :**

```json
{
  "token": "a3f8e1...64_caracteres...",
  "newPassword": "NouveauMotDePasse1!"
}
```

**Reponse 200 OK :**

```json
{
  "message": "Mot de passe reinitialise avec succes."
}
```

**Reponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "..." }` | Token manquant, expire ou mot de passe invalide |
| 404 | `{ "error": "Compte introuvable" }` | Utilisateur supprime entre temps |

---

### 7.2 Profil

Toutes les routes profil necessitent `Authorization: Bearer <access_token>`.

---

#### GET /profile

Retourne le profil de l'utilisateur connecte.

**Reponse 200 OK :**

```json
{
  "user": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "fullName": "Kofi Mensah",
    "email": "kofi@exemple.com",
    "role": "CITOYEN",
    "subscription": "FREE",
    "emailVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

#### PATCH /profile

Met a jour le profil de l'utilisateur connecte. Seuls les champs envoyes sont modifies.

**Corps de la requete :**

```json
{
  "fullName": "Kofi Yaw Mensah"
}
```

| Champ | Type | Contraintes |
|---|---|---|
| `fullName` | string | 2 a 100 caracteres |

**Reponse 200 OK :** meme structure que `GET /profile`.

---

#### PATCH /profile/password

Change le mot de passe de l'utilisateur connecte. Rate limite a 3 tentatives par 30 minutes (cle composee de l'ID utilisateur et de l'IP). Invalide tous les refresh tokens actifs de l'utilisateur sur tous ses appareils.

**Corps de la requete :**

```json
{
  "currentPassword": "AncienMotDePasse1!",
  "newPassword": "NouveauMotDePasse2@"
}
```

**Reponse 200 OK :**

```json
{
  "message": "Mot de passe modifie. Reconnectez-vous sur vos autres appareils."
}
```

**Reponses d'erreur :**

| Code | Corps | Cause |
|---|---|---|
| 400 | `{ "error": "..." }` | Champ manquant, mot de passe invalide, ou identique a l'actuel |
| 401 | `{ "error": "Mot de passe actuel incorrect" }` | Mauvais mot de passe actuel |
| 429 | `{ "error": "..." }` | Rate limit depasse |

---

#### GET /profile/subscription

Retourne le niveau d'abonnement actuel de l'utilisateur avec ses fonctionnalites.

**Reponse 200 OK :**

```json
{
  "subscription": "FREE",
  "details": {
    "label": "Gratuit",
    "color": "#BDBDBD",
    "features": [
      "Acces aux villes publiques",
      "Consultation de base",
      "Signalement limite"
    ]
  }
}
```

---

#### PATCH /profile/subscription

Met a jour l'abonnement d'un utilisateur. **Reserve au role `ADMIN` uniquement.**

**Corps de la requete :**

```json
{
  "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "subscription": "PREMIUM"
}
```

**Reponse 200 OK :**

```json
{
  "message": "Abonnement mis a jour vers PREMIUM",
  "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "subscription": "PREMIUM"
}
```

**Reponse 403 si le role n'est pas ADMIN :**

```json
{
  "error": "Acces refuse : droits insuffisants"
}
```

---

## 8. Systeme de securite

### 8.1 Hachage des mots de passe

bcrypt est utilise avec un facteur de cout de **12 rounds**. Ce niveau offre un bon equilibre entre resistance aux attaques par force brute (chaque hash prend environ 300-400 ms) et performance serveur.

### 8.2 Tokens JWT

Les tokens sont signes avec l'algorithme **HS256** et incluent les claims `issuer: 'aanid'` et `audience: 'aanid-app'` pour empecher la reutilisation de tokens d'une autre application.

- **Access token** : duree de vie 15 minutes. Contient le role et l'abonnement pour eviter des requetes base de donnees supplementaires sur chaque appel protege.
- **Refresh token** : duree de vie 7 jours. Contient uniquement l'identifiant utilisateur. Stocke cote serveur dans un `Set` pour permettre l'invalidation.
- **Rotation des refresh tokens** : a chaque appel de `/auth/refresh`, l'ancien token est supprime et un nouveau couple est emis. Un refresh token ne peut donc etre utilise qu'une seule fois.

### 8.3 Protection contre les attaques temporelles

Sur `/auth/login`, si l'email n'existe pas, un `bcrypt.hash()` complet est quand meme execute avant de repondre. Cela garantit que le temps de reponse est identique qu'un email existe ou non, rendant l'enumeration d'emails impossible par mesure de temps.

### 8.4 Masquage des informations sensibles

Les routes `/auth/resend-verification`, `/auth/forgot-password` retournent toujours le meme message de succes generique, que l'email existe ou non. Cela empeche un attaquant de detecter si une adresse email est enregistree.

### 8.5 Rate limiting

Le rate limiting est implemente en memoire par cle de partition. En production, il doit etre remplace par `express-rate-limit` avec un store Redis pour fonctionner en environnement multi-instances.

| Route | Cle | Limite | Fenetre |
|---|---|---|---|
| `POST /auth/login` | `login:<ip>` | 5 tentatives | 15 minutes |
| `POST /auth/resend-verification` | `resend:<ip>` | 3 envois | 60 minutes |
| `POST /auth/forgot-password` | `pwd-reset:<ip>` | 3 demandes | 60 minutes |
| `PATCH /profile/password` | `pwd-change:<userId>:<ip>` | 3 tentatives | 30 minutes |

Les entrees expirees sont nettoyees automatiquement toutes les heures via `setInterval`.

### 8.6 Tokens opaques

Les tokens de verification d'email et de reinitialisation de mot de passe sont generes avec `crypto.randomBytes(32)` (256 bits d'entropie). Ils ne sont pas des JWT : ils n'encodent aucune information et sont valides uniquement par leur presence dans le `Map` interne associe a une entree non expiree.

### 8.7 Validation des entrees

| Champ | Regle |
|---|---|
| Email | Regex stricte, longueur locale max 64, domaine max 253 |
| Mot de passe | 8-128 caracteres, au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 caractere special parmi `@$!%*?&-_#` |
| Nom complet | 2 a 100 caracteres, espaces autorises |
| Email normalise | `toLowerCase()` + `trim()` avant toute verification ou stockage |

### 8.8 Invalidation de session sur changement de mot de passe

Lors d'un changement de mot de passe (via `PATCH /profile/password` ou `POST /auth/reset-password`), **tous les refresh tokens actifs** de l'utilisateur concerne sont revokes. Tout appareil ou session ouverte avec ce compte sera force a se reconnecter.

---

## 9. Middlewares exportes

Le module exporte les elements suivants en plus du routeur principal :

```js
const authRouter = require('@aanid/w-d-backend');

// Routeur principal (usage : app.use('/api', authRouter))
authRouter

// Objet des roles (freeze, en lecture seule)
authRouter.ROLES
// => { CITOYEN, PROFESSIONNEL, REGIE, FORMATEUR, AUTORITE, ADMIN }

// Objet des abonnements (freeze, en lecture seule)
authRouter.SUBSCRIPTIONS
// => { FREE, PREMIUM, PROFESSIONAL, ENTERPRISE }

// Middleware : verifie le Bearer token et injecte req.user
authRouter.authenticateToken

// Factory de middleware : verifie que req.user.role est dans la liste
authRouter.authorizeRoles(...roles)
```

**Exemple d'utilisation combine :**

```js
const {
  authenticateToken,
  authorizeRoles,
  ROLES,
  SUBSCRIPTIONS
} = require('@aanid/w-d-backend');

// Accessible a tout abonne PREMIUM ou superieur
// (la logique metier du filtre abonnement est a implementer dans la route)
router.get('/formations/premium',
  authenticateToken,
  (req, res, next) => {
    const allowed = [SUBSCRIPTIONS.PREMIUM, SUBSCRIPTIONS.PROFESSIONAL, SUBSCRIPTIONS.ENTERPRISE];
    if (!allowed.includes(req.user.subscription)) {
      return res.status(403).json({ error: 'Abonnement Premium requis' });
    }
    next();
  },
  formationsController.getPremium
);
```

---

## 10. Feuille de route production

Les elements suivants sont marques comme a implementer avant mise en production.

### 10.1 Remplacement des stores en memoire par Prisma

Les quatre `Map` et le `Set` internes doivent etre remplaces par des modeles Prisma. Les modeles sugeres sont :

**Schema Prisma :**

```prisma
model User {
  id            String   @id @default(uuid())
  fullName      String
  email         String   @unique
  passwordHash  String
  role          Role     @default(CITOYEN)
  subscription  Subscription @default(FREE)
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  refreshTokens RefreshToken[]
  verificationTokens EmailVerificationToken[]
  passwordResetTokens PasswordResetToken[]
}

model RefreshToken {
  token     String   @id
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model EmailVerificationToken {
  token     String   @id
  email     String
  expiresAt DateTime
}

model PasswordResetToken {
  token     String   @id
  email     String
  expiresAt DateTime
}

enum Role {
  CITOYEN
  PROFESSIONNEL
  REGIE
  FORMATEUR
  AUTORITE
  ADMIN
}

enum Subscription {
  FREE
  PREMIUM
  PROFESSIONAL
  ENTERPRISE
}
```

### 10.2 Service d'envoi d'emails

Les deux endroits marques `TODO` dans le code doivent appeler un service transactionnel (SendGrid, Resend, Mailgun) :

- Apres inscription : envoi du lien `https://app.aanid.com/verify-email/<token>`
- Apres demande de reinitialisation : envoi du lien `https://app.aanid.com/reset-password/<token>`

### 10.3 Rate limiting distribue

Remplacer le rate limiter en memoire par `express-rate-limit` + `rate-limit-redis` pour fonctionner sur plusieurs instances du serveur :

```bash
npm install express-rate-limit rate-limit-redis ioredis
```

### 10.4 Headers de securite HTTP

Ajouter `helmet` dans l'application principale pour proteger contre les attaques courantes (XSS, clickjacking, sniffing MIME) :

```js
const helmet = require('helmet');
app.use(helmet());
```

### 10.5 CORS

Configurer CORS dans l'application principale avec une liste blanche explicite :

```js
const cors = require('cors');
app.use(cors({
  origin: ['https://app.aanid.com'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
```
