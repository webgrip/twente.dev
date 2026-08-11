set shell := ["bash", "-euo", "pipefail", "-c"]

# `just` is the only task runner in this repo. The toolchain it expects (node,
# just itself) is pinned in mise.toml, so recipes never install tools:
#
#     mise install && just setup
#
# Recipes that shell out to docker or pnpm guard on the binary first via
# `_need` — a recipe that fails with "command not found" three steps in is a
# worse error message than one that says which tool is missing and why.

compose := "docker compose -f ops/local/docker-compose.yml"

default:
    @just --list --unsorted

# --- guards -----------------------------------------------------------------

# Fail unless every named binary is on PATH.
[private]
_need +bins:
    #!/usr/bin/env bash
    set -euo pipefail
    missing=
    for b in {{ bins }}; do
        command -v "$b" >/dev/null 2>&1 || missing="${missing} $b"
    done
    if [ -n "${missing}" ]; then
        echo "missing required tool(s):${missing}" >&2
        echo "node and just are pinned in mise.toml — run 'mise install'" >&2
        echo "docker is not managed by mise; install Docker Desktop or colima" >&2
        exit 1
    fi

# --- setup ------------------------------------------------------------------

# One-time provisioning after `mise install`
[group('setup')]
setup:
    @just _need node
    corepack enable
    pnpm install --frozen-lockfile

# --- local development ------------------------------------------------------

# Dev server with hot reload (http://localhost:4321)
[group('dev')]
dev:
    @just _need pnpm
    pnpm dev

# Dev server in a container — no local Node needed (http://localhost:4321)
[group('dev')]
dev-docker:
    @just _need docker
    {{ compose }} up dev

# Build and serve the production image (http://localhost:8080)
[group('dev')]
preview:
    @just _need docker
    {{ compose }} up --build preview

# Stop containers
[group('dev')]
down:
    @just _need docker
    {{ compose }} down

# Stop containers and drop the named volumes
[group('dev')]
clean:
    @just _need docker
    {{ compose }} down --volumes --remove-orphans

# Tail container logs
[group('dev')]
logs:
    @just _need docker
    {{ compose }} logs -f

# Shell into the dev container
[group('dev')]
shell:
    @just _need docker
    {{ compose }} run --rm --entrypoint sh dev

# --- container --------------------------------------------------------------

# Build the web image
[group('container')]
image:
    @just _need docker
    docker build -f ops/docker/web/Dockerfile -t twente-dev-web:local .

# Verify the container serves the site the way Cloudflare will
[group('container')]
parity:
    @just _need docker
    ./ops/local/parity-check.sh

# --- quality gates ----------------------------------------------------------
# Individually runnable, and `check` runs the same set CI does.

# Check formatting
[group('check')]
fmt:
    pnpm format:check

# Lint
[group('check')]
lint:
    pnpm lint

# Typecheck — also the i18n completeness gate (see src/i18n/ui.ts)
[group('check')]
typecheck:
    pnpm typecheck

# Unit tests for src/lib
[group('check')]
test:
    pnpm test

# Cross-entry content checks (references, duplicate slugs, translations)
[group('check')]
content:
    pnpm validate:content

# Static build plus the Pagefind index
[group('check')]
build:
    pnpm build

# Lighthouse budgets (lighthouserc.json) against a fresh build
[group('check')]
lhci: build
    pnpm dlx @lhci/cli autorun

# Every gate CI runs
[group('check')]
check: fmt lint typecheck test content build

# Auto-fix formatting and lint
[group('check')]
fix:
    pnpm format
    pnpm lint:fix

# --- content ----------------------------------------------------------------

# Report jobs about to lapse (read-only)
[group('content')]
expiring:
    pnpm expire:jobs
