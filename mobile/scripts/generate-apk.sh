#!/bin/bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────
# Panotic – Script de génération APK (release)
# Utilisation :  ./scripts/generate-apk.sh
# Prérequis :    Java 17+, Android SDK, variables d'env ci-dessous
# ──────────────────────────────────────────────────────────────────

echo "=== Panotic APK Builder ==="

# Vérifier les variables d'environnement nécessaires
: "${RELEASE_STORE_PASSWORD:?Variable RELEASE_STORE_PASSWORD manquante}"
: "${RELEASE_KEY_ALIAS:?Variable RELEASE_KEY_ALIAS manquante}"
: "${RELEASE_KEY_PASSWORD:?Variable RELEASE_KEY_PASSWORD manquante}"

cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# 1. Installer les dépendances
echo "→ Installation des dépendances npm…"
npm ci

# 2. Nettoyer l'ancien build
echo "→ Nettoyage…"
cd android
./gradlew clean

# 3. Générer le keystore de release s'il n'existe pas
KEYSTORE="app/panotic-release.keystore"
if [ ! -f "$KEYSTORE" ]; then
    echo "→ Génération du keystore de release…"
    keytool -genkey -v -keystore "$KEYSTORE" \
        -alias "$RELEASE_KEY_ALIAS" \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass "$RELEASE_STORE_PASSWORD" \
        -keypass "$RELEASE_KEY_PASSWORD" \
        -dname "CN=Panotic, OU=Dev, O=Panotic, L=Cotonou, ST=Atlantique, C=BJ"
    echo "✓ Keystore créé : $KEYSTORE"
fi

# 4. Builder l'APK release (AAB pour Play Store, APK pour déploiement direct)
echo "→ Build APK release…"
./gradlew assembleRelease

# 5. Copier l'APK généré
APK_OUT="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_OUT" ]; then
    mkdir -p "$PROJECT_ROOT/build"
    cp "$APK_OUT" "$PROJECT_ROOT/build/panotic.apk"
    echo "✓ APK généré : $PROJECT_ROOT/build/panotic.apk"
else
    echo "✗ Échec : APK introuvable à $APK_OUT"
    exit 1
fi

echo "=== Terminé ==="
