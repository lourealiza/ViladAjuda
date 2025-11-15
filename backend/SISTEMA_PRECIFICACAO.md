# 💰 Sistema de Precificação Dinâmica - Vila d'Ajuda

Sistema completo de cálculo de preços baseado no mercado de Arraial d'Ajuda.

## 📊 Tabela de Preços

### Chalés para 2 Pessoas

| Temporada | Período | Mínimo | Máximo | Médio |
|-----------|---------|--------|--------|-------|
| **Baixa** | Março-Junho, Agosto-Novembro | R$ 250 | R$ 350 | R$ 300 |
| **Alta** | Julho, Dezembro, Carnaval | R$ 350 | R$ 450 | R$ 400 |
| **Altíssima** | Janeiro, Réveillon | R$ 420 | R$ 530 | R$ 475 |

### Chalés para 3-4 Pessoas

| Temporada | Período | Mínimo | Máximo | Médio |
|-----------|---------|--------|--------|-------|
| **Baixa** | Março-Junho, Agosto-Novembro | R$ 300 | R$ 400 | R$ 350 |
| **Alta** | Julho, Dezembro, Carnaval | R$ 420 | R$ 550 | R$ 485 |
| **Altíssima** | Janeiro, Réveillon | R$ 500 | R$ 650 | R$ 575 |

## 🎯 Características dos Chalés

- ✅ Sem piscina
- ✅ Cozinha equipada
- ✅ 7 minutos a pé do centro de Arraial d'Ajuda

## 💵 Descontos para Estadias Longas

| Noites | Desconto |
|--------|----------|
| 7-14 noites | 5% |
| 15-29 noites | 10% |
| 30+ noites | 15% |

## 🚀 Funcionalidades Implementadas

### 1. Cálculo Automático de Preços

O sistema calcula **automaticamente** o valor de cada reserva baseado em:
- ✅ Capacidade do chalé (2 ou 4 pessoas)
- ✅ Período da estadia (datas)
- ✅ Temporada (baixa, alta, altíssima)
- ✅ Descontos para estadias longas

### 2. Preços Dinâmicos por Data

Cada dia tem seu próprio preço baseado na temporada:
- **Janeiro inteiro:** Altíssima temporada (R$ 420-530 para 2p)
- **Réveillon (20-31 Dez):** Altíssima temporada
- **Julho e Dezembro:** Alta temporada (R$ 350-450 para 2p)
- **Carnaval:** Alta temporada
- **Resto do ano:** Baixa temporada (R$ 250-350 para 2p)

### 3. API de Consulta de Preços

#### Obter Tabela de Preços
```
GET http://localhost:3000/api/precos/tabela
```

Retorna toda a tabela de preços com informações sobre o imóvel.

#### Calcular Preço de uma Estadia
```
GET http://localhost:3000/api/precos/calcular?capacidade=2&checkin=2025-01-10&checkout=2025-01-15
```

Retorna:
```json
{
  "periodo": {
    "checkin": "2025-01-10",
    "checkout": "2025-01-15",
    "numeroNoites": 5
  },
  "capacidade": 2,
  "valores": {
    "valorBase": 2375,
    "valorMedioDiaria": 475,
    "desconto": null,
    "valorFinal": 2375
  },
  "detalhamento": [
    {
      "data": "2025-01-10",
      "temporada": "altissima",
      "diaria": 475
    }
  ]
}
```

#### Verificar Temporada de uma Data
```
GET http://localhost:3000/api/precos/temporada?data=2025-01-15
```

Retorna:
```json
{
  "data": "2025-01-15",
  "temporada": "altissima",
  "nome": "Altíssima Temporada",
  "descricao": "Janeiro, Réveillon",
  "faixaPreco2pessoas": {
    "min": 420,
    "max": 530
  }
}
```

## 📝 Exemplos Práticos

### Exemplo 1: Casal em Janeiro (5 noites)
**Período:** 10/01/2025 a 15/01/2025
**Capacidade:** 2 pessoas
**Cálculo:**
- 5 noites × R$ 475/noite = **R$ 2.375,00**
- Sem desconto (menos de 7 noites)

### Exemplo 2: Família em Julho (10 noites)
**Período:** 05/07/2025 a 15/07/2025
**Capacidade:** 4 pessoas
**Cálculo:**
- 10 noites × R$ 485/noite = R$ 4.850,00
- Desconto de 5% = R$ 242,50
- **Total: R$ 4.607,50**

### Exemplo 3: Casal em Abril (15 noites)
**Período:** 01/04/2025 a 16/04/2025
**Capacidade:** 2 pessoas
**Cálculo:**
- 15 noites × R$ 300/noite = R$ 4.500,00
- Desconto de 10% = R$ 450,00
- **Total: R$ 4.050,00**

### Exemplo 4: Mensalista (30 noites)
**Período:** 01/03/2025 a 31/03/2025
**Capacidade:** 2 pessoas
**Cálculo:**
- 30 noites × R$ 300/noite = R$ 9.000,00
- Desconto de 15% = R$ 1.350,00
- **Total: R$ 7.650,00** (R$ 255/noite)

## 🔧 Como Usar

### Atualizar Preços dos Chalés
```bash
cd backend
npm run atualizar-precos
```

Este comando atualiza todos os chalés com os preços de referência.

### No Código (Automático)

Ao criar uma reserva, o sistema **calcula automaticamente** o valor:

```javascript
// Ao criar reserva via API
POST /api/reservas
{
  "chale_id": 1,
  "nome_hospede": "João Silva",
  "data_checkin": "2025-01-10",
  "data_checkout": "2025-01-15",
  "num_adultos": 2
  // valor_total é calculado automaticamente!
}

// Resposta
{
  "reserva": {
    "id": 1,
    "valor_total": 2375.00,
    // ... outros dados
  }
}
```

## 📈 Benefícios do Sistema

✅ **Preços Competitivos:** Baseados no mercado real de Arraial d'Ajuda
✅ **Maximiza Receita:** Preços mais altos em alta temporada
✅ **Atrai Clientes:** Descontos para estadias longas
✅ **Automático:** Não precisa calcular manualmente
✅ **Transparente:** Cliente vê detalhamento por dia
✅ **Flexível:** Fácil de ajustar valores

## 🎯 Recomendações

### Para Alta Temporada (Julho, Dezembro)
- Exija **reserva mínima** de 3-5 noites
- Solicite **sinal/depósito** de 30-50%
- **Não** ofereça descontos em datas muito procuradas

### Para Baixa Temporada (Março-Junho, Ago-Nov)
- Aceite reservas mais curtas (1-2 noites)
- **Destaque os descontos** para estadias longas
- Ofereça **flexibilidade** de cancelamento

### Para Janeiro e Réveillon
- **Aumente os preços** ao máximo da tabela
- Exija **reserva mínima** de 5-7 noites
- Solicite **pagamento antecipado** integral
- **Sem cancelamento** ou com multa alta

## 💡 Dicas de Marketing

Destaque sempre:
- 🏡 "Cozinha equipada - economize em restaurantes"
- 📍 "7 minutos do centro a pé"
- 💰 "Descontos progressivos para estadias longas"
- 🌿 "Área verde e tranquilidade"
- 🎯 "Ótima relação custo-benefício"

## 🔄 Ajustando Preços

Para ajustar os valores, edite o arquivo:
```
backend/src/config/precos.js
```

Depois execute:
```bash
npm run atualizar-precos
```

## 📊 Monitoramento

Acompanhe:
- Taxa de ocupação por temporada
- Preço médio por reserva
- Estadias longas vs curtas
- Concorrentes na região

Ajuste os preços conforme a demanda!

---

## 🎉 Resultado

Com este sistema, seus chalés terão:
- ✅ **Preços justos** baseados no mercado
- ✅ **Cálculo automático** de valores
- ✅ **Descontos inteligentes** para fidelização
- ✅ **Maximização de receita** em alta temporada
- ✅ **Competitividade** em baixa temporada

**Preços atualizados e prontos para usar!** 🚀

