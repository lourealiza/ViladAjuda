# 📮 Coleção Postman/Insomnia - Vila d'Ajuda API

Exemplos de requisições para testar todas as rotas da API.

## Configuração

### Variáveis de Ambiente
```
base_url: http://localhost:3000/api
token: (será preenchido após login)
```

---

## 🔐 Autenticação

### 1. Login
```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@viladajuda.com",
  "senha": "admin123"
}
```

**Resposta esperada:**
```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@viladajuda.com",
    "role": "admin"
  }
}
```

**⚠️ Copie o token e salve na variável de ambiente `token`**

---

### 2. Registrar Novo Usuário
```
POST {{base_url}}/auth/registrar
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "senha": "senha123",
  "role": "admin"
}
```

---

### 3. Ver Perfil (Autenticado)
```
GET {{base_url}}/auth/perfil
Authorization: Bearer {{token}}
```

---

## 🏠 Chalés

### 4. Listar Todos os Chalés
```
GET {{base_url}}/chales
```

**Com filtro de ativos:**
```
GET {{base_url}}/chales?ativo=true
```

---

### 5. Buscar Chalé por ID
```
GET {{base_url}}/chales/1
```

---

### 6. Verificar Disponibilidade
```
GET {{base_url}}/chales/1/disponibilidade?data_checkin=2024-12-20&data_checkout=2024-12-25
```

---

### 7. Criar Chalé (Autenticado)
```
POST {{base_url}}/chales
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nome": "Chalé Premium",
  "descricao": "Chalé de luxo com vista panorâmica",
  "capacidade_adultos": 4,
  "capacidade_criancas": 2,
  "preco_diaria": 450.00,
  "ativo": true,
  "amenidades": [
    "Wi-Fi de alta velocidade",
    "Ar-condicionado",
    "TV Smart",
    "Cozinha completa",
    "Varanda com rede",
    "Churrasqueira"
  ],
  "imagens": [
    "chale-premium-1.jpg",
    "chale-premium-2.jpg"
  ]
}
```

---

### 8. Atualizar Chalé (Autenticado)
```
PUT {{base_url}}/chales/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "preco_diaria": 280.00,
  "descricao": "Chalé recém reformado com novos móveis"
}
```

---

### 9. Deletar Chalé (Autenticado)
```
DELETE {{base_url}}/chales/5
Authorization: Bearer {{token}}
```

---

## 📅 Reservas

### 10. Criar Reserva (Público)
```
POST {{base_url}}/reservas
Content-Type: application/json

{
  "chale_id": 1,
  "nome_hospede": "Maria Santos",
  "email_hospede": "maria@exemplo.com",
  "telefone_hospede": "(73) 99999-9999",
  "data_checkin": "2024-12-20",
  "data_checkout": "2024-12-25",
  "num_adultos": 2,
  "num_criancas": 1,
  "mensagem": "Gostaríamos de um chalé tranquilo e silencioso"
}
```

---

### 11. Criar Reserva SEM Chalé Específico
```
POST {{base_url}}/reservas
Content-Type: application/json

{
  "nome_hospede": "Pedro Oliveira",
  "email_hospede": "pedro@exemplo.com",
  "telefone_hospede": "(73) 98888-8888",
  "data_checkin": "2025-01-10",
  "data_checkout": "2025-01-15",
  "num_adultos": 2,
  "num_criancas": 0,
  "mensagem": "Qualquer chalé disponível está bom"
}
```

---

### 12. Buscar Chalés Disponíveis
```
GET {{base_url}}/reservas/disponiveis?data_checkin=2024-12-20&data_checkout=2024-12-25
```

---

### 13. Listar Todas as Reservas (Autenticado)
```
GET {{base_url}}/reservas
Authorization: Bearer {{token}}
```

**Com filtros:**
```
GET {{base_url}}/reservas?status=pendente&chale_id=1
GET {{base_url}}/reservas?data_inicio=2024-12-01&data_fim=2024-12-31
```

---

### 14. Buscar Reserva por ID (Autenticado)
```
GET {{base_url}}/reservas/1
Authorization: Bearer {{token}}
```

---

### 15. Buscar Reservas por Período (Autenticado)
```
GET {{base_url}}/reservas/periodo?data_inicio=2024-12-01&data_fim=2024-12-31
Authorization: Bearer {{token}}
```

---

### 16. Atualizar Reserva (Autenticado)
```
PUT {{base_url}}/reservas/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "chale_id": 2,
  "data_checkin": "2024-12-21",
  "data_checkout": "2024-12-26"
}
```

---

### 17. Atualizar Status da Reserva (Autenticado)
```
PATCH {{base_url}}/reservas/1/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "confirmada"
}
```

**Status válidos:** `pendente`, `confirmada`, `cancelada`, `concluida`

---

### 18. Deletar Reserva (Autenticado)
```
DELETE {{base_url}}/reservas/1
Authorization: Bearer {{token}}
```

---

## 🏥 Health Check

### 19. Status da API
```
GET {{base_url}}/
```

---

### 20. Health Check
```
GET {{base_url}}/health
```

---

## 🧪 Cenários de Teste

### Cenário 1: Fluxo Completo de Reserva

1. Cliente busca chalés disponíveis (req 12)
2. Cliente cria reserva (req 10)
3. Admin faz login (req 1)
4. Admin lista reservas pendentes (req 13 com filtro)
5. Admin confirma a reserva (req 17)

---

### Cenário 2: Gerenciar Chalés

1. Admin faz login (req 1)
2. Admin lista chalés (req 4)
3. Admin cria novo chalé (req 7)
4. Admin atualiza informações (req 8)
5. Admin verifica disponibilidade (req 6)

---

### Cenário 3: Validação de Disponibilidade

1. Cliente verifica disponibilidade de um chalé (req 6)
2. Cliente tenta criar reserva para período ocupado (req 10)
   - **Esperado:** Erro 400 - Chalé indisponível
3. Cliente busca chalés disponíveis (req 12)
4. Cliente cria reserva em chalé disponível (req 10)
   - **Esperado:** Sucesso 201

---

## ❌ Testes de Erro

### Erro 400 - Validação
```
POST {{base_url}}/reservas
Content-Type: application/json

{
  "nome_hospede": "Jo",
  "email_hospede": "email-invalido",
  "telefone_hospede": "",
  "data_checkin": "2020-01-01",
  "data_checkout": "2020-01-02"
}
```

---

### Erro 401 - Não Autenticado
```
GET {{base_url}}/reservas
```

---

### Erro 404 - Não Encontrado
```
GET {{base_url}}/chales/999
```

---

### Erro 400 - Capacidade Excedida
```
POST {{base_url}}/reservas
Content-Type: application/json

{
  "chale_id": 1,
  "nome_hospede": "Teste",
  "email_hospede": "teste@exemplo.com",
  "telefone_hospede": "(73) 99999-9999",
  "data_checkin": "2025-01-10",
  "data_checkout": "2025-01-15",
  "num_adultos": 10,
  "num_criancas": 0
}
```

---

## 📊 Respostas Esperadas

### Sucesso (200/201)
```json
{
  "mensagem": "Operação realizada com sucesso",
  "data": { }
}
```

### Erro (400/401/404/500)
```json
{
  "erro": "Tipo do erro",
  "mensagem": "Descrição detalhada"
}
```

### Erro de Validação (400)
```json
{
  "erro": "Dados inválidos",
  "detalhes": [
    {
      "campo": "email_hospede",
      "mensagem": "Email inválido"
    }
  ]
}
```

---

## 🔄 Importar no Postman

1. Abra o Postman
2. Clique em "Import"
3. Cole este conteúdo como texto
4. Configure as variáveis de ambiente
5. Comece testando!

## 🔄 Importar no Insomnia

1. Abra o Insomnia
2. Application > Preferences > Data > Import Data
3. Cole este conteúdo
4. Configure as variáveis de ambiente
5. Comece testando!

