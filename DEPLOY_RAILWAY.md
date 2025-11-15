# 🚂 Deploy do Backend na Railway

## 🎯 O que vamos fazer

Fazer deploy do backend Node.js na Railway com:
- ✅ Deploy automático do GitHub
- ✅ PostgreSQL gratuito
- ✅ SSL automático
- ✅ URL pública

---

## 📋 Pré-requisitos

✅ Código no GitHub (já feito!)
✅ Conta no GitHub
✅ Backend testado localmente (já feito!)

---

## 🚀 Passo a Passo

### 1. Criar conta na Railway

1. Acesse: https://railway.app
2. Clique em **"Start a New Project"**
3. **Login com GitHub**
4. Autorize o Railway a acessar seus repositórios

---

### 2. Criar novo projeto

1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Procure e selecione: **`lourealiza/ViladAjuda`**
4. A Railway vai detectar automaticamente que é Node.js!

---

### 3. Configurar o projeto

#### Selecionar a pasta do backend:

1. No dashboard do projeto, clique em **Settings**
2. Em **"Root Directory"**, defina: `backend`
3. Em **"Start Command"**, defina: `npm start`
4. Clique em **"Save Changes"**

---

### 4. Adicionar Banco de Dados PostgreSQL

1. No projeto, clique em **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. Railway vai criar um banco automaticamente!

---

### 5. Configurar Variáveis de Ambiente

1. Clique no serviço do backend (web service)
2. Vá em **"Variables"**
3. Adicione as seguintes variáveis:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=viladajuda_jwt_secret_production_2025_muito_seguro
JWT_EXPIRE=7d
FRONTEND_URL=http://viladajuda.web213.uni5.net
```

**Para o banco de dados:**

A Railway automaticamente adiciona a variável `DATABASE_URL` quando você adiciona PostgreSQL.

Mas nosso código usa SQLite. Temos duas opções:

#### Opção A: Continuar com SQLite (mais simples)
Adicione:
```
DB_PATH=./database.sqlite
```

#### Opção B: Migrar para PostgreSQL (recomendado para produção)
Vamos precisar ajustar o código (vou criar um guia separado se quiser)

---

### 6. Deploy Automático

1. A Railway vai fazer o deploy automaticamente!
2. Aguarde alguns minutos
3. Você verá os logs em tempo real

---

### 7. Obter URL Pública

1. No dashboard, clique no serviço
2. Vá em **"Settings"**
3. Em **"Domains"**, clique em **"Generate Domain"**
4. Railway vai criar uma URL como: `viladajuda-production.up.railway.app`
5. **Copie essa URL!** Você vai precisar dela

---

### 8. Inicializar Banco de Dados

Você precisa executar o comando `npm run init-db` no servidor.

Opções:

#### Via Railway CLI (recomendado):
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Executar comando
railway run npm run init-db
```

#### Via script customizado:
Adicione no `package.json`:
```json
{
  "scripts": {
    "start": "node src/config/initDatabase.js && node src/server.js"
  }
}
```

Isso vai inicializar o banco automaticamente toda vez que o servidor inicia.

---

### 9. Testar a API

Acesse no navegador:
```
https://sua-url.up.railway.app/api/chales
```

Você deve ver a lista de chalés!

---

## ✅ Checklist de Verificação

- [ ] Projeto criado na Railway
- [ ] Repositório GitHub conectado
- [ ] Root Directory configurado para `backend`
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy concluído com sucesso
- [ ] URL pública gerada
- [ ] Banco de dados inicializado
- [ ] API testada e funcionando

---

## 🔧 Troubleshooting

### Build falha
- Verifique os logs na Railway
- Certifique-se que `Root Directory` é `backend`
- Verifique se `package.json` está correto

### Aplicação não inicia
- Verifique as variáveis de ambiente
- Veja os logs de runtime
- Certifique-se que PORT está definido

### Banco de dados não funciona
- Execute `npm run init-db` via Railway CLI
- Ou ajuste o script de start

---

## 💰 Custos

**Plano Hobby (Gratuito):**
- $5 de crédito/mês
- Suficiente para:
  - 1 web service pequeno
  - 1 banco PostgreSQL pequeno
  - Uso leve/médio

**Quando precisa pagar:**
- Após $5/mês de uso
- Geralmente acontece com:
  - Muito tráfego (milhares de requisições/dia)
  - Banco de dados grande
  - Múltiplos serviços

Para um site de chalés começando: **O plano gratuito é suficiente!**

---

## 🎯 Próximo Passo

Depois do backend no ar, vamos:
1. Atualizar o frontend para usar a URL da API
2. Fazer deploy do frontend na KingHost
3. Testar tudo funcionando junto!

---

## 📞 Suporte

- Documentação: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://railway.app/status

---

**URL da API depois do deploy:**
```
https://sua-url.up.railway.app/api
```

**Anote essa URL! Vamos precisar dela no frontend.** 📝

