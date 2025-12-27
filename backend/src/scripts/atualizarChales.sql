-- Script SQL para atualizar nomes dos chalés e desativar chalés 3 e 4
-- Execute no banco de dados MySQL

-- Atualizar Chalé 1 para "Alvorada Tropical"
UPDATE chales 
SET nome = 'Alvorada Tropical' 
WHERE nome = 'Chalé 1' OR id = 1;

-- Atualizar Chalé 2 para "Vila do Canto"
UPDATE chales 
SET nome = 'Vila do Canto' 
WHERE nome = 'Chalé 2' OR id = 2;

-- Desativar Chalé 3
UPDATE chales 
SET ativo = 0 
WHERE nome = 'Chalé 3' OR id = 3;

-- Desativar Chalé 4
UPDATE chales 
SET ativo = 0 
WHERE nome = 'Chalé 4' OR id = 4;

-- Verificar resultado
SELECT id, nome, ativo FROM chales ORDER BY id;

