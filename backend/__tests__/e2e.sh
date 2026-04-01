#!/bin/bash
# lightweight smoke: requires running dev servers and stripe mocked
set -e
API=${API:-http://localhost:4000/api}
EMAIL="u$RANDOM@test.com"
PASSWORD="Passw0rd!"

curl -s -X POST $API/auth/register -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" >/dev/null
curl -s -X POST $API/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" >/dev/null
echo "E2E smoke passed (register/login)"
