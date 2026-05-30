# Makefile — comandos de conveniência para o ambiente Docker
# Uso: make <target>   (execute na raiz do repositório)

COMPOSE = docker compose -f docker/docker-compose.yml

.PHONY: help up down build build-app build-icecast build-liquidsoap restart logs \
        app-shell nginx-shell icecast-shell liquidsoap-shell \
        app-restart nginx-restart icecast-restart liquidsoap-restart \
        dev lint format check ps

# ── Ajuda ────────────────────────────────────────────────────────────────────

help: ## Mostra esta ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Dev local (sem Docker) ────────────────────────────────────────────────────

dev: ## Inicia o servidor de desenvolvimento Next.js
	bun run dev

lint: ## Verifica o código com Biome
	bun run lint

format: ## Formata o código com Biome
	bun run format

check: ## Verifica tipos TypeScript
	bun run check

# ── Ciclo de vida ────────────────────────────────────────────────────────────

up: ## Sobe todos os serviços em background
	$(COMPOSE) up -d

down: ## Para e remove todos os containers
	$(COMPOSE) down

build: ## Reconstrói todas as imagens
	$(COMPOSE) build

build-app: ## Reconstrói apenas a imagem do app e reinicia o container
	$(COMPOSE) build app
	$(COMPOSE) up -d --no-deps app

build-icecast: ## Reconstrói apenas a imagem do icecast e reinicia o container
	$(COMPOSE) build icecast
	$(COMPOSE) up -d --no-deps icecast

build-liquidsoap: ## Reconstrói apenas a imagem do liquidsoap e reinicia o container
	$(COMPOSE) build liquidsoap
	$(COMPOSE) up -d --no-deps liquidsoap

restart: ## Reinicia todos os serviços
	$(COMPOSE) restart

ps: ## Lista containers em execução
	$(COMPOSE) ps

# ── Logs ─────────────────────────────────────────────────────────────────────

logs: ## Logs de todos os serviços (segue)
	$(COMPOSE) logs -f

logs-app: ## Logs do container app
	$(COMPOSE) logs -f app

logs-nginx: ## Logs do container nginx
	$(COMPOSE) logs -f nginx

logs-icecast: ## Logs do container icecast
	$(COMPOSE) logs -f icecast

logs-liquidsoap: ## Logs do container liquidsoap
	$(COMPOSE) logs -f liquidsoap

# ── Shells ────────────────────────────────────────────────────────────────────

app-shell: ## Shell no container app
	$(COMPOSE) exec app sh

nginx-shell: ## Shell no container nginx
	$(COMPOSE) exec nginx sh

icecast-shell: ## Shell no container icecast
	$(COMPOSE) exec icecast sh

liquidsoap-shell: ## Shell no container liquidsoap
	$(COMPOSE) exec liquidsoap sh

# ── Restart individual ────────────────────────────────────────────────────────

app-restart: ## Reinicia apenas o container app
	$(COMPOSE) restart app

nginx-restart: ## Reinicia apenas o container nginx
	$(COMPOSE) restart nginx

icecast-restart: ## Reinicia apenas o container icecast
	$(COMPOSE) restart icecast

liquidsoap-restart: ## Reinicia apenas o container liquidsoap
	$(COMPOSE) restart liquidsoap
