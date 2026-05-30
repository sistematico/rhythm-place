# Rhythm Place

Automacao de infraestrutura e deploy para o app Next.js (`next@latest`) com:
- Nginx como proxy reverso
- Node.js 24 LTS via NodeSource
- Bun (latest)
- Icecast2 para streaming de audio
- Liquidsoap para geração do stream
- systemd units rodando com usuario `nginx` (app) e `liquidsoap` (stream)
- Certificados Let's Encrypt com wildcard (`rhythm.place`, `*.rhythm.place`)
- Credenciais sensiveis protegidas com Ansible Vault

## Tooling

Este repositorio usa Bun como gerenciador de pacotes e task runner.

- Use `bun install`, `bun add`, `bunx` e `bun run <script>`.
- Evite `pnpm`, `npm` e `yarn` neste projeto.

## Estrutura criada

- `ansible/site.yml`: playbook principal (host `ate`)
- `ansible/roles/web/`: role de provisionamento
- `ansible/group_vars/all/main.yml`: variaveis nao sensiveis
- `ansible/group_vars/all/vault.yml`: segredos (vault)
- `ansible/group_vars/all/vault.yml.example`: modelo de segredos
- `scripts/ansible-vault-init.sh`: inicializa vault local
- `scripts/ansible-provision.sh`: roda `ansible-playbook`
- `scripts/deploy.sh`: atalho de deploy
- `scripts/docker-stack.sh`: sobe a stack Docker local espelhando a VPS

## O que as roles configuram

### Role `web`

1. Instala pacotes base (`nginx`, `certbot`, plugin DNS Cloudflare, `git`, etc.).
2. Instala Node.js 24 LTS via NodeSource.
3. Instala Bun (latest) em `/home/nginx/.bun/bin/bun`.
4. Garante usuario/grupo `nginx` para runtime da app.
5. Faz checkout do repositorio da app em `/var/www/rhythm.place`.
6. Executa `bun install --frozen-lockfile` e `bun run build`.
7. Cria unit `rhythm-place.service` no systemd.
8. Configura Nginx para `rhythm.place` e `*.rhythm.place`.
9. Emite certificado Let's Encrypt por DNS challenge, na ordem:
   - `rhythm.place`
   - `*.rhythm.place`
10. Habilita `certbot.timer` para renovacao automatica.

### Role `radio`

1. Instala `icecast2` e `liquidsoap`.
2. Configura e inicia Icecast2 (escutando em `127.0.0.1:8000`).
3. Cria script Liquidsoap em `/etc/liquidsoap/rhythm-place.liq` e inicia o servico `liquidsoap-rhythm-place.service`.

## Variaveis principais

Arquivo: `ansible/group_vars/all/main.yml`

### App

- `app_repo`: URL do repositorio git que sera deployado no servidor.
- `app_branch`: branch de deploy.
- `app_root`: pasta de deploy no servidor (`/var/www/rhythm.place`).
- `app_port`: porta local do Next.js (proxy pelo Nginx).
- `letsencrypt_email`: email para registro no Let's Encrypt.
- `letsencrypt_domains`: dominios do certificado (ordem ja configurada).
- `letsencrypt_cert_name`: nome do certificado/pasta em `/etc/letsencrypt/live/`.

### Icecast2

- `icecast_hostname`: hostname publico do Icecast (`stream.rhythm.place`).
- `icecast_port`: porta de escuta interna (padrao: `8000`).
- `icecast_tls_port`: porta TLS interna usada pelo Nginx para proxy reverso (padrao: `8443`).
- `icecast_tls_certificate_path`: arquivo PEM combinado lido pelo Icecast.
- `icecast_max_clients`: limite de clientes simultaneos (padrao: `100`).
- `icecast_max_sources`: limite de fontes simultaneas (padrao: `5`).

### Liquidsoap

- `liquidsoap_mount`: mount point do stream no Icecast (padrao: `/main`).
- `liquidsoap_playlist_dir`: diretorio de playlists no servidor (`/var/lib/liquidsoap/playlists`).

## Ansible Vault (credenciais de API)

Segredos esperados em `ansible/group_vars/all/vault.yml`:

```yaml
cloudflare_account_id: "<ACCOUNT_ID>"
cloudflare_api_token: "<TOKEN_COM_PERMISSAO_DNS_EDIT>"

icecast_source_password: "<SENHA_SOURCE>"
icecast_relay_password: "<SENHA_RELAY>"
icecast_admin_password: "<SENHA_ADMIN>"
```

Passos:

```bash
./scripts/ansible-vault-init.sh
ansible-vault edit ansible/group_vars/all/vault.yml --vault-password-file ansible/.vault_pass
```

## Deploy

1. Ajuste `app_repo` em `ansible/group_vars/all/main.yml` (se necessario).
2. Preencha e encripte o vault.
3. Se usar GitHub Actions para deploy por SSH/SCP, voce pode usar o usuario `nginx`, desde que o secret `PROJECT_PATH` aponte para a pasta de deploy correta. A role `web` tambem instala um sudoers restrito para permitir `sudo /usr/bin/systemctl` sem senha.
3. Rode:

```bash
./scripts/deploy.sh
```

Com argumentos extras do Ansible:

```bash
./scripts/deploy.sh --limit ate --check
```

O deploy tambem gera `/var/www/rhythm.place/.env.production` no servidor com:

```dotenv
ICECAST_INTERNAL_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_STREAM_URL=https://stream.rhythm.place/stream
```

## Stack Docker local

Para mimetizar a infraestrutura da VPS localmente, a stack Docker sobe os mesmos blocos principais:

- Next.js rodando com Bun em modo buildado (`bun run build` + `bun run start`)
- Nginx como proxy reverso na porta `80`
- Icecast2 exposto via Nginx na porta `8000`
- Liquidsoap lendo sua biblioteca local e publicando no Icecast

### Preparacao

1. Copie o arquivo de exemplo:

```bash
cp .env.docker.example .env.docker
```

2. Edite `MUSIC_DIR` em `.env.docker` com o caminho absoluto da sua pasta de musicas.
3. Ajuste as senhas do Icecast em `.env.docker`.

### Subir a stack

```bash
./scripts/docker-stack.sh up
```

O script faz duas coisas antes de subir os containers:

- valida `MUSIC_DIR`
- recria `./playlists/` com links simbolicos para os arquivos encontrados em sua biblioteca, que e o formato esperado pelo Liquidsoap nesta stack local

### Comandos uteis

```bash
./scripts/docker-stack.sh playlist
./scripts/docker-stack.sh ps
./scripts/docker-stack.sh logs
./scripts/docker-stack.sh logs liquidsoap
./scripts/docker-stack.sh down
```

### Endpoints locais

- Site: `http://localhost`
- Icecast admin/publico via proxy: `http://localhost:8000`
- Stream: `http://localhost:8000/stream`

### Observacoes da stack local

- O volume da biblioteca e montado como somente leitura em `/music` dentro do container do Liquidsoap.
- A playlist local e gerada em `./playlists/` e ignorada pelo Git.
- Se voce adicionar ou remover faixas da sua biblioteca, rode `./scripts/docker-stack.sh playlist` ou `./scripts/docker-stack.sh restart`.

## Firewall (ufw)

A role Ansible já configura o ufw automaticamente ao provisionar. Para abrir portas manualmente:

```bash
# Habilitar o ufw (caso ainda nao esteja ativo)
sudo ufw enable

# Permitir HTTP e HTTPS (obrigatorio para o site e Let's Encrypt)
sudo ufw allow 80/tcp # http
sudo ufw allow 443/tcp # https
sudo ufw allow 5432/tcp # Postgres

# Verificar regras ativas
sudo ufw status verbose
```

> As portas internas (Next.js :3030, Icecast :8000/:8443) nao precisam ser abertas no firewall — o Nginx faz o proxy reverso.

## Banco de dados (PostgreSQL)

O banco precisa ser criado manualmente no servidor antes do primeiro deploy.

### 1. Criar role e banco

```bash
sudo -i -u postgres psql
```

```sql
CREATE ROLE rhythm WITH LOGIN PASSWORD 'password';
CREATE DATABASE rhythm OWNER rhythm;
GRANT ALL PRIVILEGES ON DATABASE rhythm TO rhythm;
```

Substitua `'password'` pela senha real (definida no vault ou `.env.production`).

### 2. Configurar autenticacao (`pg_hba.conf`)

Arquivo: `/etc/postgresql/17/main/pg_hba.conf`

Verifique se ja existe uma linha que permite conexoes TCP locais com autenticacao por senha para o usuario `rhythm`. A linha padrao do Debian cobre isso:

```
host    all             all             127.0.0.1/32            scram-sha-256
```

Se ela nao existir, adicione antes das demais regras `host`:

```
host    rhythm          rhythm          127.0.0.1/32            scram-sha-256
```

Apos editar, recarregue o PostgreSQL:

```bash
sudo systemctl reload postgresql
```

### 3. Verificar `listen_addresses` (`postgresql.conf`)

Arquivo: `/etc/postgresql/17/main/postgresql.conf`

O padrao (`listen_addresses = 'localhost'`) e suficiente — a app esta no mesmo servidor. Confirme:

```bash
sudo grep listen_addresses /etc/postgresql/17/main/postgresql.conf
```

Resultado esperado: `listen_addresses = 'localhost'` (ou `'*'` se ja foi alterado).

### 4. Definir `DATABASE_URL` no ambiente

Adicione a variavel em `/var/www/rhythm.place/.env.production`:

```dotenv
DATABASE_URL=postgresql://rhythm:password@127.0.0.1:5432/rhythm
```

## Operacao no servidor

Servicos principais:

```bash
sudo systemctl status rhythm-place
sudo systemctl status nginx
sudo systemctl status icecast2
sudo systemctl status liquidsoap-rhythm-place
sudo systemctl status certbot.timer
```

Logs:

```bash
sudo journalctl -u rhythm-place -f
sudo journalctl -u liquidsoap-rhythm-place -f
sudo tail -f /var/log/icecast2/error.log
```

## Streaming

Apos o provisionamento, adicione arquivos de audio ao diretorio de playlists no servidor:

```
/var/lib/liquidsoap/playlists/
```

O Liquidsoap le a pasta automaticamente (modo randomize, reload a cada hora) e envia o stream para o Icecast2 em `127.0.0.1:8000/stream` com MP3 128 kbps.

## Observacoes

- O inventario inclui o host `ate` em `ansible/hosts`.
- A unit systemd executa o Next.js com `bun --bun next start` e usuario `nginx`.
- O Icecast2 escuta apenas em `127.0.0.1` (acesso externo via Nginx).
- O certificado e emitido com `--cert-name rhythm.place`, resultando em `/etc/letsencrypt/live/rhythm.place/`.
- O hook ` /etc/letsencrypt/renewal-hooks/deploy/rhythm-place-cert-hook` recria o PEM do Icecast com permissao `0640` e grupo `icecast` a cada emissao/renovacao.
