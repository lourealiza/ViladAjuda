# 🔧 Corrigir Erro CORS no Vercel

## ❌ Erro: `{"erro":"Not allowed by CORS"}`

Este erro ocorre quando o backend no Vercel não está permitindo requisições do frontend.

---

## ✅ Solução Rápida

### **1. Verificar Variável de Ambiente no Vercel**

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **ViladAjuda**
3. Vá em **Settings** → **Environment Variables**
4. Verifique se existe a variável:
   ```
   FRONTEND_URL=https://www.viladajuda.com.br
   ```

### **2. Se NÃO existir, adicione:**

1. Clique em **"Add New"**
2. **Key**: `FRONTEND_URL`
3. **Value**: `https://www.viladajuda.com.br`
4. **Environment**: Selecione **Production**, **Preview** e **Development**
5. Clique em **"Save"**

### **3. Fazer Redeploy**

Após adicionar/atualizar a variável:

1. Vá em **Deployments**
2. Clique nos **3 pontos** do deployment mais recente
3. Selecione **"Redeploy"**
4. Aguarde o build (2-3 minutos)

---

## 🔍 Verificar Configuração Atual

### **No Vercel Dashboard:**

1. **Settings** → **Environment Variables**
2. Procure por `FRONTEND_URL`
3. Deve estar configurado como: `https://www.viladajuda.com.br`

### **Testar CORS:**

```bash
# Teste com curl (deve funcionar)
curl -H "Origin: https://www.viladajuda.com.br" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://viladajuda.vercel.app/api/auth/login

# Deve retornar headers CORS permitindo a origem
```

---

## 📋 Checklist Completo

### **No Vercel:**
- [ ] Variável `FRONTEND_URL` existe
- [ ] Valor: `https://www.viladajuda.com.br`
- [ ] Configurado para Production, Preview e Development
- [ ] Fez redeploy após adicionar/atualizar

### **No Código:**
- [ ] `backend/src/server.js` tem configuração de CORS atualizada
- [ ] CORS aceita requisições sem origin
- [ ] CORS aceita variações do domínio (com/sem www)

### **Testar:**
- [ ] Health check funciona: `curl https://viladajuda.vercel.app/api/health`
- [ ] Login no admin funciona: https://www.viladajuda.com.br/admin.html
- [ ] Não há erros CORS no console do navegador

---

## 🚨 Se Ainda Não Funcionar

### **1. Verificar Logs no Vercel:**

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Deployments** → Clique no deployment mais recente
4. Clique em **"Functions"** → **"Logs"**
5. Procure por mensagens de CORS

### **2. Verificar Headers da Requisição:**

No console do navegador (F12), verifique:
- **Request URL**: Deve ser `https://viladajuda.vercel.app/api/...`
- **Origin**: Deve ser `https://www.viladajuda.com.br`
- **Response Headers**: Deve ter `Access-Control-Allow-Origin`

### **3. Testar com Postman/Insomnia:**

```bash
# GET request
GET https://viladajuda.vercel.app/api/health
Headers:
  Origin: https://www.viladajuda.com.br

# Deve retornar 200 OK com headers CORS
```

---

## 💡 Dica: Variáveis Múltiplas

Se você quiser permitir múltiplos domínios, separe por vírgula:

```
FRONTEND_URL=https://www.viladajuda.com.br,https://viladajuda.com.br,http://localhost:3000
```

---

## 🔄 Após Corrigir

1. **Aguarde o redeploy** (2-3 minutos)
2. **Limpe o cache do navegador**: `Ctrl + Shift + R`
3. **Teste novamente**:
   - Acesse: https://www.viladajuda.com.br/admin.html
   - Tente fazer login
   - Não deve mais aparecer erro CORS

---

## ✅ Código Atualizado

O código em `backend/src/server.js` foi atualizado para:
- ✅ Aceitar requisições sem origin
- ✅ Aceitar variações do domínio (com/sem www)
- ✅ Logs de debug para identificar problemas
- ✅ Métodos e headers permitidos configurados

**Próximo passo**: Verificar se `FRONTEND_URL` está configurado no Vercel! 🚀

