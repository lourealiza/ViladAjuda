# 🔐 Configurar GitHub Secrets para Deploy KingHost

O workflow automático de deploy necessita de credenciais SSH armazenadas como **GitHub Secrets**.

## ✅ Opção 1: Deploy com Chave SSH (Recomendado)

### Passo 1: Gerar Chave SSH (se não tiver)

```powershell
ssh-keygen -t ed25519 -C "viladajuda@viladajuda.com.br" -f "$HOME\.ssh\kinghost_key"
```

**Quando pergunta "Enter passphrase"**: Pressione ENTER (sem senha)

### Passo 2: Fazer Upload da Chave Pública para KingHost

```powershell
# Copiar conteúdo da chave pública
Get-Content "$HOME\.ssh\kinghost_key.pub"
```

1. Copie a saída
2. No painel KingHost (ou via SSH): Adicione em `~/.ssh/authorized_keys`

```bash
# Via SSH:
ssh viladajuda@viladajuda.com.br
mkdir -p ~/.ssh
echo "SEU_CONTEÚDO_DA_CHAVE_PÚBLICA_AQUI" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
exit
```

### Passo 3: Adicionar Secrets no GitHub

1. **Abra o repositório no GitHub**
2. Acesse: `Settings` → `Secrets and variables` → `Actions`
3. Clique em `New repository secret`

#### Secret 1: KINGHOST_SSH_HOST
- **Name:** `KINGHOST_SSH_HOST`
- **Value:** `viladajuda.com.br`
- Clique em `Add secret`

#### Secret 2: KINGHOST_SSH_USER
- **Name:** `KINGHOST_SSH_USER`
- **Value:** `viladajuda`
- Clique em `Add secret`

#### Secret 3: KINGHOST_SSH_KEY
- **Name:** `KINGHOST_SSH_KEY`
- **Value:** Cole o conteúdo da chave privada:
  ```powershell
  Get-Content "$HOME\.ssh\kinghost_key"
  ```
- Clique em `Add secret`

---

## ⚠️ Opção 2: Deploy com Senha SSH

Se preferir usar autenticação por senha (mais simples):

### Passo 1: Crie o Script de Deploy

Crie um arquivo `.github/workflows/deploy-kinghost-password.yml`:

```yaml
name: Deploy to KingHost (Password Auth)

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy via SSH with sshpass
        run: |
          # Instalar sshpass
          sudo apt-get update
          sudo apt-get install -y sshpass
          
          # Deploy via SFTP
          sshpass -p "${{ secrets.KINGHOST_SSH_PASSWORD }}" \
          sftp -o StrictHostKeyChecking=no \
            -o "BatchMode=no" \
            -r \
            -P 22 \
            "${{ secrets.KINGHOST_SSH_USER }}@${{ secrets.KINGHOST_SSH_HOST }}:/public_html/" \
            <<EOF
            lcd ./
            put -r admin.html
            put -r index.html
            put -r obrigado.html
            put -r css/
            put -r js/
            put -r images/
            exit
          EOF
```

### Passo 2: Adicionar Secret de Senha

1. Acesse: `Settings` → `Secrets and variables` → `Actions`
2. Clique em `New repository secret`
3. **Name:** `KINGHOST_SSH_PASSWORD`
4. **Value:** sua senha SSH
5. Clique em `Add secret`

---

## 🧪 Testar Localmente

Antes de fazer commit, teste a conexão:

```powershell
# Teste de conexão (será solicitada senha)
ssh viladajuda@viladajuda.com.br "ls -la /public_html/"

# Teste de SFTP
sftp viladajuda@viladajuda.com.br
cd /public_html/
ls -la
exit
```

---

## ✅ Verificar o Deploy

Após fazer um `push` para `main` ou `master`:

1. **GitHub → Actions**
2. Procure pelo workflow `Deploy to KingHost`
3. Verifique os logs
4. Acesse `https://viladajuda.com.br` para confirmar

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| **Permission denied (publickey)** | Verifique se a chave pública está em `~/.ssh/authorized_keys` |
| **Timeout na conexão** | KingHost pode estar com bloqueio de IP. Tente via proxy ou VPN |
| **Arquivo não atualizado** | Ajuste o caminho `remote_path` no workflow |
| **Muitos arquivos desnecessários** | Confirme que o `.gitignore` está filtrando corretamente |

---

## 📝 Resumo dos Secrets Necessários

```
KINGHOST_SSH_HOST = viladajuda.com.br
KINGHOST_SSH_USER = viladajuda
KINGHOST_SSH_KEY = (conteúdo da ~/.ssh/kinghost_key)
```

**Ou (segunda opção):**

```
KINGHOST_SSH_HOST = viladajuda.com.br
KINGHOST_SSH_USER = viladajuda
KINGHOST_SSH_PASSWORD = 2026dAjudaVila
```

---

## 🚀 Próximas Etapas

1. ✅ Configurar os secrets acima
2. ✅ Fazer um `git push` para ativar o workflow
3. ✅ Verificar em GitHub → Actions
4. ✅ Confirmar em https://viladajuda.com.br

Pronto! 🎉
