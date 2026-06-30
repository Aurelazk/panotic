#!/usr/bin/env bash
# Build APK debug ou release pour AANID/frontend
set -euo pipefail

MODE="${1:-release}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT/frontend"
ANDROID="$FRONTEND/android"

if [ -z "${ANDROID_HOME:-}" ]; then
  for candidate in "$HOME/Android/Sdk" "$HOME/Android/sdk" "/opt/android-sdk"; do
    if [ -d "$candidate" ]; then
      export ANDROID_HOME="$candidate"
      break
    fi
  done
fi

if [ -z "${ANDROID_HOME:-}" ] || [ ! -d "$ANDROID_HOME" ]; then
  echo "❌ ANDROID_HOME introuvable."
  echo "   Installez Android Studio puis :"
  echo "   export ANDROID_HOME=\$HOME/Android/Sdk"
  echo "   export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
  exit 1
fi

if [ ! -f "$ANDROID/gradlew" ]; then
  echo "❌ Projet android/ manquant. Lancez : npm run setup:android (depuis AANID/)"
  exit 1
fi

if [ ! -f "$ANDROID/local.properties" ]; then
  echo "sdk.dir=$ANDROID_HOME" > "$ANDROID/local.properties"
fi

echo "→ ANDROID_HOME=$ANDROID_HOME"
echo "→ Build APK ($MODE)..."

cd "$ANDROID"
chmod +x gradlew

if [ "$MODE" = "debug" ]; then
  ./gradlew assembleDebug --no-daemon
  APK="$ANDROID/app/build/outputs/apk/debug/app-debug.apk"
else
  ./gradlew assembleRelease --no-daemon
  APK="$ANDROID/app/build/outputs/apk/release/app-release.apk"
fi

echo ""
echo "✅ APK généré :"
echo "   $APK"
echo ""
echo "Installer sur appareil : adb install -r \"$APK\""
