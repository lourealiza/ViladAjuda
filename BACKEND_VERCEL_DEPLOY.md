# 🚀 Deploy Backend Node.js no Vercel

## ❌ Problema na KingHost
A hospedagem compartilhada da KingHost **não suporta Node.js**, PM2 ou npm. O backend não consegue rodar.

## ✅ Solução: Vercel (Gratuito & Confiável)

### **Por que Vercel?**
- ✅ **Gratuito** para projetos pessoais
- ✅ **Deploy automático** via Git
- ✅ **Suporte completo** a Node.js
- ✅ **SSL automático**
- ✅ **CDN global** (rápido)
- ✅ **Integração perfeita** com GitHub

---

## 📋 Passo a Passo para Deploy

### **1. Criar Conta no Vercel**
1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Faça login com sua conta GitHub
4. Autorize o acesso ao repositório

### **2. Importar Projeto**
1. No dashboard do Vercel, clique **"Import Project"**
2. Selecione **"Import Git Repository"**
3. Escolha o repositório **ViladAjuda**
4. Configure:
   - **Root Directory**: `backend/`
   - **Build Command**: `npm run build` (ou vazio se não tiver)
   - **Output Directory**: (vazio)

### **3. Configurar Environment Variables**
Adicione estas variáveis no Vercel:

```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://www.viladajuda.com.br

# Database MySQL (mesmas credenciais da KingHost)
DB_HOST=viladajuda.web213.uni5.net
DB_USER=viladajuda
DB_PASSWORD=vila2026
DB_NAME=viladajuda

# JWT Secret (crie um seguro)
JWT_SECRET=sua-chave-secreta-super-segura-aqui
```

### **4. Deploy**
1. Clique **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. ✅ **URL gerada automaticamente**: `https://viladajuda-api.vercel.app`

---

## 🔧 Atualizar Frontend

### **Modificar `js/api.js`**
```javascript
// ANTES (linha 3-7)
const API_BASE_URL = window.location.hostname === 'www.viladajuda.com.br'
    ? 'https://www.viladajuda.com.br/api'
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.protocol}//${window.location.host}/api`
        : `${window.location.protocol}//${window.location.host}/api`);

// DEPOIS
const API_BASE_URL = window.location.hostname === 'www.viladajuda.com.br'
    ? 'https://viladajuda-api.vercel.app'  // <- URL DO VERCEL
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.protocol}//${window.location.host}/api`
        : `${window.location.protocol}//${window.location.host}/api`);
```

### **Deploy do Frontend**
```bash
git add js/api.js
git commit -m "fix: atualizar URL da API para Vercel"
git push origin main
```

---

## 📊 Arquitetura Final

```
🌐 Frontend (KingHost) → https://www.viladajuda.com.br/
    ↓
🔧 Backend API (Vercel) → https://viladajuda-api.vercel.app/
    ↓
🗄️ Database (KingHost) → viladajuda.web213.uni5.net
```

### **Vantagens desta Arquitetura:**
- ✅ **Frontend rápido** (CDN KingHost)
- ✅ **API robusta** (Node.js no Vercel)
- ✅ **Banco seguro** (MySQL na KingHost)
- ✅ **Custos zero** (Vercel gratuito)
- ✅ **Deploy automático** em ambos

---

## 🧪 Testes Após Deploy

### **1. Testar API no Vercel**
```bash
curl https://viladajuda-api.vercel.app/health
# Deve retornar: {"status":"ok","timestamp":"2025-..."}
```

### **2. Testar Login no Admin**
1. Acesse: https://www.viladajuda.com.br/admin.html
2. Tente fazer login
3. Deve funcionar com o backend no Vercel

### **3. Testar Reserva Completa**
1. Faça uma reserva de teste no site
2. Deve usar API PHP para disponibilidade + API Node.js para processamento

---

## 🔍 Monitoramento

### **Logs no Vercel**
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Clique em **"Functions"** → **"Logs"**
4. Veja logs em tempo real

### **Analytics Gratuito**
- Vercel oferece analytics básico gratuito
- Monitore uso e performance

---

## 💰 Custos

| Serviço | Plano | Custo |
|---------|-------|-------|
| KingHost | Compartilhado | R$ 19,90/mês |
| Vercel | Hobby | **GRÁTIS** |
| MySQL | Incluído na KingHost | **INCLUÍDO** |
| **TOTAL** | | **R$ 19,90/mês** |

---

## 🚨 Troubleshooting

### **Erro de CORS?**
Adicione no Vercel Environment Variables:
```
FRONTEND_URL=https://www.viladajuda.com.br
```

### **Erro de Database?**
Verifique se as credenciais MySQL estão corretas no Vercel.

### **API não responde?**
1. Verifique logs no Vercel
2. Teste conexão MySQL: `backend/src/scripts/testarMySQL.js`

---

## 🎉 Conclusão

Com o backend no Vercel:
- ✅ **Painel admin funciona completamente**
- ✅ **Sistema de reservas avançado**
- ✅ **Autenticação e segurança**
- ✅ **Analytics e tracking**
- ✅ **Custos reduzidos**
- ✅ **Performance otimizada**

**Próximo passo**: Criar conta no Vercel e fazer deploy! 🚀
