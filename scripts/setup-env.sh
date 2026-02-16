#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_EXAMPLE_PATH="$ROOT_DIR/.env.example"

TARGET_ENV_PATHS=(
  "$ROOT_DIR/.env"
  "$ROOT_DIR/apps/api/.env"
  "$ROOT_DIR/apps/web/.env"
)

is_sensitive_key() {
  local key_upper
  key_upper="$(printf '%s' "$1" | tr '[:lower:]' '[:upper:]')"

  [[ "$key_upper" == *PASSWORD* || \
     "$key_upper" == *TOKEN* || \
     "$key_upper" == *SECRET* || \
     "$key_upper" == *KEY* ]]
}

if [[ ! -f "$ENV_EXAMPLE_PATH" ]]; then
  echo "Error: $ENV_EXAMPLE_PATH was not found." >&2
  exit 1
fi

declare -a ENV_KEYS=()
declare -A ENV_DEFAULTS=()
declare -A SEEN_KEYS=()

while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
  line="${raw_line%$'\r'}"
  trimmed="${line#"${line%%[![:space:]]*}"}"

  if [[ -z "$trimmed" || "$trimmed" == \#* ]]; then
    continue
  fi

  if [[ "$trimmed" =~ ^([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    default_value="${BASH_REMATCH[2]}"

    if [[ -n "${SEEN_KEYS[$key]+set}" ]]; then
      echo "Error: duplicate key '$key' found in $ENV_EXAMPLE_PATH." >&2
      exit 1
    fi

    SEEN_KEYS["$key"]=1
    ENV_KEYS+=("$key")
    ENV_DEFAULTS["$key"]="$default_value"
  fi
done < "$ENV_EXAMPLE_PATH"

if [[ ${#ENV_KEYS[@]} -eq 0 ]]; then
  echo "Error: no KEY=value entries found in $ENV_EXAMPLE_PATH." >&2
  exit 1
fi

declare -A ENV_VALUES=()

for key in "${ENV_KEYS[@]}"; do
  default_value="${ENV_DEFAULTS[$key]}"

  while true; do
    user_value=""

    if is_sensitive_key "$key"; then
      if [[ -n "$default_value" ]]; then
        printf "Enter value for %s (press Enter to use default): " "$key"
      else
        printf "Enter value for %s: " "$key"
      fi
      IFS= read -r -s user_value
      printf "\n"
    else
      if [[ -n "$default_value" ]]; then
        read -r -p "Enter value for $key [$default_value]: " user_value
      else
        read -r -p "Enter value for $key: " user_value
      fi
    fi

    if [[ -z "$user_value" && -n "$default_value" ]]; then
      user_value="$default_value"
    fi

    if [[ -n "$user_value" ]]; then
      ENV_VALUES["$key"]="$user_value"
      break
    fi

    echo "Value for $key is required."
  done
done

env_content=""
for key in "${ENV_KEYS[@]}"; do
  env_content+="$key=${ENV_VALUES[$key]}"$'\n'
done

for target_path in "${TARGET_ENV_PATHS[@]}"; do
  parent_dir="$(dirname "$target_path")"
  if [[ ! -d "$parent_dir" ]]; then
    echo "Error: target directory does not exist: $parent_dir" >&2
    exit 1
  fi

  if [[ -f "$target_path" ]]; then
    backup_path="${target_path}.bak.$(date +%Y%m%d%H%M%S)"
    cp "$target_path" "$backup_path"
    echo "Backed up $target_path to $backup_path"
  fi

  tmp_file="$(mktemp "${target_path}.tmp.XXXXXX")"
  printf "%s" "$env_content" > "$tmp_file"
  chmod 600 "$tmp_file"
  mv "$tmp_file" "$target_path"
  chmod 600 "$target_path"
  echo "Wrote $target_path"
done

if [[ "${SKIP_DOCKER_UP:-0}" == "1" ]]; then
  echo "SKIP_DOCKER_UP=1, skipping pnpm docker:up."
  exit 0
fi

echo "Running pnpm docker:up..."
if ! (cd "$ROOT_DIR" && pnpm docker:up); then
  echo "Error: pnpm docker:up failed." >&2
  exit 1
fi
