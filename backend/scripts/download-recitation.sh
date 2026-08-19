#!/usr/bin/env bash
set -euo pipefail

# Download ayah MP3s for a reciter into storage/audio/<slug>/
# Prefer the full mirror (all reciters + spoken translations + WBW):
#   node scripts/download-all-audio.mjs
#
# Usage:
#   ./scripts/download-recitation.sh alafasy
#   ./scripts/download-recitation.sh husary storage/audio/husary

RECITER_SLUG="${1:-abdul-basit-murattal}"
OUTPUT_DIR="${2:-storage/audio/$RECITER_SLUG}"
CONCURRENCY="${AUDIO_DOWNLOAD_CONCURRENCY:-16}"
API_URL="${QURANPILOT_API_URL:-http://localhost:4010/api/v1}"

declare -A CDN_BASE=(
  [alafasy]="https://audio.qurancdn.com/Alafasy/mp3"
  [abdul-basit-murattal]="https://audio.qurancdn.com/AbdulBaset/Murattal/mp3"
  [minshawi-murattal]="https://audio.qurancdn.com/Minshawi/Murattal/mp3"
  [husary]="https://everyayah.com/data/Husary_64kbps"
  [sudais]="https://audio.qurancdn.com/Sudais/mp3"
  [shuraim]="https://audio.qurancdn.com/Shuraym/mp3"
  [ghamdi]="https://everyayah.com/data/Ghamadi_40kbps"
  [ajamy]="https://everyayah.com/data/Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net"
)

BASE_URL="${CDN_BASE[$RECITER_SLUG]:-}"
if [ -z "$BASE_URL" ]; then
  echo "Unknown reciter slug: $RECITER_SLUG" >&2
  echo "Supported: ${!CDN_BASE[*]}" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
manifest="$OUTPUT_DIR/manifest.tsv"

curl -fsS "$API_URL/quran/surahs" | BASE_URL="$BASE_URL" node -e '
  let input = "";
  process.stdin.on("data", (chunk) => input += chunk);
  process.stdin.on("end", () => {
    const base = process.env.BASE_URL.replace(/\/$/, "");
    const chapters = JSON.parse(input);
    for (const chapter of chapters) {
      for (let ayah = 1; ayah <= chapter.numberOfAyahs; ayah += 1) {
        const file = String(chapter.number).padStart(3, "0") + String(ayah).padStart(3, "0") + ".mp3";
        const url = base + "/" + file;
        process.stdout.write(file + "\t" + url + "\n");
      }
    }
  });
' > "$manifest"

export OUTPUT_DIR
download_one() {
  file="$1"
  url="$2"
  target="$OUTPUT_DIR/$file"
  if [ -s "$target" ]; then return 0; fi
  rm -f "$target.part"
  curl --fail --location --silent --show-error --retry 5 --retry-delay 1 \
    --output "$target.part" "$url" && mv "$target.part" "$target"
}
export -f download_one

echo "Downloading $(wc -l < "$manifest" | tr -d " ") ayahs for $RECITER_SLUG -> $OUTPUT_DIR ($CONCURRENCY workers)..."
while IFS=$'\t' read -r file url; do printf '%s\0%s\0' "$file" "$url"; done < "$manifest" \
  | xargs -0 -n 2 -P "$CONCURRENCY" bash -c 'download_one "$1" "$2"' _

expected=$(wc -l < "$manifest" | tr -d ' ')
actual=$(find "$OUTPUT_DIR" -type f -name '*.mp3' -size +0c | wc -l | tr -d ' ')
if [ "$actual" != "$expected" ]; then
  echo "Incomplete download: expected $expected files, found $actual" >&2
  exit 1
fi
echo "Complete: $actual audio files ($(du -sh "$OUTPUT_DIR" | cut -f1))."
