# 🔍 Verificar se o Formulário está Chegando no Backend

## 📋 Fluxo do Formulário

1. **Frontend** (`js/script.js` linha 913):
   - Chama `API.criarReserva(dados)`
   - Endpoint: `/consulta` (POST)

2. **API** (`js/api.js` linha 171-176):
   - Faz POST para `/consulta` com JSON

3. **Backend PHP** (`api/index.php` linha 152-156):
   - Rota: `/consulta` ou `/consultas` (POST)
   - Controller: `ConsultaController::criar()`

4. **Controller** (`api/controllers/ConsultaController.php`):
   - Recebe dados JSON
   - Valida campos obrigatórios
   - Verifica disponibilidade
   - Envia email de notificação
   - Retorna resposta JSON

## 🔍 Como Verificar

### 1. Verificar Logs do Servidor

Os logs foram adicionados nos seguintes pontos:

**No servidor (via SSH):**
```bash
# Ver logs do Apache/PHP
tail -f /var/log/apache2/error.log

# Ou logs do PHP (se configurado)
tail -f /var/log/php_errors.log

# Ou logs customizados (se houver)
tail -f ~/logs/api.log
```

**O que procurar nos logs:**
```
📥 ConsultaController::criar() - Requisição recebida
📥 Método: POST
📥 Content-Type: application/json
📥 JSON recebido (primeiros 500 chars): {...}
✅ Dados decodificados com sucesso: {...}
✅ Rota /consulta capturada
📧 Tentando enviar email de notificação...
✅ Email enviado com sucesso
📤 responderJSON() - Status: 201
```

### 2. Testar Manualmente via cURL

```bash
curl -X POST https://www.viladajuda.com.br/api/consulta \
  -H "Content-Type: application/json" \
  -d '{
    "nome_hospede": "Teste",
    "email_hospede": "teste@example.com",
    "telefone_hospede": "11999999999",
    "data_checkin": "2025-12-29",
    "data_checkout": "2026-01-05",
    "num_adultos": 2,
    "num_criancas": 0,
    "chale_id": null
  }'
```

**Resposta esperada:**
```json
{
  "mensagem": "Solicitação de reserva recebida! Entraremos em contato em breve para confirmar.",
  "disponibilidade": {...},
  "preco": {...},
  "tipo": "solicitacao_reserva",
  "status": "pendente"
}
```

### 3. Verificar no Console do Navegador

Abra o DevTools (F12) e vá na aba **Network**:
1. Envie o formulário
2. Procure por requisição para `/api/consulta`
3. Verifique:
   - **Status**: Deve ser 201 (Created) ou 200 (OK)
   - **Request Payload**: Deve conter os dados do formulário
   - **Response**: Deve retornar JSON com mensagem de sucesso

### 4. Verificar Erros Comuns

**Erro 400 - Dados inválidos:**
- Verificar se o JSON está sendo enviado corretamente
- Verificar se `Content-Type: application/json` está no header

**Erro 404 - Rota não encontrada:**
- Verificar se a rota `/api/consulta` está configurada no `.htaccess`
- Verificar se o arquivo `api/index.php` existe

**Erro 500 - Erro no servidor:**
- Verificar logs do PHP para ver o erro específico
- Verificar conexão com banco de dados
- Verificar se todas as dependências estão instaladas

### 5. Verificar Email

O sistema envia email de notificação. Verifique:
- Se o email está configurado corretamente
- Se está chegando na caixa de entrada (ou spam)
- Se há erros no envio (verificar logs)

## 🛠️ Debug Adicional

### Adicionar mais logs

Se precisar de mais informações, adicione logs em:

**`api/controllers/ConsultaController.php`:**
```php
error_log('🔍 Campo específico: ' . ($dados['campo'] ?? 'não informado'));
```

**`api/index.php`:**
```php
error_log('🔍 Path completo: ' . $_SERVER['REQUEST_URI']);
error_log('🔍 Query string: ' . ($_SERVER['QUERY_STRING'] ?? 'vazio'));
```

### Testar endpoint diretamente

Acesse no navegador:
```
https://www.viladajuda.com.br/api/
```

Deve retornar:
```json
{
  "mensagem": "API Vila d'Ajuda funcionando!",
  "versao": "2.0.0-PHP",
  "status": "online"
}
```

## ✅ Checklist de Verificação

- [ ] Logs aparecem quando o formulário é enviado
- [ ] Status HTTP é 201 ou 200
- [ ] Resposta JSON contém mensagem de sucesso
- [ ] Email de notificação é enviado
- [ ] Dados aparecem corretamente nos logs
- [ ] Não há erros no console do navegador
- [ ] Não há erros nos logs do servidor

## 📝 Campos Obrigatórios

O formulário precisa ter:
- `data_checkin` (obrigatório)
- `data_checkout` (obrigatório)
- `nome_hospede` (se for reserva completa)
- `email_hospede` (se for reserva completa)
- `telefone_hospede` (se for reserva completa)

## 🔗 Endpoints Relacionados

- `POST /api/consulta` - Envia formulário de reserva/consulta
- `GET /api/reservas/disponiveis` - Verifica disponibilidade
- `GET /api/reservas/calcular-preco` - Calcula preço da reserva

