# 🚀 Deploy Agora - Checklist Final

## ✅ O Que Já Foi Feito

- ✅ Workflow atualizado para usar `viladajuda`
- ✅ Pastas criadas no servidor (`css/`, `js/`, `images/`, `api/`)
- ✅ Código commitado e push realizado
- ✅ Documentação atualizada

## 🔧 O Que Você Precisa Fazer AGORA

### **1. Atualizar Secret no GitHub (OBRIGATÓRIO)**

1. Acesse: https://github.com/lourealiza/ViladAjuda/settings/secrets/actions
2. Encontre o secret **`KINGHOST_FTP_USER`**
3. Clique em **"Update"** (ou delete e crie novo)
4. Verifique se o valor está como **`viladajuda`**
5. Clique em **"Update secret"**

### **2. Verificar Outros Secrets**

Certifique-se de que estes secrets estão configurados:

- ✅ **`KINGHOST_FTP_HOST`** - **`ftp.viladajuda.com.br`**
- ✅ **`KINGHOST_FTP_USER`** - **`viladajuda`**
- ✅ **`KINGHOST_FTP_PASSWORD`** - Sua senha FTP

### **3. Disparar o Deploy**

**Opção A: Deploy Automático (Recomendado)**
- Faça qualquer mudança pequena e push
- O deploy será automático

**Opção B: Deploy Manual**
1. Acesse: https://github.com/lourealiza/ViladAjuda/actions
2. Clique em **"Deploy to KingHost"** no menu lateral
3. Clique em **"Run workflow"** (canto superior direito)
4. Selecione a branch: **master** (branch padrão)
5. Clique em **"Run workflow"**

### **4. Acompanhar o Deploy**

1. Acesse: https://github.com/lourealiza/ViladAjuda/actions
2. Clique no workflow em execução
3. Veja os logs em tempo real
4. Aguarde terminar (2-3 minutos)

### **5. Verificar se Funcionou**

Após o deploy terminar:

1. **Limpe o cache do navegador**: `Ctrl + Shift + R`
2. **Acesse**: https://www.viladajuda.com.br/
3. **Verifique**:
   - Site carrega corretamente
   - Mostra "Alvorada Tropical" e "Vila do Canto"
   - CSS e JS carregam

---

## 🚨 Se Der Erro

### **Erro: "550 Permission denied"**
- ✅ Pastas já foram criadas (já fizemos isso)
- Verifique se o usuário FTP está correto: `viladajuda`

### **Erro: "Secret not found"**
- Verifique se todos os 3 secrets estão configurados
- Verifique se o nome está exato: `KINGHOST_FTP_USER`

### **Erro: "Connection refused"**
- Verifique se o `KINGHOST_FTP_HOST` está correto
- Teste conexão FTP manualmente

---

## 📋 Checklist Rápido

- [ ] Secret `KINGHOST_FTP_USER` configurado com valor `viladajuda`
- [ ] Secret `KINGHOST_FTP_HOST` configurado
- [ ] Secret `KINGHOST_FTP_PASSWORD` configurado
- [ ] Workflow "Deploy to KingHost" habilitado
- [ ] Deploy disparado (automático ou manual)
- [ ] Deploy terminou com sucesso
- [ ] Site atualizado no navegador

---

## 🎯 Próximo Passo Imediato

**ATUALIZE O SECRET `KINGHOST_FTP_USER` NO GITHUB AGORA!**

Depois disso, o deploy deve funcionar perfeitamente! 🚀

