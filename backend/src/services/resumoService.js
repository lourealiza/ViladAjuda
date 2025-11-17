const Reserva = require('../models/Reserva');
const Chale = require('../models/Chale');
const Pagamento = require('../models/Pagamento');
const Cupom = require('../models/Cupom');

class ResumoService {
    /**
     * Gera resumo completo da reserva
     */
    static async gerarResumo(reservaId) {
        const reserva = await Reserva.buscarPorId(reservaId);
        
        if (!reserva) {
            throw new Error('Reserva não encontrada');
        }

        // Buscar dados complementares
        const chale = reserva.chale_id ? await Chale.buscarPorId(reserva.chale_id) : null;
        const pagamentos = await Pagamento.buscarPorReserva(reservaId);
        const cupom = reserva.cupom_id ? await Cupom.buscarPorId(reserva.cupom_id) : null;

        // Calcular valores
        const valorPago = await Pagamento.calcularValorPago(reservaId);
        const valorPendente = parseFloat((reserva.valor_total - valorPago).toFixed(2));

        // Formatar datas
        const dataCheckin = new Date(reserva.data_checkin);
        const dataCheckout = new Date(reserva.data_checkout);
        const dataCriacao = new Date(reserva.criado_em);

        const resumo = {
            // Informações da reserva
            numero_reserva: reserva.id,
            status: reserva.status,
            data_criacao: this._formatarData(dataCriacao),
            
            // Informações do hóspede
            hospede: {
                nome: reserva.nome_hospede,
                email: reserva.email_hospede,
                telefone: reserva.telefone_hospede,
                cidade: reserva.cidade_hospede || 'Não informado'
            },

            // Informações do chalé
            chale: chale ? {
                nome: chale.nome,
                descricao: chale.descricao,
                capacidade_adultos: chale.capacidade_adultos,
                capacidade_criancas: chale.capacidade_criancas
            } : null,

            // Período
            periodo: {
                checkin: this._formatarData(dataCheckin),
                checkout: this._formatarData(dataCheckout),
                num_diarias: reserva.num_diarias,
                num_adultos: reserva.num_adultos,
                num_criancas: reserva.num_criancas
            },

            // Valores
            valores: {
                valor_subtotal: reserva.valor_subtotal || reserva.valor_total,
                valor_desconto: reserva.valor_desconto || 0,
                valor_total: reserva.valor_total,
                valor_sinal: reserva.valor_sinal || 0,
                valor_pago: valorPago,
                valor_pendente: valorPendente
            },

            // Cupom aplicado
            cupom: cupom ? {
                codigo: cupom.codigo,
                tipo: cupom.tipo,
                valor: cupom.valor
            } : null,

            // Pagamentos
            pagamentos: pagamentos.map(p => ({
                tipo: p.tipo,
                valor: p.valor,
                status: p.status,
                data_pagamento: p.data_pagamento ? this._formatarData(new Date(p.data_pagamento)) : null
            })),

            // Forma de pagamento
            forma_pagamento: reserva.forma_pagamento || 'Não definida',

            // Observações
            observacoes: reserva.observacoes || reserva.mensagem || 'Nenhuma observação',

            // Informações adicionais
            origem: reserva.origem_canal || 'Site',
            criado_em: this._formatarDataHora(dataCriacao)
        };

        return resumo;
    }

    /**
     * Gera resumo em formato texto (para email)
     */
    static async gerarResumoTexto(reservaId) {
        const resumo = await this.gerarResumo(reservaId);

        let texto = `
═══════════════════════════════════════════════════════
         RESUMO DA RESERVA #${resumo.numero_reserva}
═══════════════════════════════════════════════════════

STATUS: ${this._traduzirStatus(resumo.status)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HÓSPEDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${resumo.hospede.nome}
E-mail: ${resumo.hospede.email}
Telefone: ${resumo.hospede.telefone}
Cidade: ${resumo.hospede.cidade}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACOMODAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${resumo.chale ? `Chalé: ${resumo.chale.nome}\n${resumo.chale.descricao || ''}` : 'Chalé não especificado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERÍODO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Check-in: ${resumo.periodo.checkin}
Check-out: ${resumo.periodo.checkout}
Número de diárias: ${resumo.periodo.num_diarias}
Adultos: ${resumo.periodo.num_adultos}
Crianças: ${resumo.periodo.num_criancas}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALORES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal: R$ ${resumo.valores.valor_subtotal.toFixed(2)}
${resumo.valores.valor_desconto > 0 ? `Desconto: -R$ ${resumo.valores.valor_desconto.toFixed(2)}\n` : ''}${resumo.cupom ? `Cupom aplicado: ${resumo.cupom.codigo}\n` : ''}Total: R$ ${resumo.valores.valor_total.toFixed(2)}
Sinal: R$ ${resumo.valores.valor_sinal.toFixed(2)}
Valor pago: R$ ${resumo.valores.valor_pago.toFixed(2)}
Valor pendente: R$ ${resumo.valores.valor_pendente.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGAMENTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Forma de pagamento: ${resumo.forma_pagamento}

${resumo.pagamentos.length > 0 ? resumo.pagamentos.map((p, i) => 
    `${i + 1}. ${p.tipo.toUpperCase()} - R$ ${p.valor.toFixed(2)} - ${p.status === 'pago' ? '✓ Pago' : '⏳ Pendente'}${p.data_pagamento ? ` em ${p.data_pagamento}` : ''}`
).join('\n') : 'Nenhum pagamento registrado'}

${resumo.observacoes && resumo.observacoes !== 'Nenhuma observação' ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBSERVAÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${resumo.observacoes}
` : ''}
═══════════════════════════════════════════════════════
Reserva criada em: ${resumo.criado_em}
Origem: ${resumo.origem}
═══════════════════════════════════════════════════════
        `;

        return texto.trim();
    }

    /**
     * Gera resumo em formato HTML (para email)
     */
    static async gerarResumoHTML(reservaId) {
        const resumo = await this.gerarResumo(reservaId);

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4a90e2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .section { margin-bottom: 20px; }
        .section-title { background: #4a90e2; color: white; padding: 10px; margin: -20px -20px 15px -20px; font-weight: bold; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        .status-solicitacao_recebida { background: #e3f2fd; color: #1976d2; }
        .status-aguardando_pagamento { background: #fff3e0; color: #f57c00; }
        .status-confirmada { background: #e8f5e9; color: #388e3c; }
        .status-checkin_realizado { background: #e1bee7; color: #7b1fa2; }
        .status-checkout_realizado { background: #c5e1a5; color: #558b2f; }
        .status-cancelada { background: #ffcdd2; color: #c62828; }
        .valor { font-size: 18px; font-weight: bold; color: #4a90e2; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Resumo da Reserva #${resumo.numero_reserva}</h1>
            <p>Status: <span class="status status-${resumo.status}">${this._traduzirStatus(resumo.status)}</span></p>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">Hóspede</div>
                <div class="info-row"><span class="label">Nome:</span> <span class="value">${resumo.hospede.nome}</span></div>
                <div class="info-row"><span class="label">E-mail:</span> <span class="value">${resumo.hospede.email}</span></div>
                <div class="info-row"><span class="label">Telefone:</span> <span class="value">${resumo.hospede.telefone}</span></div>
                <div class="info-row"><span class="label">Cidade:</span> <span class="value">${resumo.hospede.cidade}</span></div>
            </div>

            ${resumo.chale ? `
            <div class="section">
                <div class="section-title">Acomodação</div>
                <div class="info-row"><span class="label">Chalé:</span> <span class="value">${resumo.chale.nome}</span></div>
                ${resumo.chale.descricao ? `<div class="info-row">${resumo.chale.descricao}</div>` : ''}
            </div>
            ` : ''}

            <div class="section">
                <div class="section-title">Período</div>
                <div class="info-row"><span class="label">Check-in:</span> <span class="value">${resumo.periodo.checkin}</span></div>
                <div class="info-row"><span class="label">Check-out:</span> <span class="value">${resumo.periodo.checkout}</span></div>
                <div class="info-row"><span class="label">Diárias:</span> <span class="value">${resumo.periodo.num_diarias}</span></div>
                <div class="info-row"><span class="label">Hóspedes:</span> <span class="value">${resumo.periodo.num_adultos} adultos, ${resumo.periodo.num_criancas} crianças</span></div>
            </div>

            <div class="section">
                <div class="section-title">Valores</div>
                <div class="info-row"><span class="label">Subtotal:</span> <span class="value">R$ ${resumo.valores.valor_subtotal.toFixed(2)}</span></div>
                ${resumo.valores.valor_desconto > 0 ? `<div class="info-row"><span class="label">Desconto:</span> <span class="value">-R$ ${resumo.valores.valor_desconto.toFixed(2)}</span></div>` : ''}
                ${resumo.cupom ? `<div class="info-row"><span class="label">Cupom:</span> <span class="value">${resumo.cupom.codigo}</span></div>` : ''}
                <div class="info-row"><span class="label">Total:</span> <span class="valor">R$ ${resumo.valores.valor_total.toFixed(2)}</span></div>
                <div class="info-row"><span class="label">Sinal:</span> <span class="value">R$ ${resumo.valores.valor_sinal.toFixed(2)}</span></div>
                <div class="info-row"><span class="label">Pago:</span> <span class="value">R$ ${resumo.valores.valor_pago.toFixed(2)}</span></div>
                <div class="info-row"><span class="label">Pendente:</span> <span class="value">R$ ${resumo.valores.valor_pendente.toFixed(2)}</span></div>
            </div>

            <div class="section">
                <div class="section-title">Pagamentos</div>
                <div class="info-row"><span class="label">Forma de pagamento:</span> <span class="value">${resumo.forma_pagamento}</span></div>
                ${resumo.pagamentos.length > 0 ? `
                <ul>
                    ${resumo.pagamentos.map(p => `
                    <li>${p.tipo.toUpperCase()} - R$ ${p.valor.toFixed(2)} - ${p.status === 'pago' ? '✓ Pago' : '⏳ Pendente'}${p.data_pagamento ? ` em ${p.data_pagamento}` : ''}</li>
                    `).join('')}
                </ul>
                ` : '<p>Nenhum pagamento registrado</p>'}
            </div>

            ${resumo.observacoes && resumo.observacoes !== 'Nenhuma observação' ? `
            <div class="section">
                <div class="section-title">Observações</div>
                <p>${resumo.observacoes.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <p>Reserva criada em: ${resumo.criado_em}</p>
            <p>Origem: ${resumo.origem}</p>
        </div>
    </div>
</body>
</html>
        `;

        return html.trim();
    }

    /**
     * Traduz status para português
     */
    static _traduzirStatus(status) {
        const traducoes = {
            'solicitacao_recebida': 'Solicitação Recebida',
            'aguardando_pagamento': 'Aguardando Pagamento / Sinal',
            'confirmada': 'Confirmada',
            'checkin_realizado': 'Check-in Realizado',
            'checkout_realizado': 'Check-out Realizado',
            'cancelada': 'Cancelada'
        };
        return traducoes[status] || status;
    }

    /**
     * Formata data
     */
    static _formatarData(data) {
        return data.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Formata data e hora
     */
    static _formatarDataHora(data) {
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

module.exports = ResumoService;

