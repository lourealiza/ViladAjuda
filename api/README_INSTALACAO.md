# Instalação da API PHP - Vila d'Ajuda

## ✅ Backend PHP criado com sucesso!

Este backend PHP substitui o backend Node.js para funcionar em hospedagem compartilhada (KingHost).

---

## 📁 Estrutura de Arquivos

```
api/
├── index.php                           # Arquivo principal (roteamento)
├── .htaccess                           # Configuração Apache (rewrite rules)
├── config/
│   └── database.php                    # Configuração MySQL
└── controllers/
    ├── ChaleController.php            # Rotas de chalés
    ├── DisponibilidadeController.php  # Rotas de disponibilidade
    └── ReservaController.php          # Rotas de reservas
```

---

## 🚀 Instalação Manual (via FileZilla ou Painel KingHost)

### Passo 1: Fazer Upload dos Arquivos

1. **Conecte-se via FTP** (FileZilla):
   - Host: `ftp.viladajuda.com.br`
   - Usuário: `viladajuda`
   - Senha: `arraial2026`
   - Porta: `21`

2. **Criar diretório `/www/api/`** (se não existir)

3. **Fazer upload de todos os arquivos** da pasta `api/` para `/www/api/`:
   ```
   /www/api/index.php
   /www/api/.htaccess
   /www/api/config/database.php
   /www/api/controllers/ChaleController.php
   /www/api/controllers/DisponibilidadeController.php
   /www/api/controllers/ReservaController.php
   ```

### Passo 2: Configurar Banco de Dados MySQL

1. **Acesse o painel da KingHost** e localize as credenciais do MySQL

2. **Edite o arquivo `/www/api/config/database.php`** e atualize as credenciais:
   ```php
   define('DB_HOST', 'localhost');        // Ou IP fornecido pela KingHost
   define('DB_USER', 'USUARIO_MYSQL');    // Usuário do MySQL
   define('DB_PASS', 'SENHA_MYSQL');      // Senha do MySQL
   define('DB_NAME', 'viladajuda');       // Nome do banco de dados
   ```

3. **Verifique se o banco de dados existe**:
   - Se não existir, crie um banco chamado `viladajuda` pelo painel

4. **Importe as tabelas** (se ainda não existirem):
   - Use o arquivo `backend/src/config/database-mysql.js` como referência
   - Ou use o PhpMyAdmin do painel para executar os SQLs de criação de tabelas

---

## 🧪 Testar a API

### 1. Health Check (verificar se API está online)

Acesse no navegador:
```
https://www.viladajuda.com.br/api/
```

**Resposta esperada:**
```json
{
    "mensagem": "API Vila d'Ajuda funcionando!",
    "versao": "2.0.0-PHP",
    "status": "online",
    "modulos": [
        "Motor de Reservas",
        "Verificação de Disponibilidade",
        "Gestão de Chalés"
    ]
}
```

### 2. Testar Rota de Chalés

```
https://www.viladajuda.com.br/api/chales
```

### 3. Testar Disponibilidade

```
https://www.viladajuda.com.br/api/disponibilidade/verificar-rapida?data_checkin=2025-12-01&data_checkout=2025-12-05
```

---

## 🔧 Solução de Problemas

### Problema: API retorna 404 ou não funciona

**Solução 1: Verificar .htaccess**
- Certifique-se de que o arquivo `.htaccess` está na pasta `/www/api/`
- Verifique se o Apache tem `mod_rewrite` habilitado (geralmente está na KingHost)

**Solução 2: Testar sem rewrite**
- Acesse diretamente: `https://www.viladajuda.com.br/api/index.php`
- Se funcionar, o problema é o `.htaccess`

### Problema: Erro de conexão com banco de dados

**Solução:**
1. Verifique as credenciais em `/www/api/config/database.php`
2. Certifique-se de que o banco `viladajuda` existe
3. Verifique se o usuário MySQL tem permissões para o banco

### Problema: CORS (erros no console do navegador)

**Solução:**
- O arquivo `index.php` já inclui headers CORS
- Verifique se o arquivo foi enviado corretamente

---

## 📝 Rotas Disponíveis

### Chalés
- `GET /api/chales` - Lista todos os chalés
- `GET /api/chales/:id` - Busca chalé específico
- `GET /api/chales/:id/disponibilidade?data_checkin=YYYY-MM-DD&data_checkout=YYYY-MM-DD` - Verifica disponibilidade

### Disponibilidade
- `GET /api/disponibilidade/verificar-rapida?data_checkin=YYYY-MM-DD&data_checkout=YYYY-MM-DD` - Verifica disponibilidade rápida
- `GET /api/disponibilidade/calendario?ano=2025&mes=12&chale_id=1` - Retorna calendário mensal

### Reservas
- `GET /api/reservas/disponiveis?data_checkin=YYYY-MM-DD&data_checkout=YYYY-MM-DD` - Lista chalés disponíveis
- `POST /api/reservas` - Cria nova reserva

---

## 🎉 Pronto!

Após seguir esses passos, o frontend em `https://www.viladajuda.com.br` deve se conectar automaticamente à API PHP e a **verificação de disponibilidade deve funcionar**!

Se tiver problemas, verifique:
1. Os arquivos foram enviados para `/www/api/`
2. As credenciais do MySQL estão corretas
3. O banco de dados `viladajuda` existe e tem as tabelas necessárias
4. O arquivo `.htaccess` está presente

---

## 📞 Suporte

Se ainda tiver problemas, verifique os logs de erro do PHP no painel da KingHost.

