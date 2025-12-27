# 🚀 Configuração de Deploy Automático - GitHub Actions

Este documento explica como configurar o deploy automático para KingHost via GitHub Actions.

## 📋 Pré-requisitos

1. Repositório no GitHub
2. Acesso ao painel da KingHost
3. Credenciais FTP/SFTP da KingHost

## 🔐 Configurar Secrets no GitHub

Para que o deploy funcione, você precisa configurar os **Secrets** no repositório GitHub:

### Passo a Passo:

1. **Acesse o repositório no GitHub**
   - Vá para: `https://github.com/seu-usuario/ViladAjuda`
   - Clique em **Settings** (Configurações)

2. **Acesse Secrets and variables → Actions**
   - No menu lateral, clique em **Secrets and variables**
   - Clique em **Actions**

3. **Adicione os seguintes Secrets:**

   #### `KINGHOST_FTP_HOST`
   - **Valor**: `viladajuda.web213.uni5.net` ou `ftp.viladajuda.web213.uni5.net`
   - **Descrição**: Host FTP da KingHost

   #### `KINGHOST_FTP_USER`
   - **Valor**: Seu usuário FTP (geralmente seu email ou usuário fornecido pela KingHost)
   - **Descrição**: Usuário para acesso FTP

   #### `KINGHOST_FTP_PASSWORD`
   - **Valor**: Sua senha FTP
   - **Descrição**: Senha para acesso FTP

### Como obter as credenciais FTP?

1. Acesse o **Painel KingHost**: https://painel.kinghost.com.br
2. Faça login
3. Vá em **FTP** ou **Gerenciador de Arquivos**
4. As credenciais estarão disponíveis lá

## 🔄 Como Funciona

### Deploy Automático

O workflow será executado automaticamente quando:

- ✅ Você fizer **push** na branch `main` ou `master`
- ✅ Você executar manualmente via **Actions** → **Deploy to KingHost** → **Run workflow**

### O que é enviado?

**Frontend:**
- `index.html`
- `css/` (todos os arquivos CSS)
- `js/` (todos os arquivos JavaScript)
- `images/` (todas as imagens)

**Backend (API PHP):**
- `api/` (todos os arquivos PHP, exceto arquivos de teste)

### O que NÃO é enviado?

- Arquivos de configuração local (`.env`, `.gitignore`)
- Pastas de desenvolvimento (`backend/`, `backend-deploy/`)
- Arquivos de teste (`teste*.php`, `phpinfo.php`)
- Documentação e instruções
- Scripts PowerShell e Shell
- Arquivos temporários

## 📁 Estrutura no Servidor

Após o deploy, a estrutura no servidor será:

```
/www/
├── index.html
├── css/
│   ├── style.css
│   └── admin.css
├── js/
│   ├── script.js
│   ├── api.js
│   └── admin.js
├── images/
│   └── (todas as imagens)
└── api/
    ├── index.php
    ├── controllers/
    ├── config/
    └── templates/
```

## ✅ Verificar Deploy

Após o deploy:

1. **Acesse o site**: http://viladajuda.web213.uni5.net/
2. **Verifique a API**: http://viladajuda.web213.uni5.net/api/
3. **Limpe o cache**: Ctrl + F5 no navegador
4. **Verifique os logs**: Vá em **Actions** no GitHub para ver o status

## 🐛 Troubleshooting

### Deploy falhou

1. **Verifique os Secrets**
   - Confirme que todos os 3 secrets estão configurados
   - Verifique se as credenciais estão corretas

2. **Verifique os logs**
   - Vá em **Actions** → Clique no workflow que falhou
   - Veja os logs de erro

3. **Teste as credenciais FTP**
   - Tente conectar via FileZilla com as mesmas credenciais
   - Confirme que o host está correto

### Arquivos não aparecem no servidor

1. **Verifique o diretório de destino**
   - Confirme que é `/www/` (pode variar)
   - Verifique no painel da KingHost

2. **Verifique permissões**
   - Arquivos devem ter permissão 644
   - Pastas devem ter permissão 755

### API não funciona

1. **Verifique se os arquivos PHP foram enviados**
   - Confirme que a pasta `api/` existe no servidor
   - Verifique se `api/index.php` está presente

2. **Verifique configurações do PHP**
   - Confirme que o PHP está habilitado
   - Verifique se `mod_rewrite` está ativo (para rotas)

## 🔄 Workflow Manual

Se quiser fazer deploy manualmente:

1. Vá em **Actions** no GitHub
2. Clique em **Deploy to KingHost**
3. Clique em **Run workflow**
4. Selecione a branch (`main` ou `master`)
5. Clique em **Run workflow**

## 📊 Vantagens deste Setup

- ✅ **Deploy automático** - Push e pronto!
- ✅ **Logs detalhados** - Veja o que foi enviado
- ✅ **Seguro** - Credenciais em Secrets (não expostas)
- ✅ **Rápido** - Deploy em ~1-2 minutos
- ✅ **Confiável** - GitHub Actions é estável
- ✅ **Rollback fácil** - Volte para commits anteriores

## 🔐 Segurança

⚠️ **IMPORTANTE**: Nunca commite credenciais no código!

- ✅ Use **Secrets** do GitHub (seguro)
- ❌ NÃO coloque senhas em arquivos de código
- ❌ NÃO commite arquivos `.env` com credenciais

## 📞 Suporte

**GitHub Actions:**
- 📚 Documentação: https://docs.github.com/en/actions
- 💬 Issues: https://github.com/actions

**KingHost:**
- 📞 0800 200 8300
- 💬 https://king.host/suporte

---

**Última atualização**: Janeiro 2025
**Status**: ✅ Configurado e pronto para uso

