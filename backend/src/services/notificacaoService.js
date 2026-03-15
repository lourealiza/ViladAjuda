const Notificacao = require('../models/Notificacao');
const Usuario = require('../models/Usuario');
const nodemailer = require('nodemailer');
const axios = require('axios');

class NotificacaoService {
    constructor() {
        // Inicializar transportador de email
        this.emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Array de conexões Socket.io (para notificações em tempo real)
        this.sockets = new Map();
    }

    /**
     * Registra socket para notificações em tempo real
     */
    registrarSocket(usuarioId, socket) {
        if (!this.sockets.has(usuarioId)) {
            this.sockets.set(usuarioId, []);
        }
        this.sockets.get(usuarioId).push(socket);
    }

    /**
     * Remove socket
     */
    removerSocket(usuarioId, socketId) {
        if (this.sockets.has(usuarioId)) {
            const sockets = this.sockets.get(usuarioId).filter(s => s.id !== socketId);
            if (sockets.length > 0) {
                this.sockets.set(usuarioId, sockets);
            } else {
                this.sockets.delete(usuarioId);
            }
        }
    }

    /**
     * Cria e envia notificação
     */
    async criarEEnviar(dados) {
        try {
            // 1. Criar notificação no banco
            const notificacao = await Notificacao.criar(dados);

            // 2. Enviar por canais especificados
            const canais = (dados.canais_entrega || 'email,in_app').split(',').map(c => c.trim());
            
            for (const canal of canais) {
                switch (canal) {
                    case Notificacao.CANAIS.EMAIL:
                        await this.enviarEmail(notificacao, dados);
                        break;
                    case Notificacao.CANAIS.PUSH:
                        await this.enviarPush(notificacao, dados);
                        break;
                    case Notificacao.CANAIS.SMS:
                        await this.enviarSMS(notificacao, dados);
                        break;
                    case Notificacao.CANAIS.WEBHOOK:
                        await this.enviarWebhook(notificacao, dados);
                        break;
                    case Notificacao.CANAIS.IN_APP:
                        await this.enviarInApp(notificacao, dados);
                        break;
                }
            }

            // 3. Marcar como enviada se tudo funcionou
            await Notificacao.atualizarStatus(notificacao.id, Notificacao.STATUS.ENVIADA);

            return notificacao;
        } catch (erro) {
            console.error('Erro ao criar notificação:', erro);
            throw erro;
        }
    }

    /**
     * Envia notificação por email
     */
    async enviarEmail(notificacao, dados) {
        try {
            // Se não tiver email, pular
            if (!dados.email && dados.usuario_id) {
                const usuario = await Usuario.buscarPorId(dados.usuario_id);
                if (!usuario) return;
                dados.email = usuario.email;
            }

            if (!dados.email) {
                console.warn(`Email não encontrado para notificação ${notificacao.id}`);
                return;
            }

            const template = this._gerarTemplateEmail(dados);

            const mailOptions = {
                from: process.env.SMTP_FROM || 'notificacoes@viladajuda.com.br',
                to: dados.email,
                subject: dados.titulo || 'Notificação Vila d\'Ajuda',
                html: template
            };

            await this.emailTransporter.sendMail(mailOptions);
            console.log(`Email enviado para ${dados.email} - Notificação ${notificacao.id}`);
        } catch (erro) {
            console.error('Erro ao enviar email:', erro);
            throw erro;
        }
    }

    /**
     * Envia notificação push (browser)
     */
    async enviarPush(notificacao, dados) {
        try {
            if (dados.usuario_id && this.sockets.has(dados.usuario_id)) {
                const sockets = this.sockets.get(dados.usuario_id);
                sockets.forEach(socket => {
                    socket.emit('notificacao', {
                        id: notificacao.id,
                        tipo: dados.tipo,
                        titulo: dados.titulo,
                        conteudo: dados.conteudo,
                        dados_extra: dados.dados_extra
                    });
                });
            }
        } catch (erro) {
            console.error('Erro ao enviar push:', erro);
        }
    }

    /**
     * Envia notificação in-app (já salva no banco)
     */
    async enviarInApp(notificacao, dados) {
        // In-app é apenas armazenar no banco (já feito em criarEEnviar)
        // Aqui podería emitir via socket.io
        if (dados.usuario_id) {
            await this.enviarPush(notificacao, dados);
        }
    }

    /**
     * Envia notificação por webhook
     */
    async enviarWebhook(notificacao, dados) {
        try {
            const webhookUrl = dados.webhook_url || process.env.WEBHOOK_URL;
            
            if (!webhookUrl) {
                console.warn('URL de webhook não configurada');
                return;
            }

            const payload = {
                id: notificacao.id,
                tipo: dados.tipo,
                titulo: dados.titulo,
                conteudo: dados.conteudo,
                usuario_id: dados.usuario_id,
                chale_id: dados.chale_id,
                reserva_id: dados.reserva_id,
                timestamp: new Date(),
                dados_extra: dados.dados_extra
            };

            await axios.post(webhookUrl, payload, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Secret': process.env.WEBHOOK_SECRET || 'secret'
                }
            });

            console.log(`Webhook enviado para ${webhookUrl} - Notificação ${notificacao.id}`);
        } catch (erro) {
            console.error('Erro ao enviar webhook:', erro.message);
        }
    }

    /**
     * Envia notificação por SMS (integração com serviço)
     */
    async enviarSMS(notificacao, dados) {
        try {
            const telefone = dados.telefone;
            if (!telefone) {
                console.warn('Telefone não fornecido para SMS');
                return;
            }

            // Exemplo com Twilio (você pode trocar por outro serviço)
            // require('twilio')...

            console.log(`SMS seria enviado para ${telefone}: ${dados.conteudo.substring(0, 50)}...`);
        } catch (erro) {
            console.error('Erro ao enviar SMS:', erro);
        }
    }

    /**
     * Gera template HTML do email
     */
    _gerarTemplateEmail(dados) {
        const logoUrl = process.env.LOGO_URL || 'https://via.placeholder.com/200x100?text=Vila+d%27Ajuda';
        
        const templatesEspecificos = {
            [Notificacao.TIPOS.NOVA_RESERVA]: () => `
                <h2>Nova Reserva Recebida!</h2>
                <p>Você recebeu uma nova solicitação de reserva.</p>
                <p><strong>Hóspede:</strong> ${dados.nome_hospede || 'N/A'}</p>
                <p><strong>Email:</strong> ${dados.email_hospede || 'N/A'}</p>
                <p><strong>Telefone:</strong> ${dados.telefone_hospede || 'N/A'}</p>
                <p><strong>Datas:</strong> ${dados.datas || 'N/A'}</p>
                <p><strong>Valor:</strong> R$ ${dados.valor || 'N/A'}</p>
                <a href="${process.env.ADMIN_URL}/reservas/${dados.reserva_id}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Detalhes</a>
            `,
            
            [Notificacao.TIPOS.CONFIRMACAO_PAGAMENTO]: () => `
                <h2>Pagamento Confirmado!</h2>
                <p>Seu pagamento foi recebido com sucesso.</p>
                <p><strong>Referência:</strong> ${dados.referencia_pagamento || 'N/A'}</p>
                <p><strong>Valor:</strong> R$ ${dados.valor || 'N/A'}</p>
                <p><strong>Data:</strong> ${dados.data_pagamento || new Date().toLocaleDateString('pt-BR')}</p>
                <p>Sua reserva está confirmada!</p>
            `,
            
            [Notificacao.TIPOS.CHECKIN_PROXIMO]: () => `
                <h2>Seu Check-in está Próximo!</h2>
                <p>Seu check-in está marcado para amanhã.</p>
                <p><strong>Data:</strong> ${dados.data_checkin || 'N/A'}</p>
                <p><strong>Horário:</strong> 14:00 às 21:00</p>
                <p>Confirme sua chegada ou entre em contato conosco.</p>
                <a href="${process.env.FRONTEND_URL}/minha-reserva/${dados.reserva_id}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Reserva</a>
            `,
            
            [Notificacao.TIPOS.AVALIACAO_RECEBIDA]: () => `
                <h2>Nova Avaliação Recebida!</h2>
                <p>Um hóspede deixou uma avaliação sobre sua hospedagem.</p>
                <p><strong>Classificação:</strong> ${'⭐'.repeat(dados.estrelas || 5)}</p>
                <p><strong>Comentário:</strong> "${dados.comentario || ''}"</p>
                <a href="${process.env.ADMIN_URL}/avaliacoes" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Avaliações</a>
            `
        };

        const conteudoBlocoPrincipal = templatesEspecificos[dados.tipo] 
            ? templatesEspecificos[dados.tipo]()
            : `<p>${dados.conteudo || ''}</p>`;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #4CAF50; }
                    .header img { max-width: 200px; }
                    .content { padding: 20px 0; }
                    .footer { padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
                    a { color: #4CAF50; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="${logoUrl}" alt="Vila d'Ajuda" style="max-width: 200px;">
                        <h1>Vila d'Ajuda</h1>
                    </div>
                    <div class="content">
                        ${conteudoBlocoPrincipal}
                    </div>
                    <div class="footer">
                        <p>© 2024 Vila d'Ajuda. Todos os direitos reservados.</p>
                        <p>
                            <a href="${process.env.FRONTEND_URL}">Site</a> | 
                            <a href="${process.env.FRONTEND_URL}/contato">Contato</a> | 
                            <a href="${process.env.FRONTEND_URL}/privacidade">Privacidade</a>
                        </p>
                        <p>Este é um email automático, por favor não responda.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Cria notificação de novo pedido/reserva para admin
     */
    async notificarNovaReserva(reserva) {
        // Buscar admin users
        const sql = `SELECT id, email FROM usuarios WHERE role = 'admin'`;
        
        return new Promise((resolve, reject) => {
            require('../config/database').all(sql, [], async (err, admins) => {
                if (err) return reject(err);
                
                const promessas = (admins || []).map(admin => 
                    this.criarEEnviar({
                        tipo: Notificacao.TIPOS.NOVA_RESERVA,
                        titulo: `Nova Reserva: ${reserva.nome_hospede || 'Sem nome'}`,
                        conteudo: `Nova solicitação de reserva de ${reserva.data_checkin} a ${reserva.data_checkout}`,
                        usuario_id: admin.id,
                        email: admin.email,
                        reserva_id: reserva.id,
                        chale_id: reserva.chale_id,
                        canais_entrega: 'email,in_app,push',
                        dados_extra: {
                            nome_hospede: reserva.nome_hospede,
                            email_hospede: reserva.email_hospede,
                            telefone_hospede: reserva.telefone_hospede,
                            datas: `${reserva.data_checkin} a ${reserva.data_checkout}`,
                            valor: reserva.valor_total,
                            reserva_id: reserva.id
                        }
                    })
                );

                try {
                    const resultados = await Promise.all(promessas);
                    resolve(resultados);
                } catch (erro) {
                    reject(erro);
                }
            });
        });
    }

    /**
     * Cria notificação de confirmação para hóspede
     */
    async notificarConfirmacaoHospede(reserva) {
        return this.criarEEnviar({
            tipo: Notificacao.TIPOS.CONFIRMACAO_HOSPEDE,
            titulo: 'Sua Reserva foi Confirmada!',
            conteudo: `Parabéns! Sua reserva está confirmada. Check-in: ${reserva.data_checkin}`,
            email: reserva.email_hospede,
            reserva_id: reserva.id,
            chale_id: reserva.chale_id,
            canais_entrega: 'email,push',
            dados_extra: {
                data_checkin: reserva.data_checkin,
                data_checkout: reserva.data_checkout,
                valor: reserva.valor_total,
                reserva_id: reserva.id
            }
        });
    }

    /**
     * Cria notificação de pagamento confirmado
     */
    async notificarPagamentoConfirmado(pagamento, email) {
        return this.criarEEnviar({
            tipo: Notificacao.TIPOS.CONFIRMACAO_PAGAMENTO,
            titulo: 'Pagamento Confirmado',
            conteudo: `Seu pagamento de R$ ${pagamento.valor} foi confirmado com sucesso.`,
            email: email,
            pagamento_id: pagamento.id,
            canais_entrega: 'email,in_app,push',
            dados_extra: {
                valor: pagamento.valor,
                referencia: pagamento.referencia_pagamento,
                data: new Date().toLocaleDateString('pt-BR')
            }
        });
    }

    /**
     * Cria notificação de check-in próximo
     */
    async notificarCheckinProximo(reserva) {
        return this.criarEEnviar({
            tipo: Notificacao.TIPOS.CHECKIN_PROXIMO,
            titulo: 'Seu Check-in está Próximo!',
            conteudo: `Seu check-in é amanhã às 14:00. Confirme sua chegada.`,
            email: reserva.email_hospede,
            reserva_id: reserva.id,
            chale_id: reserva.chale_id,
            canais_entrega: 'email,push',
            dados_extra: {
                data_checkin: reserva.data_checkin,
                reserva_id: reserva.id
            }
        });
    }

    /**
     * Cria notificação de avaliação recebida
     */
    async notificarAvaliacaoRecebida(avaliacao, admin) {
        return this.criarEEnviar({
            tipo: Notificacao.TIPOS.AVALIACAO_RECEBIDA,
            titulo: 'Nova Avaliação Recebida!',
            conteudo: `Você recebeu uma avaliação com ${avaliacao.estrelas} estrelas.`,
            usuario_id: admin.id,
            email: admin.email,
            chale_id: avaliacao.chale_id,
            canais_entrega: 'email,in_app,push',
            dados_extra: {
                estrelas: avaliacao.estrelas,
                comentario: avaliacao.comentario,
                nome: avaliacao.nome
            }
        });
    }

    /**
     * Processa fila de notificações pendentes
     */
    async processarFilaPendentes() {
        try {
            const pendentes = await Notificacao.buscarPendentes(50);
            
            for (const notif of pendentes) {
                try {
                    // Se máximo de tentativas atingido, cancelar
                    if (notif.tentativas_envio > 5) {
                        await Notificacao.atualizarStatus(notif.id, Notificacao.STATUS.ERRO);
                        continue;
                    }

                    // Tentar enviar novamente
                    const canais = (notif.canais_entrega || 'email,in_app').split(',');
                    let sucesso = false;

                    for (const canal of canais) {
                        try {
                            // Lógica de reenvio por canal...
                            sucesso = true;
                        } catch (erro) {
                            console.error(`Erro ao reenviar ${canal} para notificação ${notif.id}:`, erro.message);
                        }
                    }

                    if (sucesso) {
                        await Notificacao.atualizarStatus(notif.id, Notificacao.STATUS.ENVIADA);
                    } else {
                        await Notificacao.incrementarTentativas(notif.id);
                    }
                } catch (erro) {
                    console.error(`Erro processando notificação ${notif.id}:`, erro);
                    await Notificacao.incrementarTentativas(notif.id);
                }
            }

            console.log(`Processadas ${pendentes.length} notificações pendentes`);
        } catch (erro) {
            console.error('Erro ao processar fila de notificações:', erro);
        }
    }
}

// Export como singleton
module.exports = new NotificacaoService();
