set shell := ["bash", "-euo", "pipefail", "-c"]

compose := "docker compose -f ops/local/docker-compose.yml"

default:
    @just --list --unsorted

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

[group('setup')]
setup:
    @just _need node
    corepack enable
    pnpm install --frozen-lockfile

[group('dev')]
dev:
    @just _need pnpm
    pnpm dev

[group('dev')]
dev-docker:
    @just _need docker
    {{ compose }} up dev

[group('dev')]
preview:
    @just _need docker
    {{ compose }} up --build preview

[group('dev')]
down:
    @just _need docker
    {{ compose }} down

[group('dev')]
clean:
    @just _need docker
    {{ compose }} down --volumes --remove-orphans

[group('dev')]
logs:
    @just _need docker
    {{ compose }} logs -f

[group('dev')]
shell:
    @just _need docker
    {{ compose }} run --rm --entrypoint sh dev

[group('container')]
image:
    @just _need docker
    docker build -f ops/docker/web/Dockerfile -t twente-dev-web:local .

[group('container')]
parity:
    @just _need docker
    pnpm gen:ops --check
    ./ops/local/parity-check.sh

[group('check')]
fmt:
    pnpm format:check

[group('check')]
lint:
    pnpm lint

[group('check')]
typecheck:
    pnpm typecheck

[group('check')]
test:
    pnpm test

[group('check')]
content:
    pnpm validate:content

[group('check')]
build:
    pnpm build

[group('check')]
lhci: build
    pnpm dlx @lhci/cli@0.15.x autorun

[group('check')]
a11y: build
    CHROME_PATH="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}" pnpm run validate:a11y

[group('check')]
check: fmt lint typecheck test content licenses build

# Verify the licence surface is consistent
[group('check')]
licenses:
    pnpm run license:check

# Full REUSE 3.3 lint (needs uv; not in CI)
[group('check')]
reuse:
    pnpm run license:reuse

[group('check')]
fix:
    pnpm format
    pnpm lint:fix
