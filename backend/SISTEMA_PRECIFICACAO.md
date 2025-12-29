# 📈 Sistema de Precificação Dinâmica – Vila d'Ajuda

Sistema completo de cálculo de diárias baseado nas temporadas oficiais de Arraial d'Ajuda e na tabela enviada pelo cliente.

## 📊 Tabela de Preços

| Temporada | Período | 2 pessoas (R$) | Até 4 pessoas (R$) |
|-----------|---------|----------------|--------------------|
| Altíssima (Réveillon) | 26/12 a 05/01 | 600 – 720 | 750 – 900 |
| Altíssima (Férias de Janeiro) | 06/01 a 31/01 | 560 – 640 | 700 – 800 |
| Altíssima (Carnaval) | 01/02 até Quarta de Cinzas | 600 – 680 | 750 – 850 |
| Alta (Pós-Carnaval) | Dia seguinte à Quarta de Cinzas até 31/03 | 440 – 520 | 550 – 650 |
| Média/Baixa | 01/04 a 15/06 | 320 – 400 | 400 – 500 |
| Alta (Férias de Julho) | 16/06 a 31/07 | 440 – 520 | 550 – 650 |
| Baixa | 01/08 a 31/10 | 300 – 380 | 380 – 480 |
| Alta (Pré-Verão) | 01/11 a 15/12 | 400 – 480 | 500 – 600 |
| Alta Dezembro | 16/12 a 25/12 | 480 – 560 | 600 – 700 |

> **Nota:** Os valores para casal (até 2 hóspedes) são calculados a partir de 80% da faixa até 4 pessoas e arredondados para múltiplos de R$ 10 para manter coerência comercial.

## 🏡 Características dos Chalés

- Chalés sem piscina, com cozinha equipada e varanda
- 7 minutos a pé do centro de Arraial d'Ajuda
- Ambiente silencioso com área verde

## 🎯 Descontos para Estadias Longas

| Noites | Desconto |
|--------|----------|
| 5-6 noites | 5% |
| 7-14 noites | 7% |
| 15+ noites | 10% |

## ⚙️ Funcionalidades Implementadas

### 1. Cálculo Automático de Preços
- Considera capacidade do chalé, datas e temporadas
- Aplica descontos progressivos e campanhas (ex.: Black Friday)
- Atualiza o valor total da reserva automaticamente na API

### 2. Temporadas Dinâmicas por Data
As datas são avaliadas diariamente com base nas regras acima:

- **26/12 – 05/01:** Altíssima (Réveillon)
- **06/01 – 31/01:** Altíssima (férias de janeiro)
- **01/02 – Quarta de Cinzas:** Altíssima (Carnaval) com cálculo automático da data do feriado
- **Pós-Carnaval – 31/03:** Alta
- **01/04 – 15/06:** Média/Baixa
- **16/06 – 31/07:** Alta (férias escolares)
- **01/08 – 31/10:** Baixa
- **01/11 – 15/12:** Alta (pré-verão)
- **16/12 – 25/12:** Alta Dezembro

### 3. API de Consulta

```
GET http://localhost:3000/api/precos/calcular?capacidade=4&checkin=2025-02-10&checkout=2025-02-15
GET http://localhost:3000/api/precos/temporada?data=2025-07-05
GET http://localhost:3000/api/precos/tabela
```

- `/api/precos/calcular` devolve valores por dia, descontos aplicados e total final
- `/api/precos/temporada` informa o nome da temporada, descrição e faixas de preço
- `/api/precos/tabela` retorna todas as temporadas com as faixas para 2 e até 4 pessoas

## 📌 Exemplos Práticos

### Casal em Janeiro (5 noites)
- Período: 10/01 a 15/01
- Temporada: Altíssima (Férias de Janeiro)
- Diária média casal: **R$ 600**
- Total: 5 × 600 = **R$ 3.000**

### Família em Julho (10 noites)
- Período: 05/07 a 15/07
- Temporada: Alta (Férias de Julho)
- Diária média até 4 pessoas: **R$ 600**
- Subtotal: R$ 6.000 → Desconto 7% = R$ 420
- **Total final: R$ 5.580**

### Casal em Abril (15 noites)
- Período: 01/04 a 16/04
- Temporada: Média/Baixa
- Diária média casal: **R$ 360**
- Subtotal: R$ 5.400 → Desconto 10% = R$ 540
- **Total final: R$ 4.860**

### Mensalista em Março (30 noites)
- Período: 01/03 a 31/03
- Temporada: Alta (Pós-Carnaval)
- Diária média casal: **R$ 480**
- Subtotal: R$ 14.400 → Desconto 15% = R$ 2.160
- **Total final: R$ 12.240**

## 🚀 Como Usar

### Atualizar preços base dos chalés
```
cd backend
npm run atualizar-precos
```

### Aplicar temporadas no banco (MySQL)
```
node src/scripts/cadastrarTemporadas.js
```

### Calcular reservas automaticamente
- Ao criar/atualizar uma reserva via API, o sistema calcula o valor usando as regras acima
- O detalhamento diário fica disponível em `reserva.valor_total` e nos logs da API

## ✅ Benefícios

- Preços alinhados ao mercado e aos períodos de maior demanda
- Automatização completa (menos erros manuais)
- Transparência para o cliente (detalhamento por dia)
- Ferramentas prontas para reajustes (scripts e endpoints)

## 🔍 Monitoramento Recomendado

- Taxa de ocupação por temporada
- Ticket médio das reservas
- Tempo médio de estadia
- Concorrentes diretos em Arraial d'Ajuda

**Ajuste os valores conforme a demanda e mantenha a tabela sempre atualizada!**

