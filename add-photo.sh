#!/usr/bin/env bash
# Agrega o reemplaza la foto de la página.
# Uso: ./add-photo.sh "/ruta/a/la/foto.jpg"
set -euo pipefail

if [ $# -lt 1 ] || [ ! -f "$1" ]; then
  echo "Uso: ./add-photo.sh \"/ruta/a/la/foto.jpg\""
  exit 1
fi

origen="$1"
destino="$(cd "$(dirname "$0")" && pwd)/assets/foto.jpg"

if command -v magick >/dev/null 2>&1; then
  herramienta="magick"
else
  herramienta="convert"
fi

# Corrige la orientación, limita el tamaño, elimina metadatos (privacidad)
# y deja un JPG optimizado para celular.
"$herramienta" "$origen" \
  -auto-orient \
  -resize '1600x2000>' \
  -strip \
  -interlace Plane \
  -quality 88 \
  "$destino"

echo "Foto lista: $destino"
"$herramienta" identify "$destino" | awk '{print "Tamaño: " $3}'
echo
echo "Para actualizar la página publicada:"
echo "  git add assets/foto.jpg && git commit -m 'Agregar foto de mamá' && git push"
