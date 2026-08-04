#!/usr/bin/env bash
#
# Asserts that the nginx container serves the site the way Cloudflare Workers
# Static Assets will.
#
# The container is only useful if that claim is true, and it is easy to break
# by accident — an `add_header` in the wrong block silently drops every
# security header, and a try_files fallback turns the 404 page into a soft 404.
# So the claim is a test, not a comment.
#
# Usage: ./ops/local/parity-check.sh   (or `just parity`)

set -euo pipefail

COMPOSE="docker compose -f ops/local/docker-compose.yml"
BASE="${PARITY_BASE_URL:-http://localhost:8080}"
FAILURES=0

# When PARITY_BASE_URL is set the caller owns the container's lifecycle (CI
# starts it with plain `docker run`, since compose may not be present on the
# runner). Otherwise this script brings it up and tears it down itself.
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

pass() { printf '  \033[32mok\033[0m   %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; FAILURES=$((FAILURES + 1)); }

# status <path> <expected>
status() {
  local got
  got="$(curl -s -o /dev/null -w '%{http_code}' "${BASE}$1")"
  [ "$got" = "$2" ] && pass "$1 -> $2" || fail "$1 -> expected $2, got $got"
}

# redirects <path> <expected-location>
# Location must be relative: an absolute one leaks the container's own
# listen address, and Cloudflare redirects relatively.
redirects() {
  local code loc
  code="$(curl -s -o /dev/null -w '%{http_code}' "${BASE}$1")"
  loc="$(curl -s -o /dev/null -D - "${BASE}$1" | tr -d '\r' | awk -F': ' 'tolower($1)=="location"{print $2}')"
  if [ "$code" = "301" ] && [ "$loc" = "$2" ]; then
    pass "$1 -> 301 $2"
  else
    fail "$1 -> expected 301 $2, got $code ${loc:-<no location>}"
  fi
}

# content_type <path> <expected-substring>
# Worth asserting explicitly: a single stray `types` block in nginx replaces
# the whole mime map, and every asset silently becomes octet-stream — which
# makes the browser download the page rather than render it.
content_type() {
  local got
  got="$(curl -s -o /dev/null -w '%{content_type}' "${BASE}$1")"
  case "$got" in
    *"$2"*) pass "$1 [type: $got]" ;;
    *) fail "$1 [type] expected '*$2*', got '${got:-<absent>}'" ;;
  esac
}

# header <path> <header> <expected-substring>
header() {
  local got
  got="$(curl -s -o /dev/null -D - "${BASE}$1" | tr -d '\r' | awk -F': ' -v h="$(echo "$2" | tr '[:upper:]' '[:lower:]')" 'tolower($1)==h{print $2}')"
  case "$got" in
    *"$3"*) pass "$1 [$2: $3]" ;;
    *) fail "$1 [$2] expected '*$3*', got '${got:-<absent>}'" ;;
  esac
}

# body_contains <path> <substring>
#
# The body is captured before matching rather than piped into `grep -q`.
# Under `set -o pipefail`, `grep -q` exits on the first match and SIGPIPEs
# curl, so the pipeline fails *sometimes* depending on how much of the
# response curl had already written — an intermittent red build with no real
# cause. Capture first, match second.
body_contains() {
  local body
  body="$(curl -s "${BASE}$1")"
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
status    /                     200
status    /nl                   200
status    /en                   200
status    /nl/events            200
status    /nl/vacatures         200
status    /en/jobs              200
status    /nl/bedrijven         200
status    /nl/blog/waarom-twente-dev 200
redirects /nl/events.html       /nl/events
redirects /en/jobs.html         /en/jobs

echo
echo "Not found (not_found_handling = 404-page)"
# A 200 here would be a soft 404 — the error page gets indexed.
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
for path in /nl /nl/vacatures /events.ics /this/does/not/exist; do
  header "$path" X-Content-Type-Options nosniff
done
header /nl X-Frame-Options DENY
header /nl Referrer-Policy strict-origin-when-cross-origin
header /nl Content-Security-Policy "frame-ancestors 'none'"

echo
echo "CSP is emitted by Astro with per-page hashes, not unsafe-inline"
body_contains /nl "http-equiv=\"content-security-policy\""

HOME_HTML="$(curl -s "${BASE}/nl")"
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
# Same SIGPIPE reasoning as body_contains: reuse the captured body, and let
# awk take the first match instead of piping into `head`.
ASSET="$(printf '%s' "$HOME_HTML" | grep -oE '/_astro/[^"]+' | awk 'NR==1' || true)"
if [ -n "$ASSET" ]; then
  header "$ASSET" Cache-Control immutable
  # The inheritance trap: this location sets its own add_header.
  header "$ASSET" X-Content-Type-Options nosniff
  content_type "$ASSET" css
else
  echo "  (no /_astro asset referenced; skipping)"
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
