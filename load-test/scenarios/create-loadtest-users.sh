#!/usr/bin/env bash
set -uo pipefail
N="${1:-100}"
PASS="${LOAD_PASS:-loadpass1234}"
KC="docker exec course-keycloak /opt/keycloak/bin/kcadm.sh"

$KC config credentials --server http://localhost:8080 --realm master --user admin --password admin

created=0
for i in $(seq 1 "$N"); do
  u="loaduser_$i"
  if $KC get users -r course -q username="$u" --fields username 2>/dev/null | grep -q "\"$u\""; then
    continue   # 이미 있으면 건너뜀
  fi
  if $KC create users -r course -s username="$u" -s enabled=true \
       -s firstName="Load" -s lastName="$i" >/dev/null 2>&1; then
    $KC set-password -r course --username "$u" --new-password "$PASS" >/dev/null 2>&1
    created=$((created+1))
  fi
done
echo "done: created=$created (target=$N, password=$PASS)"
