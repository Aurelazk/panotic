# AANID — Documentation Frontend : Authentification & Profil

**Partie 8 — Responsable : Will-David**
**Package :** `@aanid/w-d-frontend`
**Technologie :** React Native 0.76 / React 18

---

## Table des matieres

1. [Vue d'ensemble](#1-vue-densemble)
2. [Structure des fichiers](#2-structure-des-fichiers)
3. [Dependances](#3-dependances)
4. [Configuration de l'URL de l'API](#4-configuration-de-lurl-de-lapi)
5. [Integration dans l'application principale](#5-integration-dans-lapplication-principale)
6. [Composants exposes](#6-composants-exposes)
7. [Contexte d'authentification](#7-contexte-dauthentification)
8. [Service authService](#8-service-authservice)
9. [Systeme de theme](#9-systeme-de-theme)
10. [Gestion des tokens cote client](#10-gestion-des-tokens-cote-client)
11. [Comportements de securite](#11-comportements-de-securite)
12. [Charte graphique appliquee](#12-charte-graphique-appliquee)
13. [Police de caracteres](#13-police-de-caracteres)

---

## 1. Vue d'ensemble

Ce module fournit l'ensemble de la couche interface utilisateur liee a l'authentification et au profil. Il est concu pour etre integre dans l'application principale AANID comme une boite noire : l'application principale monte les ecrans, passe les callbacks, et n'a pas besoin de gerer l'etat des tokens ou les appels API directement.

Le module expose :

- **`Auth`** : ecran complet de connexion et d'inscription avec gestion de la verification email
- **`Profil`** : ecran complet de gestion du profil, du mot de passe et de l'abonnement
- **`AuthProvider`** : contexte React pour propager l'etat d'authentification dans l'arbre de composants
- **`useAuth`** : hook pour lire et modifier l'etat d'authentification depuis n'importe quel ecran

---

## 2. Structure des fichiers

```
w-d/frontend/
├── index.js                          Export public du module
└── src/
    ├── theme.js                      Palette de couleurs, espacements, typographie
    ├── context/
    │   └── AuthContext.js            AuthProvider + useAuth
    ├── services/
    │   └── authService.js            Couche API + gestion des tokens AsyncStorage
    └── screens/
        ├── Auth.js                   Ecran connexion / inscription
        └── Profil.js                 Ecran profil utilisateur
```

---

## 3. Dependances

```json
{
  "react": "18.3.1",
  "react-native": "0.76.3",
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

Aucune bibliotheque de navigation ou de formulaire externe n'est requise. La navigation entre connexion et inscription est geree en interne par l'ecran `Auth`.

---

## 4. Configuration de l'URL de l'API

L'URL de base de l'API est lue depuis la variable d'environnement `EXPO_PUBLIC_API_URL`. Si cette variable est absente, la valeur par defaut `http://localhost:3000` est utilisee.

**Pour Expo :**

```
# .env
EXPO_PUBLIC_API_URL=https://api.aanid.com
```

**Pour React Native CLI :**

La variable doit etre injectee via `react-native-config` ou un mecanisme equivalent, et le fichier `authService.js` doit etre adapte pour lire la variable correctement.

---

## 5. Integration dans l'application principale

### 5.1 Enveloppement avec AuthProvider

L'`AuthProvider` doit envelopper le composant racine de l'application, en dehors de tout navigateur ou ecran, afin que `useAuth` soit disponible partout.

```jsx
import { AuthProvider } from '@aanid/w-d-frontend';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
```

### 5.2 Navigation conditionnelle selon l'etat d'authentification

Le navigateur racine lit l'etat depuis `useAuth` pour afficher soit l'ecran d'authentification, soit l'application principale. L'etat `loading` permet d'afficher un ecran de chargement pendant la restauration de session depuis AsyncStorage.

```jsx
import { useAuth, Auth, Profil } from '@aanid/w-d-frontend';

function RootNavigator() {
  const { isAuthenticated, loading, onLogin, onLogout } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <Auth onAuthenticated={onLogin} />;
  }

  return (
    <Tab.Navigator>
      <Tab.Screen name="Profil">
        {() => <Profil onLogout={onLogout} />}
      </Tab.Screen>
      {/* autres onglets */}
    </Tab.Navigator>
  );
}
```

### 5.3 Protection de routes dans d'autres modules

Les autres modules peuvent verifier l'authentification ou le role avec `useAuth` :

```jsx
import { useAuth } from '@aanid/w-d-frontend';

function FormationsPremiumScreen() {
  const { user } = useAuth();

  if (!['PREMIUM', 'PROFESSIONAL', 'ENTERPRISE'].includes(user?.subscription)) {
    return <UpgradePrompt />;
  }

  return <FormationsListe />;
}
```

---

## 6. Composants exposes

### 6.1 Auth

Ecran d'authentification complet. Il gere en interne les modes connexion, inscription, et attente de verification email.

**Props :**

| Prop | Type | Obligatoire | Description |
|---|---|---|---|
| `onAuthenticated` | `(user: object) => void` | Oui | Appelee apres une connexion reussie, avec l'objet utilisateur retourne par le serveur |

**Modes internes de l'ecran :**

| Mode | Declencheur | Description |
|---|---|---|
| `login` | Etat initial | Formulaire email + mot de passe |
| `register` | Clic sur "S'inscrire" | Formulaire complet avec selection de role |
| `pending` | Apres inscription reussie | Message de confirmation + option de renvoi d'email |

**Fonctionnalites de l'ecran connexion :**

- Validation email et mot de passe avant envoi
- Detection automatique de l'erreur `EMAIL_NOT_VERIFIED` : affiche un bouton de renvoi d'email directement dans le message d'erreur
- Etat de chargement sur le bouton pendant la requete

**Fonctionnalites de l'ecran inscription :**

- Validation de tous les champs avant envoi
- Selection du role via un modal natif (les 5 roles disponibles a l'inscription, `ADMIN` exclu)
- Indicateur de force du mot de passe en temps reel (4 niveaux : Faible, Moyen, Bon, Fort) base sur la presence de majuscule, chiffre, caractere special et longueur
- Confirmation du mot de passe

---

### 6.2 Profil

Ecran de profil complet pour l'utilisateur connecte.

**Props :**

| Prop | Type | Obligatoire | Description |
|---|---|---|---|
| `onLogout` | `() => void` | Non | Appelee apres une deconnexion reussie |

**Sections de l'ecran :**

1. **En-tete** : avatar avec initiales generes depuis le nom complet, nom, email, badges role et abonnement, bouton de modification du profil
2. **Informations personnelles** : nom, email, date d'inscription, statut de verification email
3. **Abonnement** : niveau actuel, liste des fonctionnalites incluses, bouton de mise a niveau si abonnement FREE
4. **Securite** : acces au modal de changement de mot de passe, date de derniere modification
5. **Deconnexion** : bouton avec confirmation native (`Alert.alert`)

**Modal de modification du profil :**

- Champ nom complet pre-rempli avec la valeur actuelle
- Validation locale avant envoi
- Mise a jour immediate de l'affichage apres reponse serveur

**Modal de changement de mot de passe :**

- Champ mot de passe actuel
- Champ nouveau mot de passe avec indicateur de force
- Confirmation du nouveau mot de passe
- Ecran de succes avec rappel que les autres sessions sont invalidees

---

## 7. Contexte d'authentification

### AuthProvider

```jsx
import { AuthProvider } from '@aanid/w-d-frontend';

<AuthProvider>
  {/* enfants */}
</AuthProvider>
```

Au montage, `AuthProvider` lit le dernier utilisateur stocke dans AsyncStorage et hydrate l'etat. La propriete `loading` est `true` pendant cette operation initiale.

### useAuth

```js
import { useAuth } from '@aanid/w-d-frontend';

const {
  user,             // object | null — objet utilisateur sans passwordHash
  loading,          // boolean — true pendant la restauration de session initiale
  isAuthenticated,  // boolean — raccourci pour !!user
  onLogin,          // (user: object) => void — a appeler apres connexion reussie
  onLogout,         // () => Promise<void> — declenche authService.logout() et vide l'etat
  onProfileUpdate,  // (user: object) => void — met a jour user dans le contexte
} = useAuth();
```

**Structure de l'objet `user` :**

```js
{
  id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  fullName: "Kofi Mensah",
  email: "kofi@exemple.com",
  role: "CITOYEN",
  subscription: "FREE",
  emailVerified: true,
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:35:00.000Z"
}
```

**Note :** `useAuth` lance une erreur si appele en dehors d'un `AuthProvider`.

---

## 8. Service authService

Le fichier `src/services/authService.js` est la couche d'abstraction entre les composants et l'API. Il gere le stockage des tokens et le renouvellement automatique.

### Fonctions exportees

| Fonction | Description |
|---|---|
| `register({ fullName, email, password, role })` | Inscrit un nouvel utilisateur |
| `login({ email, password })` | Connecte et stocke les tokens |
| `logout()` | Invalide le refresh token cote serveur et vide AsyncStorage |
| `refreshTokens()` | Renouvelle le couple de tokens |
| `verifyEmail(token)` | Verifie l'email via le token de l'URL |
| `resendVerification({ email })` | Demande le renvoi du lien de verification |
| `forgotPassword({ email })` | Initie la reinitialisation de mot de passe |
| `resetPassword({ token, newPassword })` | Finalise la reinitialisation |
| `getProfile()` | Recupere le profil et met a jour AsyncStorage |
| `updateProfile({ fullName })` | Met a jour le profil et met a jour AsyncStorage |
| `changePassword({ currentPassword, newPassword })` | Change le mot de passe |
| `getSubscription()` | Recupere les details de l'abonnement |
| `getStoredUser()` | Lit l'utilisateur depuis AsyncStorage (sans appel reseau) |
| `isAuthenticated()` | Verifie la presence d'un access token en stockage |

### Renouvellement automatique des tokens

La fonction interne `authRequest` (utilisee par `getProfile`, `updateProfile`, `changePassword`, `getSubscription`) intercepte les erreurs HTTP 401 et tente automatiquement un `refreshTokens()` avant de rejouer la requete originale. L'appelant ne voit jamais cette mecanique.

Si le refresh token est lui aussi expire ou invalide, l'erreur est propagee normalement et l'appelant doit rediriger l'utilisateur vers la connexion.

---

## 9. Systeme de theme

Le fichier `src/theme.js` centralise tous les tokens visuels de la charte graphique AANID.

### Couleurs

```js
import { colors } from '../theme';

colors.primary        // #1E73BE — Bleu AANID, couleur principale Auth & Profil
colors.primaryDark    // #155a94 — Etat presse des boutons primaires
colors.green          // #3BB273 — Succes, formations, indicateur fort
colors.orange         // #F5A623 — Relais, indicateur moyen
colors.red            // #E94E3C — Erreurs, signalements, indicateur faible
colors.textPrimary    // #212121 — Titres et textes principaux
colors.textSecondary  // #6B6B6B — Labels et textes secondaires
colors.placeholder    // #BDBDBD — Placeholders et separateurs
colors.surface        // #F5F5F5 — Fond des cartes et arriere-plans
colors.white          // #FFFFFF
colors.background     // #FFFFFF

// Couleurs par abonnement (pour badges et accents)
colors.subscription.FREE         // #BDBDBD
colors.subscription.PREMIUM      // #1E73BE
colors.subscription.PROFESSIONAL // #F5A623
colors.subscription.ENTERPRISE   // #212121

// Couleurs par role (pour badges)
colors.role.CITOYEN      // #1E73BE
colors.role.PROFESSIONNEL // #3BB273
colors.role.REGIE        // #F5A623
colors.role.FORMATEUR    // #3BB273
colors.role.AUTORITE     // #E94E3C
colors.role.ADMIN        // #212121
```

### Espacements

```js
import { spacing } from '../theme';

spacing.xs   // 4
spacing.sm   // 8
spacing.md   // 16
spacing.lg   // 24
spacing.xl   // 32
```

### Rayons de bordure

```js
import { radius } from '../theme';

radius.button  // 8 — boutons et champs de saisie
radius.card    // 12 — cartes et panneaux
radius.input   // 8 — bordures des champs
radius.badge   // 20 — badges role et abonnement
```

### Typographie

```js
import { typography } from '../theme';

typography.h1      // fontSize: 32, fontWeight: '700', CenturyGothic
typography.h2      // fontSize: 28, fontWeight: '700', CenturyGothic
typography.h3      // fontSize: 22, fontWeight: '700', CenturyGothic
typography.body    // fontSize: 15, fontWeight: '400', CenturyGothic
typography.caption // fontSize: 13, fontWeight: '400', CenturyGothic
typography.label   // fontSize: 14, fontWeight: '600', CenturyGothic
```

### Ombres

```js
import { shadows } from '../theme';

shadows.card    // ombre legere pour les cartes (elevation: 3)
shadows.button  // ombre tres legere pour les boutons (elevation: 2)
```

---

## 10. Gestion des tokens cote client

Les tokens sont stockes dans `AsyncStorage` sous les cles suivantes :

| Cle AsyncStorage | Contenu |
|---|---|
| `@aanid/v1/access_token` | JWT access token (string) |
| `@aanid/v1/refresh_token` | JWT refresh token (string) |
| `@aanid/v1/user` | Objet utilisateur serialise en JSON |

Le prefixe `@aanid/v1/` isole les cles AANID de celles d'autres packages. Le suffixe `/v1/` permet de migrer proprement le schema de stockage en incrementant la version si la structure change.

**Limitation connue :** `AsyncStorage` ne chiffre pas les donnees. Sur un appareil root ou compromis, les tokens peuvent etre extraits. Pour une application a hautes exigences de securite, remplacer `AsyncStorage` par `react-native-encrypted-storage` en changeant uniquement les appels dans `authService.js`, sans impact sur les composants.

---

## 11. Comportements de securite

### Validation locale avant envoi

Les ecrans `Auth` et les modals de `Profil` valident tous les champs localement avant d'envoyer la moindre requete au serveur. Le serveur valide de nouveau a la reception. La validation cote client est un confort, jamais une garantie.

Regles appliquees localement :

- Email : expression reguliere `RFC 5321` simplifiee
- Mot de passe : meme regex que le backend (8-128 caracteres, majuscule, minuscule, chiffre, special)
- Confirmation mot de passe : egalite stricte avec le nouveau mot de passe
- Nom complet : longueur 2 a 100 caracteres

### Affichage des erreurs

Les messages d'erreur affiches a l'utilisateur proviennent directement du serveur (champ `error` de la reponse JSON). Aucune information technique n'est ajoutee. Les erreurs HTTP 5xx affichent un message generique.

### Deconnexion robuste

La fonction `logout` dans `authService.js` efface le stockage local dans le bloc `finally`, que l'appel serveur reussisse ou echoue. Un utilisateur qui perd sa connexion reseau lors d'une deconnexion est quand meme deconnecte localement.

### Champ mot de passe

Les champs de mot de passe utilisent `textContentType="password"` (iOS) pour eviter la mise en cache par le gestionnaire de mots de passe systeme lors de la saisie du mot de passe actuel dans la verification. Les nouveaux mots de passe utilisent `textContentType="newPassword"` pour permettre les suggestions du gestionnaire de mots de passe.

---

## 12. Charte graphique appliquee

La partie 8 utilise le **bleu AANID `#1E73BE`** comme couleur principale, conformement a l'attribution `Hub Villes & Profils` de la charte graphique.

| Element | Valeur |
|---|---|
| Couleur principale | `#1E73BE` |
| Boutons primaires | Fond `#1E73BE`, texte blanc, coins 8 px, hauteur 44 px |
| Boutons secondaires | Bordure `#1E73BE`, texte `#1E73BE`, fond transparent |
| Bouton destructif (deconnexion) | Bordure `#E94E3C`, texte `#E94E3C` |
| Champs de saisie | Fond `#F5F5F5`, bordure `#E0E0E0` au repos, `#E94E3C` en erreur, hauteur 44 px |
| Cartes | Fond `#FFFFFF`, rayon 12 px, ombre 10 % opacite |
| Separateurs | `#F5F5F5` (1 px) |
| Grille mobile | Marges 16 px, espacement vertical base 8 px |
| Badges | Rayon 20 px, couleur de fond a 12 % d'opacite de la couleur du role/abonnement |

---

## 13. Police de caracteres

La charte graphique AANID prescrit **Century Gothic** comme police unique. Cette police n'est pas disponible nativement sur Android ou iOS.

### Chargement de la police

La police doit etre bundlee dans le projet React Native principal (pas dans ce module).

**Pour Expo :**

```bash
# Installer expo-font
npx expo install expo-font

# Placer les fichiers police dans assets/fonts/
# CenturyGothic.ttf
# CenturyGothic-Bold.ttf
```

```js
// App.js ou _layout.js (Expo Router)
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  CenturyGothic: require('./assets/fonts/CenturyGothic.ttf'),
  'CenturyGothic-Bold': require('./assets/fonts/CenturyGothic-Bold.ttf'),
});
```

**Pour React Native CLI :**

Ajouter dans `react-native.config.js` :

```js
module.exports = {
  assets: ['./assets/fonts'],
};
```

Puis executer : `npx react-native-asset`

### Comportement sans la police

Si `CenturyGothic` n'est pas charge, React Native tombe automatiquement sur la police systeme (`San Francisco` sur iOS, `Roboto` sur Android). L'interface reste fonctionnelle mais ne respecte pas la charte graphique. Le chargement de la police est une obligation pour la version de production.
