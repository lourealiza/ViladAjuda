# 🔄 Atualizar Chalés no Banco de Dados

## 📋 O que será atualizado

1. **Chalé 1** → **Alvorada Tropical**
2. **Chalé 2** → **Vila do Canto**
3. **Chalé 3** → **Desativado** (ativo = 0)
4. **Chalé 4** → **Desativado** (ativo = 0)

## 🚀 Opção 1: Via Script Node.js (Recomendado)

Execute no servidor:

```bash
ssh viladajuda@www.viladajuda.com.br
cd ~/viladajuda/backend
node src/scripts/atualizarNomesChales.js
```

## 🚀 Opção 2: Via SQL Direto

Execute no MySQL:

```sql
-- Atualizar Chalé 1
UPDATE chales SET nome = 'Alvorada Tropical' WHERE nome = 'Chalé 1' OR id = 1;

-- Atualizar Chalé 2
UPDATE chales SET nome = 'Vila do Canto' WHERE nome = 'Chalé 2' OR id = 2;

-- Desativar Chalé 3
UPDATE chales SET ativo = 0 WHERE nome = 'Chalé 3' OR id = 3;

-- Desativar Chalé 4
UPDATE chales SET ativo = 0 WHERE nome = 'Chalé 4' OR id = 4;
```

## 🚀 Opção 3: Via Painel Admin

1. Acesse: https://www.viladajuda.com.br/admin.html
2. Vá em "Chalés"
3. Edite cada chalé:
   - Chalé 1 → Altere nome para "Alvorada Tropical"
   - Chalé 2 → Altere nome para "Vila do Canto"
   - Chalé 3 → Desative (marque como inativo)
   - Chalé 4 → Desative (marque como inativo)

## ✅ Verificar após atualização

Execute:

```sql
SELECT id, nome, ativo FROM chales ORDER BY id;
```

Resultado esperado:
- id=1, nome='Alvorada Tropical', ativo=1
- id=2, nome='Vila do Canto', ativo=1
- id=3, nome='Chalé 3', ativo=0
- id=4, nome='Chalé 4', ativo=0

