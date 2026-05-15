# 📱 Panotic Mobile App

**L'application mobile de référence pour la panneautique urbaine.**

Développée avec **React Native**, l'application Panotic offre une expérience fluide et intuitive pour les citoyens, les professionnels et les régies publicitaires.

---

## ✨ Fonctionnalités Clés

- 🗺️ **Carte Interactive** : Visualisation en temps réel du mobilier urbain avec clustering.
- 📸 **Signalement Citoyen** : Prise de photo/vidéo et signalement géolocalisé des dégradations.
- 🎓 **Centre de Formation** : Accès à des cours certifiants avec paiement mobile money intégré.
- 📣 **Fil Social (UGC)** : Partage de contenus sur l'environnement et le cadre de vie.
- 💼 **Gestion Publicitaire** : Consultation et réservation d'espaces publicitaires.
- 📡 **Mode Hors-ligne** : Utilisation de l'application même sans connexion internet stable.

---

## 🛠 Stack Technique

- **Framework** : React Native (0.84.1)
- **Langage** : TypeScript
- **State Management** : Redux Toolkit & RTK Query (pour le cache API)
- **Navigation** : React Navigation 7
- **Cartographie** : React Native Maps + Clusturing
- **Style** : Design moderne avec palette Navy Blue & Orange
- **Outils Dev** : Vite & React Native Web (pour le preview rapide)

---

## 🚀 Développement

### Prérequis
- Node.js >= 22
- Environnement de développement Android/iOS configuré

### Installation
```bash
npm install
```

### Exécution sur Navigateur (Mode rapide)
Pour tester l'UI et la logique sans émulateur lourd :
```bash
npm run dev
```
*Accès via `http://localhost:8080`*

### Exécution sur Appareil / Émulateur
```bash
# Lancer Metro
npm start

# Android
npm run android

# iOS
npm run ios
```

---

## 📂 Structure des Sources

```text
src/
├── api/            # RTK Query API definitions
├── components/     # Composants UI réutilisables (Atomique)
├── constants/      # Couleurs, thèmes, config
├── features/       # Slices Redux par domaine
├── hooks/          # Hooks personnalisés
├── navigation/     # Configuration des navigateurs
├── screens/        # Écrans principaux de l'application
└── utils/          # Fonctions utilitaires (Géo, Formatage)
```

---

## 🧪 Tests & Qualité
- **Linting** : ESLint & Prettier
- **Tests** : Jest & React Test Renderer

---

© 2025 Panotic Mobile Team.
