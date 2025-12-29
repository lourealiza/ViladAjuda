# 📅 Cadastrar Temporadas no Banco de Dados

Este documento explica como cadastrar as temporadas de preços no banco de dados.

## 📋 Temporadas a serem cadastradas

| Período | Tipo | Preço Sugerido | Multiplicador |
|---------|------|----------------|---------------|
| Amanhã até 31/01 | Altíssima (Réveillon + férias janeiro) | R$ 700 – R$ 800 | ~2.14x |
| 01/02 – Carnaval (até Quarta de Cinzas) | Altíssima (Carnaval) | R$ 750 – R$ 850 | ~2.29x |
| Pós-Carnaval até 30/03 | Alta | R$ 550 – R$ 650 | ~1.71x |
| Abril – 15/06 | Média/Baixa | R$ 400 – R$ 500 | ~1.29x |
| 16/06 – 31/07 | Alta (férias julho) | R$ 550 – R$ 650 | ~1.71x |
| 01/08 – 31/10 | Baixa | R$ 380 – R$ 480 | ~1.23x |
| 01/11 – 15/12 | Alta (pré-verão) | R$ 500 – R$ 600 | ~1.57x |
| 16/12 – 25/12 | Alta | R$ 600 – R$ 700 | ~1.86x |
| 26/12 – 05/01 (próximo Réveillon) | Altíssima | R$ 750 – R$ 900 | ~2.36x |

**Nota:** Os multiplicadores são calculados com base no preço base dos chalés (R$ 350,00).

## 🚀 Como executar

### Opção 1: Via Script Node.js (Recomendado)

```bash
cd backend
node src/scripts/cadastrarTemporadas.js
```

### No servidor remoto (via SSH):
```bash
ssh viladajuda@www.viladajuda.com.br
cd ~/viladajuda/backend
node src/scripts/cadastrarTemporadas.js
```

## 🔧 Como funciona

O script:

1. **Calcula datas dinâmicas:**
   - **Amanhã:** Data atual + 1 dia (para Réveillon + Janeiro)
   - **Quarta de Cinzas:** Calculada usando o algoritmo de Gauss (46 dias antes da Páscoa)
   - **Pós-Carnaval:** Dia seguinte à Quarta de Cinzas
   - **Réveillon:** 26/12 até 05/01 do próximo ano

2. **Calcula multiplicadores:**
   - Baseado no preço médio sugerido dividido pelo preço base (R$ 350)
   - Exemplo: R$ 750 (médio) ÷ R$ 350 (base) = 2.14x

3. **Define diárias mínimas:**
   - Temporadas altíssimas: 3 dias
   - Outras temporadas: 2 dias

4. **Verifica sobreposições:**
   - O script verifica se há conflitos entre temporadas
   - Atualiza temporadas existentes com mesmo nome e período
   - Ignora temporadas com sobreposição de datas

## 📊 Estrutura da Tabela

A tabela `temporadas` possui os seguintes campos:

- `id`: ID único
- `nome`: Nome da temporada
- `tipo`: ENUM('baixa', 'media', 'alta', 'feriado')
- `data_inicio`: Data de início (YYYY-MM-DD)
- `data_fim`: Data de fim (YYYY-MM-DD)
- `multiplicador`: Multiplicador sobre o preço base
- `diaria_minima`: Número mínimo de diárias
- `dias_checkin_permitidos`: JSON com dias permitidos (opcional)
- `ativo`: Se a temporada está ativa

## ✅ Verificar após cadastro

Execute no MySQL:

```sql
SELECT id, nome, tipo, data_inicio, data_fim, multiplicador, diaria_minima 
FROM temporadas 
WHERE ativo = 1 
ORDER BY data_inicio;
```

## 🔄 Atualizar temporadas

O script pode ser executado múltiplas vezes. Ele:
- ✅ Atualiza temporadas existentes com mesmo nome e período
- ✅ Cadastra novas temporadas que não existem
- ⚠️ Ignora temporadas com sobreposição de datas (para evitar conflitos)

## 📝 Notas importantes

1. **Datas dinâmicas:** As datas de Carnaval e Quarta de Cinzas são calculadas automaticamente para cada ano
2. **Preço base:** O sistema usa R$ 350,00 como preço base dos chalés
3. **Tipo "Altíssima":** Como o ENUM só aceita 'baixa', 'media', 'alta', 'feriado', as temporadas "Altíssima" são cadastradas como 'alta' com multiplicadores maiores
4. **Sobreposição:** Se houver sobreposição de datas, o script avisará e não cadastrará a temporada conflitante

## 🎯 Exemplo de uso

Após executar o script, o sistema calculará automaticamente os preços baseados nas temporadas:

- **Exemplo 1:** Reserva de 15/01 a 20/01 (Réveillon + Janeiro)
  - Preço base: R$ 350
  - Multiplicador: 2.14x
  - Preço por dia: R$ 350 × 2.14 = R$ 749

- **Exemplo 2:** Reserva de 10/08 a 15/08 (Baixa Temporada)
  - Preço base: R$ 350
  - Multiplicador: 1.23x
  - Preço por dia: R$ 350 × 1.23 = R$ 430.50

