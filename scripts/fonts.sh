#!/bin/sh
# Subsets the full fonts in fonts-src/ into public/fonts/. Needs fonttools: pip install fonttools brotli
# Add a character the copy starts using to UNICODES, then run: npm run fonts
set -eu
cd "$(dirname "$0")/.."

# ASCII; nbsp © ° · ×; dashes, quotes, bullet, ellipsis, primes, euro, minus.
# shortcut: no accented letters (they'd cost ~18 KB and fall back to the system font); add
# U+00C0-00FF if the copy ever needs them. Arrows are listed but neither family has them.
UNICODES='U+0020-007E,U+00A0,U+00A9,U+00B0,U+00B7,U+00D7,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2032-2033,U+20AC,U+2190-2193,U+2197,U+2212'

command -v "${PYFTSUBSET:=pyftsubset}" >/dev/null || { echo 'pyftsubset not found: pip install fonttools brotli' >&2; exit 1; }

mkdir -p public/fonts
for src in fonts-src/*.woff2; do
  "$PYFTSUBSET" "$src" \
    --unicodes="$UNICODES" \
    --layout-features='kern,liga,calt,tnum,lnum,case,ss01' \
    --flavor=woff2 \
    --output-file="public/fonts/$(basename "$src")"
done
ls -l public/fonts
