COMPOSE := docker compose -f ops/local/docker-compose.yml

.DEFAULT_GOAL := help

.PHONY: help
help: ## Show this help
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

# --- local development ------------------------------------------------------

.PHONY: dev
dev: ## Dev server with hot reload (http://localhost:4321)
	$(COMPOSE) up dev

.PHONY: preview
preview: ## Build and serve the production image (http://localhost:8080)
	$(COMPOSE) up --build preview

.PHONY: down
down: ## Stop containers
	$(COMPOSE) down

.PHONY: clean
clean: ## Stop containers and drop the named volumes
	$(COMPOSE) down --volumes --remove-orphans

.PHONY: logs
logs: ## Tail container logs
	$(COMPOSE) logs -f

.PHONY: shell
shell: ## Shell into the dev container
	$(COMPOSE) run --rm --entrypoint sh dev

# --- image ------------------------------------------------------------------

.PHONY: image
image: ## Build the web image
	docker build -f ops/docker/web/Dockerfile -t twente-dev-web:local .

.PHONY: parity
parity: ## Verify the container serves the site the way Cloudflare will
	./ops/local/parity-check.sh

# --- quality gates (same commands CI runs) ----------------------------------

.PHONY: check
check: ## Run every gate: format, lint, typecheck, test, content, build
	pnpm format:check
	pnpm lint
	pnpm typecheck
	pnpm test
	pnpm validate:content
	pnpm build

.PHONY: fix
fix: ## Auto-fix formatting and lint
	pnpm format
	pnpm lint:fix
