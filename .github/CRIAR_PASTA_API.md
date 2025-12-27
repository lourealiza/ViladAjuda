# 📁 Criar Pasta API Manualmente

## ⚠️ Problema

O usuário FTP não tem permissão para criar diretórios automaticamente. É necessário criar a pasta `api/` manualmente antes do deploy.

## 🚀 Solução: Criar via FTP

### Opção 1: Via FileZilla (Recomendado)

1. **Conecte-se ao servidor FTP:**
   - Host: `ftp.viladajuda.com.br`
   - Usuário: `viladajuda`
   - Senha: `vila2026`
   - Porta: `21`

2. **Navegue até o diretório:**
   - Vá para: `/www/`

3. **Verifique se a pasta `api/` já existe:**
   - A pasta `api/` já deve existir em `/www/`
   - Se não existir, clique com botão direito no diretório `/www/`
   - Selecione "Criar diretório"
   - Digite: `api`
   - Pressione Enter

4. **Crie as subpastas necessárias:**
   - Dentro de `api/`, crie:
     - `config/`
     - `controllers/`
     - `templates/`

### Opção 2: Via WebFTP

1. **Acesse:** http://webftp.realizahost.com.br/
2. **Faça login** com as credenciais FTP
3. **Navegue** até `/www/`
4. **Crie** a pasta `api/` e as subpastas

### Opção 3: Via Painel KingHost

1. **Acesse:** https://painel.kinghost.com.br
2. **Vá em:** Gerenciador de Arquivos
3. **Navegue** até `/www/`
4. **Crie** a pasta `api/` e as subpastas

## ✅ Após Criar as Pastas

Depois de criar as pastas manualmente:

1. Execute o workflow novamente no GitHub Actions
2. O deploy deve funcionar agora, pois as pastas já existem
3. O FTP-Deploy-Action apenas fará upload dos arquivos

## 📝 Estrutura de Pastas Necessária

```
/www/
├── api/
│   ├── config/
│   ├── controllers/
│   └── templates/
├── css/
├── images/
├── js/
└── index.html
```

## 🔍 Verificar Permissões

Se ainda der erro de permissão após criar as pastas:

1. Verifique as permissões das pastas no servidor
2. As pastas devem ter permissão `755` (rwxr-xr-x)
3. Os arquivos devem ter permissão `644` (rw-r--r--)

Você pode ajustar as permissões via:
- Painel KingHost → Gerenciador de Arquivos → Propriedades
- Ou via SSH (se tiver acesso)

