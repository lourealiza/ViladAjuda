# 🔧 Corrigir Erro FTP: "550 css: No such file or directory"

## ❌ Problema
O GitHub Actions está tentando criar a pasta `css/` no servidor FTP, mas não tem permissão ou o caminho está incorreto.

## ✅ Solução Aplicada

Alterado o `server-dir` de `/public_html/` para `./` (diretório raiz do usuário FTP).

### Por quê?
- No FTP, o usuário já está logado no diretório home (`~/` ou `public_html/`)
- Usar caminho relativo (`./`) evita problemas de permissão
- O servidor FTP da KingHost geralmente já coloca o usuário no diretório correto

## 📝 Alterações no Workflow

**Antes:**
```yaml
server-dir: public_html/
```

**Depois:**
```yaml
server-dir: ./
```

## 🚀 Próximos Passos

1. O workflow foi atualizado
2. Faça commit e push das alterações
3. O GitHub Actions tentará fazer deploy novamente
4. Se ainda der erro, tente usar caminho absoluto: `/home/viladajuda/public_html/`

## 🔍 Verificar se Funcionou

Após o deploy, verifique:
- ✅ Arquivos HTML estão em `public_html/`
- ✅ Pasta `css/` existe e tem os arquivos
- ✅ Pasta `js/` existe e tem os arquivos
- ✅ Pasta `images/` existe e tem os arquivos

## 🆘 Se Ainda Der Erro

1. Verifique as permissões da pasta no servidor via SSH:
   ```bash
   ssh viladajuda@www.viladajuda.com.br
   ls -la ~/public_html/
   chmod 755 ~/public_html/css
   ```

2. Ou use caminho absoluto no workflow:
   ```yaml
   server-dir: /home/viladajuda/public_html/
   ```

