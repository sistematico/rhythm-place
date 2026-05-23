# Rhythm Place

Automacao de infraestrutura e deploy para o app Next.js (`next@latest`) com:
- Nginx como proxy reverso
- Node.js LTS
- Bun (latest)
- systemd unit rodando o app com usuario `nginx`
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

1. Instala pacotes base (`nginx`, `certbot`, plugin DNS Cloudflare, `git`, etc.).
2. Instala Node.js LTS via NodeSource.
3. Instala Bun (latest) em `/usr/local/bin/bun`.
4. Garante usuario/grupo `nginx` para runtime da app.
5. Faz checkout do repositorio da app em `/srv/rhythm.place`.
6. Executa `bun install --frozen-lockfile` e `bun run build`.
7. Cria unit `rhythm-place.service` no systemd.
8. Configura Nginx para `rhythm.place` e `*.rhythm.place`.
9. Emite certificado Let's Encrypt por DNS challenge, na ordem:
   - `rhythm.place`
   - `*.rhythm.place`
10. Habilita `certbot.timer` para renovacao automatica.

## Variaveis principais

Arquivo: `ansible/group_vars/all/main.yml`

- `app_repo`: URL do repositorio git que sera deployado no servidor.
- `app_branch`: branch de deploy.
- `app_root`: pasta de deploy no servidor.
- `app_port`: porta local do Next.js (proxy pelo Nginx).
- `letsencrypt_email`: email para registro no Let's Encrypt.
- `letsencrypt_domains`: dominios do certificado (ordem ja configurada).
- `letsencrypt_cert_name`: nome do certificado/pasta em `/etc/letsencrypt/live/`.

## Ansible Vault (credenciais de API)

A role esta preparada para DNS challenge da Cloudflare.

Segredo esperado em `ansible/group_vars/all/vault.yml`:

```yaml
cloudflare_api_token: "<TOKEN_COM_PERMISSAO_DNS_EDIT>"
```

Passos:

```bash
./scripts/ansible-vault-init.sh
ansible-vault edit ansible/group_vars/all/vault.yml --vault-password-file ansible/.vault_pass
```

## Deploy

1. Ajuste `app_repo` em `ansible/group_vars/all/main.yml`.
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
sudo systemctl status certbot.timer
```

Logs da app:

```bash
sudo journalctl -u rhythm-place -f
```

## Observacoes

- O inventario inclui o host `ate` em `ansible/hosts`.
- A unit systemd executa o Next.js com `bun --bun next start` e usuario `nginx`.
- O certificado e emitido com `--cert-name rhythm.place`, resultando em `/etc/letsencrypt/live/rhythm.place/`.
