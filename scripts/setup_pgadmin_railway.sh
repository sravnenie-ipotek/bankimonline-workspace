#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<USAGE
Usage: $(basename "$0") "URI1" "URI2" "URI3"

Each URI should look like:
  postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require

This script will:
  - Verify dependencies (psql, python3)
  - Test each connection with psql (SELECT now())
  - Add/update entries in ~/.pgpass with correct perms (600)
  - Generate ./servers_pgadmin_import.json for pgAdmin Import/Export Servers

Example:
  $(basename "$0") \
    "postgresql://u1:p1@h1:5432/db1?sslmode=require" \
    "postgresql://u2:p2@h2:5432/db2?sslmode=require" \
    "postgresql://u3:p3@h3:5432/db3?sslmode=require"
USAGE
}

if [[ ${1:-} == "-h" || ${1:-} == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 1 ]]; then
  echo "[ERROR] Provide at least one PostgreSQL URI. Up to three supported." >&2
  usage
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "[ERROR] python3 is required. On macOS: brew install python" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "[ERROR] psql is required. On macOS: brew install libpq && brew link --force libpq" >&2
  exit 1
fi

OUTPUT_JSON_FILE="$(pwd)/servers_pgadmin_import.json"

echo "[INFO] Will write pgAdmin servers JSON to: ${OUTPUT_JSON_FILE}"

mkdir -p "${HOME}"
PGPASS_FILE="${HOME}/.pgpass"

# Build arrays of parsed components using Python for robust URI parsing
# Use heredoc to preserve quotes safely on macOS bash 3.2
tmp_parsed_file=$(mktemp)
python3 - "$@" > "$tmp_parsed_file" <<'PY'
import sys
from urllib.parse import urlparse, parse_qs, unquote

for raw in sys.argv[1:]:
    u = urlparse(raw)
    user = unquote(u.username or "")
    password = unquote(u.password or "")
    host = u.hostname or ""
    # Safely parse port without forcing integer conversion (placeholders allowed)
    port_str = "5432"
    netloc_after_at = (u.netloc.split('@', 1)[-1]) if u.netloc else ""
    if netloc_after_at.startswith('[') and ']' in netloc_after_at:
        after = netloc_after_at.split(']', 1)[-1]
        if after.startswith(':') and after[1:].isdigit():
            port_str = after[1:]
    else:
        if ':' in netloc_after_at:
            cand = netloc_after_at.rsplit(':', 1)[-1]
            if cand.isdigit():
                port_str = cand
    db = (u.path.lstrip('/') or 'postgres')
    sslmode = parse_qs(u.query).get('sslmode', ['require'])[0]
    # Print bash-safe TSV line
    print('\t'.join([
        raw,
        host,
        port_str,
        db,
        user,
        password,
        sslmode
    ]))
PY

PARSED=()
while IFS= read -r __line; do
  [[ -z "$__line" ]] && continue
  PARSED+=("$__line")
done < "$tmp_parsed_file"
rm -f "$tmp_parsed_file"

if [[ ${#PARSED[@]} -eq 0 ]]; then
  echo "[ERROR] Nothing parsed from input URIs" >&2
  exit 1
fi

echo "[INFO] Testing connections with psql..."
idx=0
for line in "${PARSED[@]}"; do
  idx=$((idx+1))
  IFS=$'\t' read -r RAW HOST PORT DB USERNAME PASSWORD SSLMODE <<<"$line"
  echo "  - [DB ${idx}] ${HOST}:${PORT}/${DB} as ${USERNAME} (sslmode=${SSLMODE})"
  if [[ "$HOST" == "HOST" || "$PORT" == "PORT" || "$DB" == "DBNAME" || "$USERNAME" == "USER" || "$PASSWORD" == "PASSWORD" ]]; then
    echo "    [SKIP] Placeholder values detected; skipping live connection test."
  else
    # Rely on URI to pass sslmode. Use -c to avoid interactive sessions.
    set +e
    PSQL_OUTPUT=$(psql "$RAW" -c "select now();" 2>&1)
    PSQL_STATUS=$?
    set -e
    if [[ $PSQL_STATUS -ne 0 ]]; then
      echo "    [FAIL] ${PSQL_OUTPUT}" >&2
    else
      echo "    [OK] Connection successful"
    fi
  fi
done

echo "[INFO] Updating ~/.pgpass (will de-dup existing lines for these hosts/ports/dbs/users)"
touch "$PGPASS_FILE"
chmod 600 "$PGPASS_FILE"

# Remove any existing entries for the same host:port:db:user combos
tmp_pgpass=$(mktemp)
cp "$PGPASS_FILE" "$tmp_pgpass"

for line in "${PARSED[@]}"; do
  IFS=$'\t' read -r RAW HOST PORT DB USERNAME PASSWORD SSLMODE <<<"$line"
  if [[ "$HOST" == "HOST" || "$PORT" == "PORT" || "$DB" == "DBNAME" || "$USERNAME" == "USER" || "$PASSWORD" == "PASSWORD" ]]; then
    continue
  fi
  # Escape special chars for sed
  esc_host=$(printf '%s' "$HOST" | sed -e 's/[\/*.$^[]/\\&/g')
  esc_port=$(printf '%s' "$PORT" | sed -e 's/[\/*.$^[]/\\&/g')
  esc_db=$(printf '%s' "$DB" | sed -e 's/[\/*.$^[]/\\&/g')
  esc_user=$(printf '%s' "$USERNAME" | sed -e 's/[\/*.$^[]/\\&/g')
  sed -i '' "/^${esc_host}:${esc_port}:${esc_db}:${esc_user}:/d" "$tmp_pgpass" 2>/dev/null || true
done

mv "$tmp_pgpass" "$PGPASS_FILE"

for line in "${PARSED[@]}"; do
  IFS=$'\t' read -r RAW HOST PORT DB USERNAME PASSWORD SSLMODE <<<"$line"
  if [[ "$HOST" == "HOST" || "$PORT" == "PORT" || "$DB" == "DBNAME" || "$USERNAME" == "USER" || "$PASSWORD" == "PASSWORD" ]]; then
    continue
  fi
  echo "${HOST}:${PORT}:${DB}:${USERNAME}:${PASSWORD}" >> "$PGPASS_FILE"
done

chmod 600 "$PGPASS_FILE"
echo "[INFO] ~/.pgpass updated"

echo "[INFO] Generating pgAdmin Import/Export Servers JSON..."

python3 - "$@" > "$OUTPUT_JSON_FILE" <<'PY'
import sys, json
from urllib.parse import urlparse, parse_qs, unquote

servers = {}
for i, raw in enumerate(sys.argv[1:], start=1):
    u = urlparse(raw)
    user = unquote(u.username or "")
    password = unquote(u.password or "")
    host = u.hostname or ""
    # Safely parse port; default to 5432 if not numeric
    port_str = "5432"
    netloc_after_at = (u.netloc.split('@', 1)[-1]) if u.netloc else ""
    if netloc_after_at.startswith('[') and ']' in netloc_after_at:
        after = netloc_after_at.split(']', 1)[-1]
        if after.startswith(':') and after[1:].isdigit():
            port_str = after[1:]
    else:
        if ':' in netloc_after_at:
            cand = netloc_after_at.rsplit(':', 1)[-1]
            if cand.isdigit():
                port_str = cand
    db = (u.path.lstrip('/') or 'postgres')
    sslmode = parse_qs(u.query).get('sslmode', ['require'])[0]
    servers[str(i)] = {
        "Name": f"Railway DB {i}",
        "Group": "Railway",
        "Host": host,
        "Port": int(port_str) if port_str.isdigit() else 5432,
        "MaintenanceDB": db,
        "Username": user,
        "SSLMode": sslmode,
        "SavePwd": 1,
        "Comment": "Imported via setup_pgadmin_railway.sh"
    }

print(json.dumps({"Servers": servers}, indent=2))
PY

echo "[DONE] Generated: $OUTPUT_JSON_FILE"
echo ""
echo "Connection details parsed (copy into pgAdmin if you prefer manual setup):"
idx=0
for line in "${PARSED[@]}"; do
  idx=$((idx+1))
  IFS=$'\t' read -r RAW HOST PORT DB USERNAME PASSWORD SSLMODE <<<"$line"
  echo "  - [DB ${idx}] Host=${HOST} Port=${PORT} DB=${DB} User=${USERNAME} SSLMode=${SSLMODE}"
done
echo ""
echo "Next steps:"
echo "  1) Open pgAdmin 4"
echo "  2) File -> Import/Export Servers -> Import"
echo "  3) Choose: $OUTPUT_JSON_FILE"
echo "  4) You will see a group 'Railway' with imported servers."
echo "     Connect to each. If initial connect fails, edit server and set Maintenance DB to 'postgres'."


