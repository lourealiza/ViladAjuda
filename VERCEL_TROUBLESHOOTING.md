# 🔧 Troubleshooting Vercel

## ❌ Erro: "This Serverless Function has crashed"

### ✅ Correções Aplicadas

1. **Modificado `server.js`** para ser compatível com serverless
2. **Criado `api/index.js`** como handler do Vercel
3. **Atualizado `vercel.json`** para usar o handler correto
4. **Adicionado `isConnected`** no database para evitar reconexões desnecessárias

---

## 📋 Checklist de Variáveis de Ambiente no Vercel

Configure estas variáveis em **Settings → Environment Variables**:

### **Obrigatórias:**
```
NODE_ENV=production
DB_TYPE=mysql
DB_HOST=viladajuda.web213.uni5.net
DB_USER=viladajuda
DB_PASSWORD=vila2026
DB_NAME=viladajuda
DB_PORT=3306
JWT_SECRET=aec08abd2d7cb846201f47f26d8b019d0dc4241b56ec84bd09bf098341443161f78a4720112c8651e2c53d380955317ea6035187650d0c4fe4181233980d2c0b
FRONTEND_URL=https://www.viladajuda.com.br
```

### **Opcionais:**
```
JWT_EXPIRE=7d
ENABLE_ACCESS_LOG=false
```

---

## 🔍 Como Verificar os Logs

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **viladajuda**
3. Vá em **Deployments** → Clique no deployment mais recente
4. Clique em **"Functions"** → **"Logs"**
5. Veja os erros em tempo real

---

## 🚨 Erros Comuns e Soluções

### **1. Erro: "Cannot find module"**
**Causa**: Dependências não instaladas  
**Solução**: 
- Verifique se `package.json` está na pasta `backend/`
- O Vercel instala automaticamente, mas pode falhar se o `Root Directory` estiver errado

### **2. Erro: "Connection refused" (MySQL)**
**Causa**: Credenciais do banco incorretas ou firewall bloqueando  
**Solução**:
- Verifique se `DB_HOST`, `DB_USER`, `DB_PASSWORD` estão corretos
- Verifique se o MySQL da KingHost permite conexões externas
- Pode precisar adicionar IP do Vercel no firewall do MySQL

### **3. Erro: "JWT_SECRET is not defined"**
**Causa**: Variável de ambiente não configurada  
**Solução**: Adicione `JWT_SECRET` nas Environment Variables

### **4. Erro: "CORS"**
**Causa**: `FRONTEND_URL` não configurado  
**Solução**: Adicione `FRONTEND_URL=https://www.viladajuda.com.br`

---

## 🔄 Após Corrigir Variáveis

1. **Redeploy obrigatório**:
   - Vá em **Deployments**
   - Clique nos **3 pontos** do deployment mais recente
   - Selecione **"Redeploy"**
   - Ou faça um novo commit/push

2. **Aguarde o build** (2-3 minutos)

3. **Teste a API**:
   ```bash
   curl https://viladajuda.vercel.app/api/health
   ```

---

## ✅ Verificar se Está Funcionando

### **1. Health Check**
```bash
curl https://viladajuda.vercel.app/api/health
```
**Deve retornar**: `{"status":"ok","timestamp":"..."}`

### **2. API Principal**
```bash
curl https://viladajuda.vercel.app/api/
```
**Deve retornar**: JSON com informações da API

### **3. Testar Login (Admin)**
1. Acesse: https://www.viladajuda.com.br/admin.html
2. Tente fazer login
3. Se funcionar, está tudo OK! ✅

---

## 📝 Estrutura de Arquivos no Vercel

O Vercel deve ver:
```
backend/
├── api/
│   └── index.js          ← Handler do Vercel (detectado automaticamente)
├── src/
│   ├── server.js         ← App Express
│   └── ...
├── package.json
└── vercel.json           ← Configuração simplificada (sem builds)
```

**Root Directory**: `backend/`

**Nota**: O Vercel detecta automaticamente funções serverless na pasta `api/`. Não precisa mais de `builds` no `vercel.json`.

---

## 🆘 Se Ainda Não Funcionar

1. **Verifique os logs** no Vercel (passo a passo acima)
2. **Copie o erro completo** dos logs
3. **Verifique todas as variáveis** de ambiente
4. **Teste conexão MySQL** localmente primeiro
5. **Verifique se o Root Directory** está como `backend/`

---

## 💡 Dica: Testar Localmente Primeiro

Antes de fazer deploy no Vercel, teste localmente:

```bash
cd backend
npm install
DB_TYPE=mysql DB_HOST=viladajuda.web213.uni5.net DB_USER=viladajuda DB_PASSWORD=vila2026 DB_NAME=viladajuda node src/server.js
```

Se funcionar localmente, funcionará no Vercel! ✅
