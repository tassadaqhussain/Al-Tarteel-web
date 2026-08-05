#!/usr/bin/env bash
set -euo pipefail

RECITER_SLUG="${1:-abdul-basit-murattal}"
OUTPUT_DIR="${2:-storage/audio/$RECITER_SLUG}"
CONCURRENCY="${AUDIO_DOWNLOAD_CONCURRENCY:-16}"
API_URL="${QURANPILOT_API_URL:-http://localhost:4010/api/v1}"

mkdir -p "$OUTPUT_DIR"
manifest="$OUTPUT_DIR/manifest.tsv"

curl -fsS "$API_URL/quran/surahs" | node -e '
  let input = "";
  process.stdin.on("data", (chunk) => input += chunk);
  process.stdin.on("end", () => {
    const chapters = JSON.parse(input);
    for (const chapter of chapters) {
      for (let ayah = 1; ayah <= chapter.numberOfAyahs; ayah += 1) {
        const file = String(chapter.number).padStart(3, "0") + String(ayah).padStart(3, "0") + ".mp3";
        const url = "https://audio.qurancdn.com/AbdulBaset/Murattal/mp3/" + file;
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

echo "Downloading $(wc -l < "$manifest" | tr -d " ") ayahs to $OUTPUT_DIR with $CONCURRENCY workers..."
while IFS=$'\t' read -r file url; do printf '%s\0%s\0' "$file" "$url"; done < "$manifest" \
  | xargs -0 -n 2 -P "$CONCURRENCY" bash -c 'download_one "$1" "$2"' _

expected=$(wc -l < "$manifest" | tr -d ' ')
actual=$(find "$OUTPUT_DIR" -type f -name '*.mp3' -size +0c | wc -l | tr -d ' ')
if [ "$actual" != "$expected" ]; then
  echo "Incomplete download: expected $expected files, found $actual" >&2
  exit 1
fi
echo "Complete: $actual audio files ($(du -sh "$OUTPUT_DIR" | cut -f1))."
