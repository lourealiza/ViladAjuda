# 💰 Sistema de Pricing Dinâmico Avançado – Vila d'Ajuda

Documentação completa do sistema de precificação dinâmica com políticas de cancelamento, adicionais por hóspede e descontos progressivos.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Políticas de Cancelamento](#políticas-de-cancelamento)
- [Preços Adicionais](#preços-adicionais)
- [Cálculo de Preço Dinâmico](#cálculo-de-preço-dinâmico)
- [API REST](#api-rest)
- [Exemplos Práticos](#exemplos-práticos)
- [Scripts](#scripts)

---

## 🎯 Visão Geral

O sistema implementa as seguintes regras de negócio:

1. **Políticas de Cancelamento Flexíveis**
   - Flexível: +10-15% sobre tarifa (reembolso até 30 dias)
   - Não-reembolsável: 0% taxa (reembolso até 7 dias)
   - Moderada: +5% taxa (reembolso até 14 dias)
   - Rigorosa: +20% taxa (reembolso até 7 dias)

2. **Adicionais por Hóspede**
   - 3º/4º hóspede: R$ 60-100/noite
   - Criança: R$ 30-50/noite
   - Bebê: R$ 15-25/noite
   - Pet: R$ 50-100/noite
   - Cama extra: R$ 60-150/noite

3. **Descontos por Duração**
   - 4 noites: 3-5% (exceto Semana Santa)
   - 7 noites: 5-7% (exceto Semana Santa)
   - 14+ noites: 10% (exceto Semana Santa)
   - Semana Santa: máximo 2% (proteção de receita)

4. **Descontos Last-Minute (7 dias)**
   - 1-3 dias: -10%
   - 3-7 dias: -5%
   - Menos de 1 dia: -15%

5. **Período Especial 03-07/04/2026**
   - Preço fixo: R$ 530,00 por noite

---

## 🚫 Políticas de Cancelamento

### Estrutura de Dados

```sql
CREATE TABLE politicas_cancelamento (
    id INTEGER PRIMARY KEY,
    chale_id INTEGER NOT NULL,
    tipo TEXT, -- 'flexivel', 'nao_reembolsavel', 'moderada', 'rigorosa'
    taxa_adicional_percentual DECIMAL(5,2),
    descricao TEXT,
    condicoes_reembolso JSON,
    ativo BOOLEAN
);
```

### Tipos de Política

#### 1. Flexível (Recomendado)
```json
{
    "tipo": "flexivel",
    "taxa_adicional_percentual": 12.5,
    "descricao": "Política Flexível - Reembolso total até 30 dias"
}
```

**Reembolso:**
- 30+ dias antes: 100% reembolso
- 14-30 dias antes: 50% reembolso
- Menos de 14 dias: 0% reembolso
- **Taxa extra: +10-15%**

#### 2. Não-Reembolsável
```json
{
    "tipo": "nao_reembolsavel",
    "taxa_adicional_percentual": 0,
    "descricao": "Não-reembolsável - Reembolso até 7 dias"
}
```

#### 3. Moderada
```json
{
    "tipo": "moderada",
    "taxa_adicional_percentual": 5,
    "descricao": "Política Moderada - +5% de taxa"
}
```

#### 4. Rigorosa
```json
{
    "tipo": "rigorosa",
    "taxa_adicional_percentual": 20,
    "descricao": "Política Rigorosa - +20% de taxa"
}
```

### Exemplos de Cálculo

**Reserva: 03-07/04/2026 (R$ 530/noite × 5 noites = R$ 2.650)**

- **Política Flexível** (30 dias depois):
  - Reembolso: 100% = R$ 2.650
  - Taxa: -12.5% = -R$ 331,25
  - Saldo: **R$ 2.318,75**

- **Política Fleixível** (10 dias depois):
  - Reembolso: 50% = R$ 1.325
  - Taxa: -12.5% = -R$ 331,25
  - Saldo: **R$ 993,75**

- **Política Flexível** (3 dias depois):
  - Reembolso: 0%
  - Taxa: 0%
  - Saldo: **R$ 0**

---

## 💳 Preços Adicionais

### Estrutura de Dados

```sql
CREATE TABLE precos_adicionais (
    id INTEGER PRIMARY KEY,
    chale_id INTEGER NOT NULL,
    tipo TEXT, -- tipo de adicional
    preco_por_noite DECIMAL(10,2),
    descricao TEXT,
    condicoes JSON
);
```

### Tipos de Adicional

#### 1. Hóspede Extra (3º/4º)
```json
{
    "chale_id": 1,
    "tipo": "hospede_extra",
    "preco_por_noite": 80,
    "descricao": "3º ou 4º hóspede com cama extra"
}
```

#### 2. Criança (até 12 anos)
```json
{
    "chale_id": 1,
    "tipo": "crianca",
    "preco_por_noite": 40,
    "descricao": "Criança até 12 anos com cama extra"
}
```

#### 3. Bebê (até 3 anos)
```json
{
    "chale_id": 1,
    "tipo": "bebe",
    "preco_por_noite": 20,
    "descricao": "Bebê até 3 anos (sem cama)"
}
```

#### 4. Pet
```json
{
    "chale_id": 1,
    "tipo": "pet",
    "preco_por_noite": 75,
    "descricao": "Animal de estimação"
}
```

---

## 📊 Cálculo de Preço Dinâmico

### Fórmula

```
PREÇO TOTAL = (
    Preço Base por Temporada
    + Desconto/Taxa por Duração
    + Adicionais (hóspede, criança, pet)
    - Desconto Last-Minute
)
```

### Exemplo Detalhado

**Cenário:** Casal + 1 criança, 05-10/04/2026 (5 noites, última hora)

1. **Preço Base**
   - R$ 530/noite × 5 noites = R$ 2.650

2. **Desconto por Duração**
   - Não aplicável (fora de semana santa, mas 5 noites = 3-5%)
   - -3% = -R$ 79,50
   - Subtotal: R$ 2.570,50

3. **Adicional Criança**
   - R$ 40/noite × 5 noites = R$ 200
   - Novo Subtotal: R$ 2.770,50

4. **Desconto Last-Minute**
   - Check-in em ~17-20 dias = sem aplicação
   - Desconto: R$ 0

5. **TOTAL: R$ 2.770,50**

---

## 🔌 API REST

### 1. Calcular Preço Dinâmico

**Endpoint:** `POST /api/precos/calcular-dinamico`

**Body:**
```json
{
    "chale_id": 1,
    "data_checkin": "2026-04-03",
    "data_checkout": "2026-04-07",
    "num_hospedes": 4,
    "num_criancas": 1
}
```

**Resposta:**
```json
{
    "sucesso": true,
    "calculo": {
        "data_checkin": "2026-04-03",
        "data_checkout": "2026-04-07",
        "num_diarias": 5,
        "num_hospedes": 4,
        
        "preco_base": {
            "subtotal": 2650.00,
            "detalhes_por_dia": [
                {
                    "data": "2026-04-03",
                    "temporada": "Especial Abril (03-07)",
                    "preco": 530
                }
            ]
        },
        
        "desconto_duracao": {
            "percentual": 3,
            "desconto_ou_taxa": -79.50,
            "observacao": "Desconto por 5 noites"
        },
        
        "adicionais_hospede": {
            "total": 160.00,
            "detalhes": {
                "preco_por_noite": 80,
                "num_hospedes_extras": 2,
                "num_diarias": 5
            }
        },
        
        "valor_total": 2730.50,
        
        "politica_cancelamento": {
            "tipo": "flexivel",
            "taxa_percentual": 12.5
        }
    }
}
```

### 2. Simular Cenários

**Endpoint:** `GET /api/precos/simular-cenarios`

**Query:**
```
?chale_id=1&data_checkin=2026-04-03&data_checkout=2026-04-07&num_hospedes=4
```

### 3. Calcular Cancelamento

**Endpoint:** `POST /api/precos/cancelamento`

**Body:**
```json
{
    "chale_id": 1,
    "valor_total": 2730.50,
    "dias_antes_checkin": 10
}
```

**Resposta:**
```json
{
    "sucesso": true,
    "dados": {
        "tipo": "flexivel",
        "valor_total": 2730.50,
        "dias_antes_checkin": 10,
        "reembolso_percentual": 50,
        "valor_reembolso": 1365.25,
        "taxa_percentual": 12.5,
        "taxa_cancelamento": 341.31,
        "saldo_retorno": 1023.94
    }
}
```

### 4. Criar Política (Admin)

**Endpoint:** `POST /api/precos/politicas`

**Headers:** `Authorization: Bearer <TOKEN>`

**Body:**
```json
{
    "chale_id": 1,
    "tipo": "flexivel",
    "taxa_adicional_percentual": 12.5,
    "descricao": "Política Flexível - Reembolso até 30 dias"
}
```

### 5. Criar Adicional (Admin)

**Endpoint:** `POST /api/precos/adicionais`

**Headers:** `Authorization: Bearer <TOKEN>`

**Body:**
```json
{
    "chale_id": 1,
    "tipo": "hospede_extra",
    "preco_por_noite": 80,
    "descricao": "3º ou 4º hóspede com cama extra"
}
```

---

## 📝 Exemplos Práticos

### Exemplo 1: Casal em Preço Especial (Últimas Horas)

```bash
curl -X POST http://localhost:3000/api/precos/calcular-dinamico \
  -H "Content-Type: application/json" \
  -d '{
    "chale_id": 1,
    "data_checkin": "2026-04-05",
    "data_checkout": "2026-04-07",
    "num_hospedes": 2
  }'
```

**Resultado:** R$ 1.007,50
- Base: 2 × R$ 530 = R$ 1.060
- Last-minute (-10% em 4-5 dias): -R$ 106
- Desconto duração (2 noites): 0%
- **Total: R$ 954**

### Exemplo 2: Família com Adicionais

```bash
curl -X POST http://localhost:3000/api/precos/calcular-dinamico \
  -H "Content-Type: application/json" \
  -d '{
    "chale_id": 1,
    "data_checkin": "2026-04-03",
    "data_checkout": "2026-04-08",
    "num_hospedes": 4,
    "num_criancas": 1
  }'
```

**Resultado:** ~R$ 3.100
- Base: 5 × R$ 530 = R$ 2.650
- Desconto duração (-3%): -R$ 79,50
- 2 hóspedes extras: 2 × R$ 80 × 5 = R$ 800
- **Total: ~R$ 3.371**

### Exemplo 3: Cancelamento 10 Dias Antes

```bash
curl -X POST http://localhost:3000/api/precos/cancelamento \
  -H "Content-Type: application/json" \
  -d '{
    "chale_id": 1,
    "valor_total": 2650,
    "dias_antes_checkin": 10
  }'
```

**Resultado (Política Flexível):**
- Reembolso 50%: R$ 1.325
- Taxa 12.5%: -R$ 331,25
- **Saldo: R$ 993,75**

---

## 🚀 Scripts

### Atualizar Preços 03-07/04/2026

```bash
cd backend
node src/scripts/atualizarPrecos_AbrilEspecial.js
```

**Saída:**
```
🚀 Iniciando atualização de preços para 03-07/04/2026...

📅 Verificando temporada especial...
✓ Temporada criada: Especial Abril (03-07) (ID: 8)

🏠 Buscando chalés ativos...
✓ Encontrados 7 chalé(s)

💰 Atualizando preços...
  ✓ Chalé 1: Criado com R$ 530,00
  ✓ Chalé 2: Atualizado para R$ 530,00
  ... (outros chalés)

📊 Resumo da atualização:
  ✓ Sucessos: 7
  ✗ Erros: 0
  📅 Período: 2026-04-03 a 2026-04-07
  💵 Preço: R$ 530,00/noite
```

---

## 📊 Tabela de Referência Rápida

| Política | Reembolso 30d | Reembolso 14d | Reembolso 7d | Taxa |
|----------|---------------|---------------|--------------|------|
| Flexível | 100% | 50% | 0% | +12.5% |
| Moderada | 100% | 100% | 50% | +5% |
| Não-reemb | 100% | 100% | 100% | 0% |
| Rigorosa | 100% | 100% | 0% | +20% |

| Duração | Desconto Normal | Semana Santa | Observação |
|---------|-----------------|--------------|-----------|
| 4-6 noites | 3-5% | 0% | Evitar desconto agressivo |
| 7-13 noites | 5-7% | 2% | Desconto moderado |
| 14+ noites | 10% | 5% | Longa estadia |
| Last-minute 7d | -5% | -5% | Progressivo |
| Last-minute 3d | -10% | -10% | Mais agressivo |
| Last-minute 1d | -15% | -15% | Máximo |

---

## ⚙️ Configuração Inicial

### 1. Executar Migrations

```bash
npm run init-db
```

### 2. Criar Políticas Padrão

```bash
npm run setup-politicas
```

### 3. Atualizar Preços Especiais

```bash
node src/scripts/atualizarPrecos_AbrilEspecial.js
```

---

## 🔍 Troubleshooting

### Preço não está sendo calculado corretamente

1. Verificar se a temporada existe:
   ```bash
   SELECT * FROM temporadas WHERE data_inicio <= '2026-04-03' AND data_fim >= '2026-04-03';
   ```

2. Verificar se o chalé tem preço para a temporada:
   ```bash
   SELECT * FROM chale_temporada_precos WHERE chale_id = 1 AND temporada_id = 8;
   ```

3. Limpar cache e reprocessar

### Desconto não está sendo aplicado

1. Verificar se está fora de Semana Santa
2. Verificar número de noites (>= 4)
3. Verificar data atual para o cálculo de last-minute

---

## 📞 Suporte

Para problemas ou dúvidas, consulte:
- Documentação do coontroller: `src/controllers/precoAvancadoController.js`
- Serviço de pricing: `src/services/pricingService.js`
- Modelos: `src/models/PoliticaCancelamento.js` e `src/models/PrecoAdicional.js`
