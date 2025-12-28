# 🏠 Cadastrar Chalés no Banco de Dados

Este documento explica como cadastrar os dois chalés (Alvorada Tropical e Vila do Canto) no banco de dados.

## 📋 Chalés a serem cadastrados

1. **Alvorada Tropical**
   - Descrição: Chalé completo com varanda espaçosa, rede e vista para o jardim. Perfeito para casais.
   - Capacidade: 2 adultos, 2 crianças
   - Preço: R$ 350,00/noite
   - Imagem: `images/Chales 1(3).png`
   - Amenidades: Quarto com ar-condicionado, Sala de estar, Cozinha equipada, Varanda com rede, Wi-Fi gratuito

2. **Vila do Canto**
   - Descrição: Chalé completo com varanda espaçosa, rede e vista para o jardim. Perfeito para casais.
   - Capacidade: 2 adultos, 2 crianças
   - Preço: R$ 350,00/noite
   - Imagem: `images/33175620-1024x1024.jpg`
   - Amenidades: Quarto com ar-condicionado, Sala de estar, Cozinha equipada, Varanda com rede, Wi-Fi gratuito

## 🚀 Opção 1: Via Script Node.js (Recomendado)

### No servidor local:
```bash
cd backend
node src/scripts/cadastrarChales.js
```

### No servidor remoto (via SSH):
```bash
ssh viladajuda@www.viladajuda.com.br
cd ~/viladajuda/backend
node src/scripts/cadastrarChales.js
```

O script irá:
- ✅ Verificar se os chalés já existem
- ✅ Cadastrar apenas os que não existem
- ✅ Mostrar os chalés cadastrados ao final

## 🚀 Opção 2: Via SQL Direto

Execute o arquivo SQL no banco de dados MySQL:

```bash
mysql -u usuario -p nome_banco < api/cadastrar-chales.sql
```

Ou copie e cole o conteúdo do arquivo `api/cadastrar-chales.sql` no seu cliente MySQL.

## 🚀 Opção 3: Via PHP (Navegador)

Acesse no navegador:
```
https://www.viladajuda.com.br/api/cadastrar-chales.php
```

O script PHP irá:
- ✅ Verificar se os chalés já existem
- ✅ Cadastrar apenas os que não existem
- ✅ Mostrar uma página com o resultado

## 🚀 Opção 4: Via API (Autenticação necessária)

Se você tiver acesso à API com autenticação, pode usar o endpoint:

```bash
# Criar Alvorada Tropical
curl -X POST https://www.viladajuda.com.br/api/chales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Alvorada Tropical",
    "descricao": "Chalé completo com varanda espaçosa, rede e vista para o jardim. Perfeito para casais.",
    "capacidade_adultos": 2,
    "capacidade_criancas": 2,
    "preco_diaria": 350.00,
    "ativo": true,
    "amenidades": [
      "Quarto com ar-condicionado",
      "Sala de estar",
      "Cozinha equipada",
      "Varanda com rede",
      "Wi-Fi gratuito"
    ],
    "imagens": ["images/Chales 1(3).png"]
  }'

# Criar Vila do Canto
curl -X POST https://www.viladajuda.com.br/api/chales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Vila do Canto",
    "descricao": "Chalé completo com varanda espaçosa, rede e vista para o jardim. Perfeito para casais.",
    "capacidade_adultos": 2,
    "capacidade_criancas": 2,
    "preco_diaria": 350.00,
    "ativo": true,
    "amenidades": [
      "Quarto com ar-condicionado",
      "Sala de estar",
      "Cozinha equipada",
      "Varanda com rede",
      "Wi-Fi gratuito"
    ],
    "imagens": ["images/33175620-1024x1024.jpg"]
  }'
```

## ✅ Verificar após cadastro

Execute no MySQL:

```sql
SELECT id, nome, preco_diaria, ativo FROM chales 
WHERE nome IN ('Alvorada Tropical', 'Vila do Canto') 
ORDER BY id;
```

Resultado esperado:
- id=1, nome='Alvorada Tropical', preco_diaria=350.00, ativo=1
- id=2, nome='Vila do Canto', preco_diaria=350.00, ativo=1

## 📝 Notas

- O script verifica se os chalés já existem antes de cadastrar, então é seguro executá-lo múltiplas vezes
- Se os chalés já estiverem cadastrados, o script apenas mostrará as informações existentes
- Todos os métodos acima são seguros e não duplicarão os chalés se já existirem

