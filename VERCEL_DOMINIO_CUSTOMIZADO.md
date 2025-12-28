# 🌐 Domínio Customizado no Vercel (Opcional)

## ❓ Preciso adicionar domínio no Vercel?

**Resposta curta:** **NÃO é obrigatório**, mas é **recomendado** para uma URL mais profissional.

---

## 📊 Duas Opções

### **Opção 1: Usar URL do Vercel (Gratuito - Padrão)**
- ✅ **URL automática**: `https://viladajuda.vercel.app`
- ✅ **Já funciona** sem configuração adicional
- ✅ **SSL automático** incluído
- ✅ **Gratuito**
- ⚠️ URL menos profissional (tem `.vercel.app` no nome)

### **Opção 2: Domínio Customizado (Recomendado)**
- ✅ **URL profissional**: `https://api.viladajuda.com.br`
- ✅ **Mais fácil de lembrar**
- ✅ **SSL automático** incluído
- ✅ **Gratuito** no plano Hobby
- ⚠️ Precisa configurar DNS

---

## 🚀 Como Adicionar Domínio Customizado no Vercel

### **Passo 1: Acessar Configurações do Projeto**

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **ViladAjuda** (ou o nome que você deu)
3. Vá em **Settings** → **Domains**

### **Passo 2: Adicionar Domínio**

1. Clique em **"Add Domain"**
2. Digite o domínio desejado:
   - **Recomendado**: `api.viladajuda.com.br`
   - Ou: `backend.viladajuda.com.br`
   - Ou: `api.viladajuda.com` (sem www)
3. Clique em **"Add"**

### **Passo 3: Configurar DNS na KingHost**

O Vercel vai mostrar instruções de DNS. Você precisa adicionar um registro **CNAME**:

#### **No Painel da KingHost:**

1. Acesse o **Painel de Controle** da KingHost
2. Vá em **DNS** ou **Gerenciar DNS**
3. Adicione um novo registro:

   **Tipo**: `CNAME`  
   **Nome**: `api` (ou `backend`)  
   **Valor**: `cname.vercel-dns.com` (ou o que o Vercel indicar)  
   **TTL**: `3600` (ou padrão)

4. Salve as alterações

#### **Exemplo de Configuração DNS:**

```
Tipo: CNAME
Nome: api
Valor: cname.vercel-dns.com
TTL: 3600
```

### **Passo 4: Aguardar Propagação DNS**

- ⏱️ **Tempo**: 5 minutos a 24 horas (geralmente 10-30 minutos)
- 🔍 **Verificar**: O Vercel mostra status "Valid Configuration" quando estiver pronto

### **Passo 5: Atualizar Frontend**

Após o domínio estar funcionando, atualize `js/api.js`:

```javascript
// ANTES
const API_VERCEL_BASE_URL = 'https://viladajuda.vercel.app/api';

// DEPOIS (com domínio customizado)
const API_VERCEL_BASE_URL = 'https://api.viladajuda.com.br/api';
```

---

## 📋 Checklist Completo

### **No Vercel:**
- [ ] Projeto deployado e funcionando
- [ ] Acessou Settings → Domains
- [ ] Adicionou domínio `api.viladajuda.com.br`
- [ ] Vercel mostrou instruções de DNS

### **Na KingHost:**
- [ ] Acessou painel de DNS
- [ ] Adicionou registro CNAME:
  - Nome: `api`
  - Valor: `cname.vercel-dns.com`
- [ ] Salvou alterações

### **Aguardar:**
- [ ] DNS propagou (verificar no Vercel)
- [ ] Status mostra "Valid Configuration"

### **Atualizar Código:**
- [ ] Atualizou `js/api.js` com nova URL
- [ ] Fez commit e push
- [ ] Testou no site

---

## 🧪 Testar Domínio Customizado

### **1. Verificar DNS (antes de configurar no Vercel)**
```bash
# No terminal
nslookup api.viladajuda.com.br

# Deve mostrar o CNAME apontando para Vercel
```

### **2. Testar API (após configurar)**
```bash
# Health check
curl https://api.viladajuda.com.br/api/health

# Deve retornar: {"status":"ok","timestamp":"..."}
```

### **3. Testar no Navegador**
- Acesse: https://api.viladajuda.com.br/api/health
- Deve mostrar JSON com status OK

---

## 💡 Recomendações

### **Qual domínio usar?**

| Opção | URL | Recomendação |
|-------|-----|--------------|
| **Subdomínio API** | `api.viladajuda.com.br` | ⭐ **Melhor opção** |
| **Subdomínio Backend** | `backend.viladajuda.com.br` | ✅ Boa opção |
| **Subdomínio App** | `app.viladajuda.com.br` | ✅ Alternativa |

### **Por que `api.viladajuda.com.br`?**
- ✅ Padrão da indústria
- ✅ Fácil de lembrar
- ✅ Separa claramente frontend e backend
- ✅ SEO-friendly

---

## ⚠️ Importante

### **Não é obrigatório!**
- Você pode usar `https://viladajuda.vercel.app` sem problemas
- Funciona perfeitamente para desenvolvimento e produção
- SSL automático incluso

### **Quando usar domínio customizado?**
- ✅ Quer URL mais profissional
- ✅ Quer facilitar manutenção (URL mais fácil de lembrar)
- ✅ Quer seguir padrões da indústria

### **Quando NÃO usar?**
- ⚠️ Não tem acesso ao painel DNS da KingHost
- ⚠️ Não quer configurar DNS agora
- ⚠️ Está apenas testando

---

## 🆘 Troubleshooting

### **Erro: "Invalid Configuration"**
- Verifique se o CNAME está correto no DNS
- Aguarde mais tempo para propagação (pode levar até 24h)

### **Erro: "Domain not verified"**
- Verifique se o DNS está apontando corretamente
- Use ferramenta: https://dnschecker.org

### **Erro: SSL não funciona**
- Aguarde alguns minutos após configurar DNS
- O Vercel configura SSL automaticamente (pode levar 5-10 minutos)

---

## 📝 Resumo

| Aspecto | URL Vercel | Domínio Customizado |
|---------|------------|---------------------|
| **Configuração** | ✅ Automática | ⚠️ Precisa DNS |
| **Custo** | ✅ Grátis | ✅ Grátis |
| **SSL** | ✅ Automático | ✅ Automático |
| **URL** | `viladajuda.vercel.app` | `api.viladajuda.com.br` |
| **Profissional** | ⚠️ Menos | ✅ Mais |

---

## 🎯 Recomendação Final

**Para começar:** Use a URL do Vercel (`viladajuda.vercel.app`)  
**Depois:** Configure domínio customizado (`api.viladajuda.com.br`) quando tiver tempo

**Ambos funcionam perfeitamente!** 🚀

