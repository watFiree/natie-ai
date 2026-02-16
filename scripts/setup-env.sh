#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_EXAMPLE_PATHS=(
  "$ROOT_DIR/apps/api/.env.example"
  "$ROOT_DIR/apps/web/.env.example"
)
TARGET_ENV_PATHS=(
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

parse_env_example() {
  local example_path="$1"
  local -n out_keys_ref="$2"
  local -n out_defaults_ref="$3"
  local raw_line line trimmed key default_value
  local -A seen_keys=()

  out_keys_ref=()
  out_defaults_ref=()

  while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
    line="${raw_line%$'\r'}"
    trimmed="${line#"${line%%[![:space:]]*}"}"

    if [[ -z "$trimmed" || "$trimmed" == \#* ]]; then
      continue
    fi

    if [[ "$trimmed" =~ ^([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=(.*)$ ]]; then
      key="${BASH_REMATCH[1]}"
      default_value="${BASH_REMATCH[2]}"

      if [[ -n "${seen_keys[$key]+set}" ]]; then
        echo "Error: duplicate key '$key' found in $example_path." >&2
        exit 1
      fi

      seen_keys["$key"]=1
      out_keys_ref+=("$key")
      out_defaults_ref["$key"]="$default_value"
    fi
  done < "$example_path"

  if [[ ${#out_keys_ref[@]} -eq 0 ]]; then
    echo "Error: no KEY=value entries found in $example_path." >&2
    exit 1
  fi
}

prompt_required_value() {
  local key="$1"
  local default_value="$2"
  local user_value

  while true; do
    user_value=""

    if is_sensitive_key "$key"; then
      if [[ -n "$default_value" ]]; then
        printf "Enter value for %s (press Enter to use default): " "$key" >&2
      else
        printf "Enter value for %s: " "$key" >&2
      fi
      IFS= read -r -s user_value
      printf "\n" >&2
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
      printf '%s' "$user_value"
      return 0
    fi

    echo "Value for $key is required." >&2
  done
}

if [[ ${#ENV_EXAMPLE_PATHS[@]} -ne ${#TARGET_ENV_PATHS[@]} ]]; then
  echo "Error: env example and target path counts do not match." >&2
  exit 1
fi

declare -A ENV_VALUES=()
declare -A RENDERED_CONTENT_BY_TARGET=()

for idx in "${!ENV_EXAMPLE_PATHS[@]}"; do
  example_path="${ENV_EXAMPLE_PATHS[$idx]}"
  target_path="${TARGET_ENV_PATHS[$idx]}"
  parent_dir="$(dirname "$target_path")"

  if [[ ! -f "$example_path" ]]; then
    echo "Error: $example_path was not found." >&2
    exit 1
  fi

  if [[ ! -d "$parent_dir" ]]; then
    echo "Error: target directory does not exist: $parent_dir" >&2
    exit 1
  fi

  declare -a template_keys=()
  declare -A template_defaults=()
  parse_env_example "$example_path" template_keys template_defaults

  for key in "${template_keys[@]}"; do
    if [[ -n "${ENV_VALUES[$key]+set}" ]]; then
      continue
    fi

    default_value="${template_defaults[$key]}"
    ENV_VALUES["$key"]="$(prompt_required_value "$key" "$default_value")"
  done

  env_content=""
  for key in "${template_keys[@]}"; do
    env_content+="$key=${ENV_VALUES[$key]}"$'\n'
  done

  RENDERED_CONTENT_BY_TARGET["$target_path"]="$env_content"
done

for target_path in "${TARGET_ENV_PATHS[@]}"; do
  env_content="${RENDERED_CONTENT_BY_TARGET[$target_path]}"

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
