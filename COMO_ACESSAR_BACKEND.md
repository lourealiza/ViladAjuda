# 🔧 Como Acessar o Backend

## 📊 Situação Atual

Você tem **duas APIs** disponíveis:

### **1. API PHP (KingHost) - ✅ FUNCIONANDO**
- **URL**: https://www.viladajuda.com.br/api/
- **Status**: ✅ Deployado e funcionando
- **Rotas disponíveis**:
  - `/api/chales` - Listar chalés
  - `/api/disponibilidade` - Verificar disponibilidade
  - `/api/reservas` - Criar reservas
  - `/api/avaliacoes` - Buscar avaliações

### **2. Backend Node.js (Vercel) - ⚠️ PRECISA DEPLOYAR**
- **Status**: ⚠️ Ainda não deployado
- **Onde**: Vercel (gratuito)
- **Rotas avançadas**:
  - `/api/auth` - Autenticação (login admin)
  - `/api/admin` - Painel administrativo
  - `/api/hospedes` - CRM de hóspedes
  - `/api/tracking` - Analytics

---

## 🚀 Opção 1: Deployar Backend no Vercel (Recomendado)

### **Passo a Passo:**

1. **Acesse**: https://vercel.com
2. **Faça login** com sua conta GitHub
3. **Import Project**:
   - Selecione repositório: `lourealiza/ViladAjuda`
   - **Root Directory**: `backend/`
   - Clique **Deploy**

4. **Configure Environment Variables**:
   ```
   NODE_ENV=production
   DB_TYPE=mysql
   DB_HOST=viladajuda.web213.uni5.net
   DB_USER=viladajuda
   DB_PASSWORD=vila2026
   DB_NAME=viladajuda
   JWT_SECRET=aec08abd2d7cb846201f47f26d8b019d0dc4241b56ec84bd09bf098341443161f78a4720112c8651e2c53d380955317ea6035187650d0c4fe4181233980d2c0b
   FRONTEND_URL=https://www.viladajuda.com.br
   ```

5. **Após deploy**, você receberá uma URL como:
   - `https://viladajuda-api.vercel.app`

6. **Atualizar Frontend**:
   - Edite `js/api.js`
   - Adicione a URL do Vercel
   - Veja instruções abaixo

---

## 🔧 Opção 2: Usar Apenas API PHP (Atual)

Se você **não precisa** das funcionalidades avançadas do backend Node.js (painel admin, autenticação, etc.), pode usar apenas a **API PHP** que já está funcionando.

### **Acessar API PHP:**

```bash
# Health check
curl https://www.viladajuda.com.br/api/health

# Listar chalés
curl https://www.viladajuda.com.br/api/chales

# Verificar disponibilidade
curl https://www.viladajuda.com.br/api/disponibilidade/calendario?ano=2025&mes=1
```

### **No Navegador:**
- https://www.viladajuda.com.br/api/
- https://www.viladajuda.com.br/api/chales
- https://www.viladajuda.com.br/api/avaliacoes/homepage

---

## 📝 Atualizar Frontend para Usar Backend Vercel

Se você fez deploy no Vercel, atualize `js/api.js`:

### **1. Adicionar URL do Vercel**

```javascript
// Adicione após a linha 7:
const API_VERCEL_BASE_URL = 'https://viladajuda-api.vercel.app/api'; // ← SUA URL DO VERCEL
```

### **2. O código já está preparado!**

O `js/api.js` já tem a lógica para usar Vercel para rotas avançadas:
- `/auth/*` → Vercel
- `/admin/*` → Vercel
- `/hospedes/*` → Vercel
- Outras rotas → API PHP

---

## 🧪 Testar Backend

### **API PHP (KingHost):**
```bash
# Teste básico
curl https://www.viladajuda.com.br/api/

# Health check
curl https://www.viladajuda.com.br/api/health
```

### **Backend Node.js (Vercel - após deploy):**
```bash
# Teste básico
curl https://viladajuda-api.vercel.app/api/

# Health check
curl https://viladajuda-api.vercel.app/api/health
```

---

## 📋 Resumo

| Funcionalidade | API | URL |
|---------------|-----|-----|
| **Chalés** | PHP | https://www.viladajuda.com.br/api/chales |
| **Disponibilidade** | PHP | https://www.viladajuda.com.br/api/disponibilidade |
| **Reservas** | PHP | https://www.viladajuda.com.br/api/reservas |
| **Avaliações** | PHP | https://www.viladajuda.com.br/api/avaliacoes |
| **Login Admin** | Node.js | (precisa deploy no Vercel) |
| **Painel Admin** | Node.js | (precisa deploy no Vercel) |

---

## 🎯 Próximo Passo

**Escolha uma opção:**

1. **Deployar no Vercel** → Veja `BACKEND_VERCEL_DEPLOY.md`
2. **Usar apenas API PHP** → Já está funcionando! ✅

**Qual você prefere?** 🤔

