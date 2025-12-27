# 🔧 Habilitar Workflow "Deploy to KingHost"

## ❌ Problema
O workflow "Deploy to KingHost" não está aparecendo ou não está rodando no GitHub Actions.

## ✅ Soluções

### **1. Verificar se o Workflow Está Habilitado**

1. Acesse: https://github.com/lourealiza/ViladAjuda/actions
2. No menu lateral esquerdo, procure por **"Deploy to KingHost"**
3. Se aparecer com um ícone de ⚠️ ou estiver desabilitado:
   - Clique nele
   - Clique em **"Enable workflow"** ou **"Habilitar workflow"**

### **2. Disparar Manualmente (Workflow Dispatch)**

1. Acesse: https://github.com/lourealiza/ViladAjuda/actions
2. Clique em **"Deploy to KingHost"** no menu lateral
3. Clique no botão **"Run workflow"** (canto superior direito)
4. Selecione a branch: **main** ou **master**
5. Clique em **"Run workflow"** novamente

### **3. Verificar se o Arquivo Está no Repositório**

O arquivo deve estar em:
```
.github/workflows/deploy-kinghost.yml
```

Verifique se está commitado:
```bash
git ls-files .github/workflows/deploy-kinghost.yml
```

Se não aparecer, faça:
```bash
git add .github/workflows/deploy-kinghost.yml
git commit -m "fix: adicionar workflow deploy-kinghost"
git push origin main
```

### **4. Verificar Permissões do GitHub Actions**

1. Acesse: https://github.com/lourealiza/ViladAjuda/settings/actions
2. Verifique se **"Allow all actions and reusable workflows"** está habilitado
3. Ou pelo menos **"Allow local actions and reusable workflows"**

### **5. Verificar Secrets Configurados**

O workflow precisa destes secrets:
- `KINGHOST_FTP_HOST`
- `KINGHOST_FTP_USER`
- `KINGHOST_FTP_PASSWORD`

Verifique em: https://github.com/lourealiza/ViladAjuda/settings/secrets/actions

Se algum estiver faltando, o workflow pode não rodar.

### **6. Forçar Novo Push**

Às vezes um novo push força o GitHub a reconhecer o workflow:

```bash
# Fazer uma mudança pequena
echo "# Test" >> README.md
git add README.md
git commit -m "chore: forcar reconhecimento do workflow"
git push origin main
```

---

## 🔍 Verificar Logs

Se o workflow aparecer mas não rodar:

1. Acesse: https://github.com/lourealiza/ViladAjuda/actions
2. Clique no workflow "Deploy to KingHost"
3. Veja se há execuções recentes
4. Clique em uma execução para ver os logs

---

## 🆘 Se Nada Funcionar

### **Opção 1: Recriar o Workflow**

1. Delete o arquivo `.github/workflows/deploy-kinghost.yml`
2. Crie novamente
3. Commit e push

### **Opção 2: Usar Deploy Manual via SSH**

Se o workflow continuar dando problema, use deploy manual:

```bash
ssh viladajuda01@www.viladajuda.com.br "cd ~ && mkdir -p temp-vila && cd temp-vila && git clone https://github.com/lourealiza/ViladAjuda.git . && cp -f index.html ~/www/index.html && cp -f obrigado.html ~/www/obrigado.html && cp -f admin.html ~/www/admin.html && cp -rf css ~/www/ && cp -rf js ~/www/ && cp -rf images ~/www/ && cp -rf api ~/www/ && cd ~ && rm -rf temp-vila && echo '✅ Deploy concluído!'"
```

---

## ✅ Checklist

- [ ] Workflow está habilitado no GitHub
- [ ] Arquivo `.github/workflows/deploy-kinghost.yml` existe
- [ ] Secrets estão configurados
- [ ] Permissões do GitHub Actions estão corretas
- [ ] Fez push recente para main/master
- [ ] Tentou disparar manualmente (Run workflow)

---

**🎯 Próximo passo**: Acesse o GitHub Actions e verifique se o workflow está habilitado!

