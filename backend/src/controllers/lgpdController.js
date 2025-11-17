const Conteudo = require('../models/Conteudo');
const Reserva = require('../models/Reserva');

class LGPDController {
    /**
     * Obter política de privacidade
     */
    static async obterPoliticaPrivacidade(req, res) {
        try {
            // Buscar conteúdo do tipo "politica_privacidade" ou seção "lgpd"
            const politica = await Conteudo.buscarPorTipo('pagina');
            const politicaLGPD = politica.find(p => 
                p.slug === 'politica-de-privacidade' || 
                p.secao === 'lgpd'
            );

            if (!politicaLGPD) {
                return res.json({
                    titulo: 'Política de Privacidade',
                    conteudo: this._politicaPadrao(),
                    versao: '1.0',
                    data_atualizacao: new Date().toISOString()
                });
            }

            res.json({
                titulo: politicaLGPD.titulo,
                conteudo: politicaLGPD.conteudo,
                versao: politicaLGPD.meta_title || '1.0',
                data_atualizacao: politicaLGPD.atualizado_em
            });
        } catch (erro) {
            console.error('Erro ao obter política de privacidade:', erro);
            res.status(500).json({
                erro: 'Erro ao obter política de privacidade',
                mensagem: erro.message
            });
        }
    }

    /**
     * Registrar consentimento LGPD
     */
    static async registrarConsentimento(req, res) {
        try {
            const { reserva_id, consentimento_lgpd, politica_privacidade_aceita } = req.body;

            if (!reserva_id) {
                return res.status(400).json({
                    erro: 'reserva_id é obrigatório'
                });
            }

            const reserva = await Reserva.buscarPorId(reserva_id);
            if (!reserva) {
                return res.status(404).json({
                    erro: 'Reserva não encontrada'
                });
            }

            await Reserva.atualizar(reserva_id, {
                consentimento_lgpd: consentimento_lgpd !== false,
                politica_privacidade_aceita: politica_privacidade_aceita !== false,
                data_consentimento: new Date().toISOString()
            });

            res.json({
                mensagem: 'Consentimento registrado com sucesso',
                consentimento: {
                    reserva_id,
                    consentimento_lgpd: consentimento_lgpd !== false,
                    politica_privacidade_aceita: politica_privacidade_aceita !== false,
                    data_consentimento: new Date().toISOString()
                }
            });
        } catch (erro) {
            console.error('Erro ao registrar consentimento:', erro);
            res.status(500).json({
                erro: 'Erro ao registrar consentimento',
                mensagem: erro.message
            });
        }
    }

    /**
     * Verificar consentimento de uma reserva
     */
    static async verificarConsentimento(req, res) {
        try {
            const { reserva_id } = req.params;
            const reserva = await Reserva.buscarPorId(reserva_id);

            if (!reserva) {
                return res.status(404).json({
                    erro: 'Reserva não encontrada'
                });
            }

            res.json({
                reserva_id: reserva.id,
                consentimento_lgpd: Boolean(reserva.consentimento_lgpd),
                politica_privacidade_aceita: Boolean(reserva.politica_privacidade_aceita),
                data_consentimento: reserva.data_consentimento
            });
        } catch (erro) {
            console.error('Erro ao verificar consentimento:', erro);
            res.status(500).json({
                erro: 'Erro ao verificar consentimento',
                mensagem: erro.message
            });
        }
    }

    /**
     * Política de privacidade padrão
     */
    static _politicaPadrao() {
        return `
<h1>Política de Privacidade - Vila d'Ajuda</h1>

<h2>1. Coleta de Dados</h2>
<p>Coletamos os seguintes dados para processar sua reserva:</p>
<ul>
    <li>Nome completo</li>
    <li>E-mail</li>
    <li>Telefone/WhatsApp</li>
    <li>Cidade/Estado</li>
    <li>Dados da reserva (datas, chalé, número de hóspedes)</li>
</ul>

<h2>2. Uso dos Dados</h2>
<p>Utilizamos seus dados exclusivamente para:</p>
<ul>
    <li>Processar e confirmar sua reserva</li>
    <li>Entrar em contato sobre sua estadia</li>
    <li>Enviar informações importantes sobre sua reserva</li>
    <li>Melhorar nossos serviços</li>
</ul>

<h2>3. Compartilhamento</h2>
<p>Não compartilhamos seus dados pessoais com terceiros, exceto quando necessário para processar pagamentos ou cumprir obrigações legais.</p>

<h2>4. Segurança</h2>
<p>Adotamos medidas de segurança para proteger seus dados pessoais contra acesso não autorizado.</p>

<h2>5. Seus Direitos</h2>
<p>Você tem direito a:</p>
<ul>
    <li>Acessar seus dados pessoais</li>
    <li>Corrigir dados incorretos</li>
    <li>Solicitar exclusão de seus dados</li>
    <li>Revogar seu consentimento a qualquer momento</li>
</ul>

<h2>6. Contato</h2>
<p>Para exercer seus direitos ou esclarecer dúvidas, entre em contato: admin@viladajuda.com</p>

<p><strong>Última atualização:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        `;
    }
}

module.exports = LGPDController;

