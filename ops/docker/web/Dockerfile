# syntax=docker/dockerfile:1
#
# twente.dev — the built static site served by nginx.
#
# Production is Cloudflare Workers Static Assets (ADR 0002); this image is NOT
# the deployment target. It exists so `dist/` can be served locally under the
# same rules Cloudflare applies — extensionless URLs, a real 404 status, the
# cache and security headers from public/_headers — which is the only way to
# catch a routing or header regression before it reaches production.
#
# Multi-stage and self-contained: the build context is the repo, and the image
# installs its own dependencies rather than trusting anything from the host.
#   build — pnpm install + `pnpm build` (astro build, then the Pagefind index)
#   final — nginx-unprivileged serving dist/ (see ops/docker/web/nginx.conf)

ARG REGISTRY_DOCKERHUB=docker.io
ARG NODE_IMAGE=${REGISTRY_DOCKERHUB}/library/node:24-bookworm-slim
ARG NGINX_IMAGE=${REGISTRY_DOCKERHUB}/nginxinc/nginx-unprivileged:1.29-alpine

FROM ${NODE_IMAGE} AS build

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=1 \
    ASTRO_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0

WORKDIR /src

# packageManager in package.json pins the pnpm version corepack activates.
RUN corepack enable

# Dependency manifests first, so a content-only change reuses this layer.
# pnpm-workspace.yaml carries the allowBuilds approvals for esbuild and
# workerd; without it the install refuses to run their postinstall scripts and
# the build fails later with a much less obvious error.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/pnpm/store,sharing=locked \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM ${NGINX_IMAGE} AS final

LABEL org.opencontainers.image.source="https://forgejo.webgrip.dev/webgrip/twente.dev" \
      org.opencontainers.image.title="twente.dev" \
      org.opencontainers.image.description="Static site for the developer community in Twente" \
      org.opencontainers.image.licenses="MIT"

COPY ops/docker/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY ops/docker/web/security-headers.conf /etc/nginx/conf.d/security-headers.conf
COPY --from=build /src/dist /usr/share/nginx/html

# nginx-unprivileged runs as uid 101 and cannot bind ports below 1024.
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/nl || exit 1
