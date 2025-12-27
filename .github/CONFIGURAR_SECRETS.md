# 🔐 Configurar Secrets no GitHub - Guia Rápido

## 📋 Credenciais FTP da KingHost

Com base nas informações fornecidas:

- **Usuário FTP**: `viladajuda`
- **Senha FTP**: `vila2026`
- **Host FTP**: `viladajuda.web213.uni5.net` ou `ftp.viladajuda.web213.uni5.net`

## 🚀 Passo a Passo para Configurar

### 1. Acesse o Repositório no GitHub

**Link direto**: `https://github.com/lourealiza/ViladAjuda/settings/secrets/actions`

Ou siga este caminho:
1. Acesse: https://github.com/lourealiza/ViladAjuda
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**

### 2. Adicione os 3 Secrets

Clique em **"New repository secret"** para cada um:

#### Secret 1: `KINGHOST_FTP_HOST`
- **Name**: `KINGHOST_FTP_HOST`
- **Secret**: `viladajuda.web213.uni5.net` ou `ftp.viladajuda.web213.uni5.net`
- Clique em **"Add secret"**

#### Secret 2: `KINGHOST_FTP_USER`
- **Name**: `KINGHOST_FTP_USER`
- **Secret**: `viladajuda`
- Clique em **"Add secret"**

#### Secret 3: `KINGHOST_FTP_PASSWORD`
- **Name**: `KINGHOST_FTP_PASSWORD`
- **Secret**: `vila2026`
- Clique em **"Add secret"**

### 3. Verificar Host FTP

Se não souber o host FTP exato, você pode:

1. **Acessar o Painel KingHost**: https://painel.kinghost.com.br
2. **Ir em FTP** ou **Gerenciador de Arquivos**
3. **Verificar o host** fornecido (geralmente aparece como `ftp.viladajuda.web213.uni5.net` ou similar)

### 4. Testar o Deploy

Após configurar os 3 secrets:

1. Vá em **Actions** no GitHub
2. Clique em **"Deploy to KingHost"**
3. Clique em **"Run workflow"**
4. Selecione a branch `main`
5. Clique em **"Run workflow"**

## ✅ Checklist

- [ ] Secret `KINGHOST_FTP_HOST` configurado
- [ ] Secret `KINGHOST_FTP_USER` configurado com valor `viladajuda`
- [ ] Secret `KINGHOST_FTP_PASSWORD` configurado com valor `vila2026`
- [ ] Workflow executado com sucesso

## ⚠️ Importante

- **Nunca** commite essas credenciais no código
- **Sempre** use Secrets do GitHub
- Mantenha as credenciais seguras e privadas

## 🔍 Verificar se Funcionou

Após o deploy, acesse:
- **Site**: https://www.viladajuda.com.br/
- **API**: https://www.viladajuda.com.br/api/

## 📁 Caminho do Servidor

O diretório correto no servidor é `www/` (caminho relativo ao diretório home do usuário FTP).
A pasta `api/` já existe neste diretório.

