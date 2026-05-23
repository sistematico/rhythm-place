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

## Estrutura criada

- `ansible/site.yml`: playbook principal (host `ate`)
- `ansible/roles/web/`: role de provisionamento
- `ansible/group_vars/all/main.yml`: variaveis nao sensiveis
- `ansible/group_vars/all/vault.yml`: segredos (vault)
- `ansible/group_vars/all/vault.yml.example`: modelo de segredos
- `scripts/ansible-vault-init.sh`: inicializa vault local
- `scripts/ansible-provision.sh`: roda `ansible-playbook`
- `scripts/deploy.sh`: atalho de deploy

## O que a role configura

1. Instala pacotes base (`nginx`, `certbot`, plugin DNS Cloudflare, `git`, `icecast2`, `liquidsoap`, etc.).
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
11. Configura e inicia Icecast2 (escutando em `127.0.0.1:8000`).
12. Cria script Liquidsoap em `/etc/liquidsoap/rhythm-place.liq` e inicia o servico `liquidsoap-rhythm-place.service`.

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

- `icecast_hostname`: hostname publico do Icecast (`rhythm.place`).
- `icecast_port`: porta de escuta interna (padrao: `8000`).
- `icecast_max_clients`: limite de clientes simultaneos (padrao: `100`).
- `icecast_max_sources`: limite de fontes simultaneas (padrao: `5`).

### Liquidsoap

- `liquidsoap_mount`: mount point do stream no Icecast (padrao: `/stream`).
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
3. Rode:

```bash
./scripts/deploy.sh
```

Com argumentos extras do Ansible:

```bash
./scripts/deploy.sh --limit ate --check
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
