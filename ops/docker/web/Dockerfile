# syntax=docker/dockerfile:1.26

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

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/pnpm/store,sharing=locked \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

COPY . .

RUN --mount=type=cache,target=/pnpm/store,sharing=locked \
    pnpm build

FROM ${NGINX_IMAGE} AS final

LABEL org.opencontainers.image.source="https://forgejo.webgrip.dev/webgrip/twente.dev" \
      org.opencontainers.image.title="twente.dev" \
      org.opencontainers.image.description="Static site for the developer community in Twente" \
      org.opencontainers.image.licenses="Apache-2.0"

COPY ops/docker/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY ops/docker/web/security-headers.conf /etc/nginx/conf.d/security-headers.conf
COPY --from=build /src/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/nl || exit 1
