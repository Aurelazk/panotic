# AANID 🌍

**Plateforme de Transformation Urbaine & Numérique**

AANID est une solution innovante dédiée à la modernisation de l'affichage extérieur et du mobilier urbain en Afrique de l'Ouest. Elle allie technologie géospatiale, formation professionnelle et engagement citoyen pour transformer le paysage urbain.

---

## 🚀 Vision du Projet

AANID vise à devenir le référent panafricain de la panneautique moderne et responsable à travers quatre piliers stratégiques :
1. **Cartographie en temps réel** : Inventaire géolocalisé du mobilier urbain.
2. **Formation & Certification** : Professionnalisation du secteur via des cours accessibles.
3. **Relais Publicitaire** : Mise en relation directe entre régies et annonceurs.
4. **Impact Social & Environnemental** : Signalement citoyen des dégradations et cadre de vie sain.

---

## 📂 Structure du Répertoire

Le projet est divisé en deux parties principales :

### 🔹 [Backend](./backend)
API REST robuste construite avec **Node.js** et **Express**.
- **Langage** : TypeScript
- **Base de données** : PostgreSQL + PostGIS (Données géospatiales)
- **ORM** : Prisma
- **Authentification** : JWT sécurisé

### 🔹 [Mobile](./mobile)
Application mobile cross-platform performante développée avec **React Native**.
- **Framework** : React Native (iOS & Android)
- **State Management** : Redux Toolkit & RTK Query
- **Navigation** : React Navigation
- **Cartographie** : React Native Maps + Clusturing
- **Web Preview** : Support Vite pour un développement rapide dans le navigateur.

---

## 🛠️ Installation Rapide

Pour commencer à travailler sur le projet :

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-repo/aanid.git
   cd aanid
   ```

2. **Configurer le Backend**
   ```bash
   cd backend
   npm install
   # Configurez votre .env (voir backend/.env.example)
   npx prisma migrate dev
   npm run dev
   ```

3. **Configurer le Mobile**
   ```bash
   cd ../mobile
   npm install
   # Pour le développement web rapide
   npm run dev
   # Pour lancer sur Android/iOS
   npm run android # ou npm run ios
   ```

---

## 📄 Documentation

Toute la documentation technique et stratégique se trouve dans le dossier [`/docs`](./docs) :
- [Cahier des Charges Technique](./docs/cahier.txt)
- [Coûts de Lancement](./docs/aanid_couts_lancement.txt)

---

© 2025 AANID. Tous droits réservés. Confidentiel.
