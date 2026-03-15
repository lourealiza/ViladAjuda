# 🚀 Configuração do Vercel

## ✅ Status

O código foi atualizado para funcionar como **Vercel Serverless Functions**. 

**Mudanças realizadas:**
- ✅ `api/index.js` - Handler serverless para Vercel
- ✅ `vercel.json` - Configuração de build e rotas
- ✅ `.vercelignore` - Arquivos ignorados no deploy
- ✅ `.env.production` - Variáveis para produção

---

## 🔧 Próximas Etapas (No Painel do Vercel)

### 1. Ir para https://vercel.com/lourealizas-projects/viladajuda/settings

### 2. Clicar em **Environment Variables**

### 3. Adicionar as seguintes variáveis:

```
NODE_ENV=production
DB_TYPE=mysql
DB_HOST=db4free.net
DB_USER=viladajuda
DB_PASSWORD=ViladAjuda2026!
DB_NAME=viladajuda_db
DB_PORT=3306
JWT_SECRET=vila-d-ajuda-secret-key-2026-prod
FRONTEND_URL=https://www.viladajuda.com.br
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app
```

### 4. Clicar em "Save"

### 5. Ir para **Deployments** e clicar no último deployment

### 6. Clicar em ⋮ (menu) → **Redeploy**

---

## ✅ Endpoint da API

Após o redeploy, o backend estará disponível em:

```
https://viladajuda-4vpy0i69u-lourealizas-projects.vercel.app/api
```

**Teste:**
```bash
curl https://viladajuda-4vpy0i69u-lourealizas-projects.vercel.app/api/
```

Deve retornar:
```json
{
  "mensagem": "API Vila d'Ajuda funcionando!",
  "versao": "2.0.0",
  "status": "online"
}
```

---

## 🐧 Alternativa: Usar PostgreSQL gratuito (Recomendado)

Se quiser usar PostgreSQL em vez de MySQL:

1. Criar conta em https://railway.app
2. Criar banco PostgreSQL gratuito
3. Atualizar o código para usar PostgreSQL (criar `src/config/database-postgres.js`)
4. Adicionar variáveis de ambiente no Vercel

---

## 📝 Notas

- SQLite **NÃO funciona** em Vercel (arquivo é deletado entre deployments)
- O MySQL em `db4free.net` é gratuito e funciona bem
- Todas as tabelas serão criadas automaticamente na primeira requisição
- As notificações usam Socket.io que requer HTTPS (funciona no Vercel)
