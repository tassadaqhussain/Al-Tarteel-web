#!/usr/bin/env bash
# Parse a dotenv file into the current shell WITHOUT executing it.
#
# `source production.env` is unsafe under `set -u`: passwords or comments that
# contain `$!`, `$()`, or other expansions abort the deploy (and can rewrite secrets).
#
# Usage:
#   source scripts/load-env-file.sh
#   load_env_file /path/to/deploy/production.env

load_env_file() {
  local file="${1:-}"
  local line key val

  [[ -n "${file}" && -f "${file}" ]] || return 1

  while IFS= read -r line || [[ -n "${line}" ]]; do
    line="${line%$'\r'}"
    [[ "${line}" =~ ^[[:space:]]*# ]] && continue
    [[ "${line}" =~ ^[[:space:]]*$ ]] && continue
    [[ "${line}" =~ ^[[:space:]]*export[[:space:]]+ ]] && line="${line#*export }"
    [[ "${line}" == *"="* ]] || continue

    key="${line%%=*}"
    val="${line#*=}"
    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"
    [[ "${key}" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue

    if [[ "${val}" =~ ^\".*\"$ || "${val}" =~ ^\'.*\'$ ]]; then
      val="${val:1:${#val}-2}"
    fi

    export "${key}=${val}"
  done < "${file}"
}
