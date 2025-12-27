# ✅ Checklist de Configuração dos Secrets

## 🔍 Verificar se os Secrets estão configurados

O erro `Input required and not supplied: server` indica que um dos secrets não está configurado.

### Como verificar:

1. **Acesse o repositório no GitHub**
   - Vá para: `https://github.com/seu-usuario/ViladAjuda/settings/secrets/actions`

2. **Verifique se TODOS estes secrets existem:**

   - ✅ `KINGHOST_FTP_HOST`
   - ✅ `KINGHOST_FTP_USER`
   - ✅ `KINGHOST_FTP_PASSWORD`

### ⚠️ Problemas Comuns:

#### 1. Nome do Secret está errado
- ❌ `KINGHOST_FTP_HOST` (com espaço)
- ❌ `kinghost_ftp_host` (minúsculas)
- ✅ `KINGHOST_FTP_HOST` (correto - tudo maiúsculo, underscore)

#### 2. Secret não foi salvo
- Certifique-se de clicar em **"Add secret"** após preencher
- Verifique se aparece na lista de secrets

#### 3. Secrets em branch diferente
- Secrets são configurados no nível do repositório
- Funcionam para todas as branches

### 📝 Valores Esperados:

#### `KINGHOST_FTP_HOST`
```
viladajuda.web213.uni5.net
```
ou
```
ftp.viladajuda.web213.uni5.net
```

#### `KINGHOST_FTP_USER`
```
seu-usuario-ftp
```
ou
```
seu-email@exemplo.com
```

#### `KINGHOST_FTP_PASSWORD`
```
sua-senha-ftp
```

### 🔧 Como Corrigir:

1. **Acesse**: Settings → Secrets and variables → Actions
2. **Verifique** se os 3 secrets existem
3. **Se faltar algum**, clique em **"New repository secret"**
4. **Adicione** o secret faltante
5. **Execute o workflow novamente**

### 🧪 Testar Configuração:

Após adicionar os secrets, você pode testar executando o workflow manualmente:

1. Vá em **Actions**
2. Clique em **"Deploy to KingHost"**
3. Clique em **"Run workflow"**
4. Selecione a branch `main`
5. Clique em **"Run workflow"**

Se ainda der erro, verifique os logs para ver qual secret específico está faltando.

