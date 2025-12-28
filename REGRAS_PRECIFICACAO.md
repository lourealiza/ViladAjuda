# 💰 Regras de Precificação - Vila d'Ajuda

Este documento descreve as regras de precificação implementadas no sistema.

## 📋 Regras Implementadas

### 1. 💑 Desconto para Casal (2 pessoas)

**Regra:** Casal pode trabalhar 10-15% abaixo do valor cheio de 4 pessoas.

**Exemplo:** Se a diária cheia é R$ 600, casal em R$ 520-540.

**Implementação:**
- Desconto aplicado: **12.5%** (média entre 10% e 15%)
- Aplicado automaticamente quando `num_adultos === 2`
- Desconto aplicado no preço base após cálculo de temporada/feriado
- Não se acumula com outros descontos de pessoas

**Cálculo:**
```
Preço base (com temporada) = R$ 600
Desconto casal (12.5%) = R$ 75
Preço final para casal = R$ 525
```

### 2. 📦 Desconto para Pacotes (5+ noites)

**Regra:** Oferecer 5-10% de desconto sobre a soma das diárias para facilitar o "fecha logo".

**Implementação:**
- **5-6 noites:** 5% de desconto
- **7-14 noites:** 7% de desconto (média entre 5-10%)
- **15+ noites:** 10% de desconto

**Aplicação:**
- Desconto aplicado sobre o valor subtotal (hospedagem + pessoas extras + crianças)
- Calculado após todos os outros cálculos de preço base
- Aplicado antes de cupons e Black Friday

**Exemplo:**
```
Valor subtotal (5 noites): R$ 2.500
Desconto pacote (5%): R$ 125
Valor final: R$ 2.375
```

### 3. 🎉 Feriados 2026 - Preço no Topo da Faixa

**Regra:** Use sempre o topo da faixa da linha correspondente, pois feriados e emendas elevam a demanda.

**Feriados Nacionais 2026:**
- 01/01 - Confraternização Universal
- 16/02 - Carnaval
- 17/02 - Carnaval
- 03/04 - Paixão de Cristo (Sexta-feira Santa)
- 21/04 - Tiradentes
- 01/05 - Dia do Trabalho
- 04/06 - Corpus Christi
- 07/09 - Independência do Brasil
- 12/10 - Nossa Senhora Aparecida
- 02/11 - Finados
- 15/11 - Proclamação da República
- 25/12 - Natal

**Implementação:**
- Cada feriado busca a temporada correspondente à data
- Preço calculado: `Preço Base × Multiplicador Temporada × 1.07` (topo da faixa)
- Se não houver temporada específica, usa multiplicador padrão de 1.5x
- Preço definido via `preco_override` na tabela `feriados`

**Exemplo:**
```
Temporada: Alta (multiplicador 1.71x)
Preço base: R$ 350
Preço médio temporada: R$ 350 × 1.71 = R$ 598.50
Preço no topo (feriado): R$ 350 × 1.71 × 1.07 = R$ 640.40
```

## 🔄 Ordem de Aplicação das Regras

1. **Preço Base do Chalé** (R$ 350)
2. **Multiplicador de Temporada** (ex: 1.71x para Alta)
3. **Override de Feriado** (se aplicável, usa preço no topo)
4. **Desconto para Casal** (12.5% se 2 pessoas)
5. **Pessoas Extras** (acima de 2 pessoas)
6. **Crianças** (se aplicável)
7. **Desconto para Pacotes** (5-10% para 5+ noites)
8. **Cupons** (se aplicável)
9. **Black Friday** (se aplicável)

## 📊 Exemplos Práticos

### Exemplo 1: Casal em Alta Temporada (5 noites)

```
Preço base: R$ 350
Multiplicador alta: 1.71x
Preço com temporada: R$ 598.50
Desconto casal (12.5%): -R$ 74.81
Preço por dia: R$ 523.69
5 noites: R$ 2.618,45
Desconto pacote (5%): -R$ 130.92
Valor final: R$ 2.487,53
```

### Exemplo 2: 4 Pessoas em Feriado (3 noites)

```
Preço base: R$ 350
Temporada: Alta (1.71x)
Preço médio: R$ 598.50
Feriado (topo): R$ 640.40
3 noites: R$ 1.921,20
Pessoas extras (2 pessoas × R$ 150 × 3): +R$ 900
Valor final: R$ 2.821,20
```

### Exemplo 3: Casal em Baixa Temporada (7 noites)

```
Preço base: R$ 350
Multiplicador baixa: 1.23x
Preço com temporada: R$ 430.50
Desconto casal (12.5%): -R$ 53.81
Preço por dia: R$ 376.69
7 noites: R$ 2.636,83
Desconto pacote (7%): -R$ 184.58
Valor final: R$ 2.452,25
```

## 🚀 Scripts Disponíveis

### Cadastrar Feriados 2026

```bash
cd backend
node src/scripts/cadastrarFeriados2026.js
```

Este script:
- Cadastra todos os feriados nacionais de 2026
- Calcula preço no topo da faixa para cada feriado
- Busca temporada correspondente automaticamente
- Atualiza feriados existentes se necessário

## 📝 Notas Importantes

1. **Desconto de Casal:** Aplicado apenas para exatamente 2 adultos. Se houver 1 ou 3+ adultos, não aplica.

2. **Desconto de Pacotes:** Aplicado apenas para 5+ noites. Não se acumula com outros descontos de estadia longa.

3. **Feriados:** O preço no topo é calculado automaticamente baseado na temporada. Se a temporada mudar, o preço do feriado pode ser atualizado.

4. **Prioridade:** Feriados com `preco_override` têm prioridade máxima sobre temporadas.

5. **Cálculo Dinâmico:** Todos os cálculos são feitos dinamicamente baseados nas datas da reserva.

