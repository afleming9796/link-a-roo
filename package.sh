#!/usr/bin/env bash
#
# Build the Chrome Web Store upload zip into dist/.
#
# The store wants manifest.json at the root of the archive and nothing it can't
# use, so this ships only the four directories the extension actually loads and
# leaves the repo's own furniture (README, PRIVACY, .github, unused art) behind.
#
#   ./package.sh
#
# dist/ is gitignored — it's also the place to keep store screenshots and any
# scratch files used to compose them.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

VERSION=$(python3 -c 'import json; print(json.load(open("manifest.json"))["version"])')
OUT="dist/link-a-roo-${VERSION}.zip"

# Files the extension loads at runtime. Anything not listed here never reaches
# the store, which is the point — a stray key or design kit is one bad zip away.
INCLUDE=(manifest.json icons src fonts)

# Present in those directories but not loaded: doc, spare weight, spare size.
EXCLUDE=(
  "fonts/README.md"
  "icons/lasso-dark.svg"
  "icons/icon-64.png"
  "*.DS_Store"
  "*/.DS_Store"
)

mkdir -p dist
rm -f "$OUT"

zip_args=()
for pattern in "${EXCLUDE[@]}"; do zip_args+=(-x "$pattern"); done
zip -rq "$OUT" "${INCLUDE[@]}" "${zip_args[@]}"

# The store rejects an archive whose manifest isn't at the top level, and that
# failure arrives after upload rather than here. Cheaper to catch it now.
#
# Read the listing once rather than piping into `grep -q`: -q exits on the first
# match, which SIGPIPEs unzip, and `set -o pipefail` then reports the whole
# pipeline as failed even though the match succeeded.
LISTING=$(unzip -l "$OUT")

if ! grep -qE ' manifest\.json$' <<<"$LISTING"; then
  echo "error: manifest.json is not at the root of $OUT" >&2
  exit 1
fi

COUNT=$(tail -1 <<<"$LISTING" | awk '{print $2}')
SIZE=$(du -h "$OUT" | cut -f1)

echo "built $OUT"
echo "  version : $VERSION"
echo "  files   : $COUNT"
echo "  size    : $SIZE"
echo
echo "Upload at https://chrome.google.com/webstore/devconsole"
echo "Remember: each upload must be a higher version than the last."
