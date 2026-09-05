#!/usr/bin/env bash

set -euo pipefail

COMPOSE="docker compose -f ops/local/docker-compose.yml"
BASE="${PARITY_BASE_URL:-http://localhost:8080}"
FAILURES=0

if [ -n "${PARITY_BASE_URL:-}" ]; then
  MANAGE_CONTAINER=0
else
  MANAGE_CONTAINER=1
fi

cleanup() {
  [ "$MANAGE_CONTAINER" = "1" ] || return 0
  $COMPOSE down --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

fetch() { curl -s --retry 3 --retry-all-errors --retry-delay 1 "$@"; }

pass() { printf '  \033[32mok\033[0m   %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; FAILURES=$((FAILURES + 1)); }

status() {
  local got
  got="$(fetch -o /dev/null -w '%{http_code}' "${BASE}$1")"
  [ "$got" = "$2" ] && pass "$1 -> $2" || fail "$1 -> expected $2, got $got"
}

redirects() {
  local code loc
  code="$(fetch -o /dev/null -w '%{http_code}' "${BASE}$1")"
  loc="$(fetch -o /dev/null -D - "${BASE}$1" | tr -d '\r' | awk -F': ' 'tolower($1)=="location"{print $2}')"
  if [ "$code" = "$2" ] && [ "$loc" = "$3" ]; then
    pass "$1 -> $2 $3"
  else
    fail "$1 -> expected $2 $3, got $code ${loc:-<no location>}"
  fi
}

content_type() {
  local got
  got="$(fetch -o /dev/null -w '%{content_type}' "${BASE}$1")"
  case "$got" in
    *"$2"*) pass "$1 [type: $got]" ;;
    *) fail "$1 [type] expected '*$2*', got '${got:-<absent>}'" ;;
  esac
}

header() {
  local got
  got="$(fetch -o /dev/null -D - "${BASE}$1" | tr -d '\r' | awk -F': ' -v h="$(echo "$2" | tr '[:upper:]' '[:lower:]')" 'tolower($1)==h{print $2}')"
  case "$got" in
    *"$3"*) pass "$1 [$2: $3]" ;;
    *) fail "$1 [$2] expected '*$3*', got '${got:-<absent>}'" ;;
  esac
}

body_contains() {
  local body
  body="$(fetch "${BASE}$1")"
  if printf '%s' "$body" | grep -qF -- "$2"; then
    pass "$1 body contains '$2'"
  else
    fail "$1 body missing '$2'"
  fi
}

if [ "$MANAGE_CONTAINER" = "1" ]; then
  echo "Building and starting the preview container..."
  $COMPOSE up --build -d preview >/dev/null
else
  echo "Checking against ${BASE} (container managed by caller)..."
fi

echo "Waiting for nginx..."
for _ in $(seq 1 60); do
  curl -sf -o /dev/null "${BASE}/nl" && break
  sleep 1
done
if ! curl -sf -o /dev/null "${BASE}/nl"; then
  echo "container never became ready at ${BASE}"
  if [ "$MANAGE_CONTAINER" = "1" ]; then
    $COMPOSE logs preview
  fi
  exit 1
fi

echo
echo "Routing (html_handling = auto-trailing-slash)"
redirects /                     302 /nl
redirects /001                  301 /nl/001
status    /nl                   200
status    /en                   200
status    /nl/events            200
status    /nl/bedrijven         200
status    /en/companies         200
status    /nl/blog/waarom-twente-dev 200
redirects /nl/events.html       301 /nl/events
redirects /en/companies.html    301 /en/companies

echo
echo "Not found (not_found_handling = 404-page)"
status /this/does/not/exist 404
body_contains /this/does/not/exist "404"

echo
echo "Feeds and assets"
status /events.ics       200
status /robots.txt       200
status /sitemap-index.xml 200
status /nl/rss.xml       200
echo
echo "Content types (a replaced mime map breaks all of these at once)"
content_type /nl              text/html
content_type /en              text/html
content_type /events.ics      text/calendar
content_type /nl/rss.xml      xml
content_type /sitemap-index.xml xml
content_type /robots.txt      text/plain

echo
echo "Security headers (must survive into every location block)"
for path in /nl /nl/bedrijven /events.ics /this/does/not/exist; do
  header "$path" X-Content-Type-Options nosniff
done
header /nl X-Frame-Options DENY
header /nl Cross-Origin-Opener-Policy same-origin
header /nl Referrer-Policy strict-origin-when-cross-origin
header /nl Content-Security-Policy "frame-ancestors 'none'"

echo
echo "CSP is emitted by Astro with per-page hashes, not unsafe-inline"
body_contains /nl "http-equiv=\"content-security-policy\""

HOME_HTML="$(fetch "${BASE}/nl")"
CSP_META="$(printf '%s' "$HOME_HTML" | grep -o 'content-security-policy[^>]*' || true)"
if printf '%s' "$CSP_META" | grep -q "unsafe-inline"; then
  fail "/nl CSP contains unsafe-inline"
else
  pass "/nl CSP has no unsafe-inline"
fi
if printf '%s' "$CSP_META" | grep -q "sha256-"; then
  pass "/nl CSP carries per-page hashes"
else
  fail "/nl CSP has no sha256- hashes"
fi

echo
echo "Caching"
ASSET="$(printf '%s' "$HOME_HTML" | grep -oE '/_astro/[^"]+\.css' | awk 'NR==1' || true)"
if [ -n "$ASSET" ]; then
  header "$ASSET" Cache-Control immutable
  header "$ASSET" X-Content-Type-Options nosniff
  content_type "$ASSET" css
else
  echo "  (no /_astro stylesheet referenced; skipping)"
fi
FONT="$(printf '%s' "$HOME_HTML" | grep -oE '/_astro/[^"]+\.woff2' | awk 'NR==1' || true)"
if [ -n "$FONT" ]; then
  header "$FONT" Cache-Control immutable
  content_type "$FONT" font/woff2
fi
header /nl Cache-Control must-revalidate

echo
echo "The headers file is build input, not a public asset"
status /_headers 404

echo
if [ "$FAILURES" -eq 0 ]; then
  printf '\033[32mAll parity checks passed.\033[0m\n'
else
  printf '\033[31m%d parity check(s) failed.\033[0m\n' "$FAILURES"
  exit 1
fi
