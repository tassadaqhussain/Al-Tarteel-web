#!/usr/bin/env python3
"""Generate frontend/src/lib/i18n/messages.ts from scripts/i18n-locales/*.json."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES_DIR = Path(__file__).with_name("i18n-locales")
OUT = ROOT / "src/lib/i18n/messages.ts"

EXPECTED = {
    "ar",
    "bn",
    "en",
    "es",
    "fa",
    "fr",
    "hi",
    "id",
    "it",
    "ms",
    "nl",
    "ps",
    "pt",
    "ru",
    "sq",
    "sw",
    "th",
    "tr",
    "ur",
    "vi",
    "zh",
}


def ts_string(s: str) -> str:
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def emit_dict(name: str, keys: list[str], d: dict[str, str]) -> str:
    lines = [f"const {name}: Messages = {{"]
    for k in keys:
        lines.append(f"  {k}: {ts_string(d[k])},")
    lines.append("};")
    return "\n".join(lines)


def main() -> None:
    have = {p.stem for p in LOCALES_DIR.glob("*.json")}
    if have != EXPECTED:
        raise SystemExit(f"locale mismatch missing={EXPECTED - have} extra={have - EXPECTED}")

    en = json.loads((LOCALES_DIR / "en.json").read_text(encoding="utf-8"))
    keys = list(en.keys())

    parts: list[str] = [
        "import type { UiLocale } from '@/stores/settingsStore';\n\n",
        "/** Common chrome / navigation strings. Every locale defines all keys. */\n",
        "export type MessageKey =\n",
        "".join(f"  | '{k}'\n" for k in keys),
        "\nexport type Messages = Record<MessageKey, string>;\n\n",
        emit_dict("en", keys, en) + "\n\n",
    ]

    for code in sorted(EXPECTED - {"en"}):
        d = json.loads((LOCALES_DIR / f"{code}.json").read_text(encoding="utf-8"))
        missing = [k for k in keys if k not in d]
        if missing:
            raise SystemExit(f"{code} missing {missing}")
        parts.append(emit_dict(code, keys, {k: d[k] for k in keys}) + "\n\n")

    parts.append("const DICTS: Record<UiLocale, Messages> = {\n")
    for code in sorted(EXPECTED):
        parts.append(f"  {code},\n")
    parts.append("};\n\n")
    parts.append(
        """export const RTL_LOCALES: UiLocale[] = ['ar', 'fa', 'ur', 'ps'];

export function isRtlLocale(locale: UiLocale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function t(locale: UiLocale, key: MessageKey): string {
  return DICTS[locale]?.[key] ?? en[key] ?? key;
}

export function translate(locale: UiLocale) {
  return (key: MessageKey) => t(locale, key);
}
"""
    )

    OUT.write_text("".join(parts), encoding="utf-8")
    print(f"Wrote {OUT} — {len(EXPECTED)} locales × {len(keys)} keys")


if __name__ == "__main__":
    main()
