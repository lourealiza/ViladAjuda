const Reserva = require('../models/Reserva');
const Bloqueio = require('../models/Bloqueio');
const Temporada = require('../models/Temporada');
const Chale = require('../models/Chale');

class DisponibilidadeService {
    /**
     * Validação completa de disponibilidade antes de criar reserva
     */
    static async validarDisponibilidade(dados) {
        const { chale_id, data_checkin, data_checkout } = dados;
        const erros = [];
        const avisos = [];

        // 1. Verificar se chalé existe e está ativo
        const chale = await Chale.buscarPorId(chale_id);
        if (!chale) {
            erros.push('Chalé não encontrado');
            return { valido: false, erros, avisos };
        }

        if (!chale.ativo) {
            erros.push('Chalé está inativo');
            return { valido: false, erros, avisos };
        }

        // 2. Validar datas
        const dataInicio = new Date(data_checkin);
        const dataFim = new Date(data_checkout);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (dataInicio < hoje) {
            erros.push('Data de check-in não pode ser no passado');
        }

        if (dataFim <= dataInicio) {
            erros.push('Data de checkout deve ser posterior à data de check-in');
        }

        // 3. Calcular número de diárias
        const numDiarias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));

        // 4. Verificar bloqueios
        const bloqueado = await Bloqueio.verificarBloqueio(
            chale_id,
            data_checkin,
            data_checkout
        );

        if (bloqueado) {
            const bloqueios = await Bloqueio.buscarBloqueiosPorPeriodo(
                chale_id,
                data_checkin,
                data_checkout
            );
            erros.push(`Período bloqueado: ${bloqueios.map(b => b.motivo || b.tipo).join(', ')}`);
        }

        // 5. Verificar disponibilidade (reservas existentes)
        const disponivel = await Chale.verificarDisponibilidade(
            chale_id,
            data_checkin,
            data_checkout
        );

        if (!disponivel) {
            erros.push('Chalé não está disponível para o período selecionado');
        }

        // 6. Verificar diária mínima por temporada
        const temporadas = await Temporada.buscarPorPeriodo(data_checkin, data_checkout);
        let diariaMinimaRequerida = 2; // Diária mínima padrão: 2 dias

        for (const temporada of temporadas) {
            if (temporada.diaria_minima > diariaMinimaRequerida) {
                diariaMinimaRequerida = temporada.diaria_minima;
            }
        }

        if (numDiarias < diariaMinimaRequerida) {
            erros.push(
                `Período requer mínimo de ${diariaMinimaRequerida} diária(s). ` +
                `Você selecionou ${numDiarias} diária(s).`
            );
        }

        // 7. Verificar dias de check-in permitidos
        const diaSemanaCheckin = dataInicio.getDay(); // 0 = domingo, 1 = segunda, etc.
        
        for (const temporada of temporadas) {
            if (temporada.dias_checkin_permitidos && temporada.dias_checkin_permitidos.length > 0) {
                const diasPermitidos = temporada.dias_checkin_permitidos;
                const diasSemanaPermitidos = diasPermitidos.map(dia => {
                    const mapeamento = {
                        'domingo': 0, 'segunda': 1, 'terca': 2, 'quarta': 3,
                        'quinta': 4, 'sexta': 5, 'sabado': 6
                    };
                    return mapeamento[dia.toLowerCase()];
                });

                if (!diasSemanaPermitidos.includes(diaSemanaCheckin)) {
                    const diasPermitidosStr = diasPermitidos.join(', ');
                    erros.push(
                        `Check-in neste período só é permitido em: ${diasPermitidosStr}. ` +
                        `Data selecionada: ${this.obterNomeDiaSemana(diaSemanaCheckin)}`
                    );
                }
            }
        }

        // 8. Verificar capacidade
        if (dados.num_adultos && dados.num_adultos > chale.capacidade_adultos) {
            erros.push(
                `Capacidade excedida: máximo ${chale.capacidade_adultos} adultos. ` +
                `Solicitado: ${dados.num_adultos}`
            );
        }

        if (dados.num_criancas && dados.num_criancas > chale.capacidade_criancas) {
            erros.push(
                `Capacidade excedida: máximo ${chale.capacidade_criancas} crianças. ` +
                `Solicitado: ${dados.num_criancas}`
            );
        }

        return {
            valido: erros.length === 0,
            erros,
            avisos,
            num_diarias: numDiarias,
            diaria_minima: diariaMinimaRequerida
        };
    }

    /**
     * Verifica disponibilidade simples (para formulário)
     */
    static async verificarDisponibilidadeSimples(chaleId, dataCheckin, dataCheckout) {
        // Verificar bloqueios
        const bloqueado = await Bloqueio.verificarBloqueio(
            chaleId,
            dataCheckin,
            dataCheckout
        );

        if (bloqueado) {
            return { disponivel: false, motivo: 'bloqueado' };
        }

        // Verificar reservas
        const disponivel = await Chale.verificarDisponibilidade(
            chaleId,
            dataCheckin,
            dataCheckout
        );

        if (!disponivel) {
            return { disponivel: false, motivo: 'ocupado' };
        }

        // Verificar diária mínima
        const temporadas = await Temporada.buscarPorPeriodo(dataCheckin, dataCheckout);
        const dataInicio = new Date(dataCheckin);
        const dataFim = new Date(dataCheckout);
        const numDiarias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
        
        let diariaMinima = 1;
        for (const temporada of temporadas) {
            if (temporada.diaria_minima > diariaMinima) {
                diariaMinima = temporada.diaria_minima;
            }
        }

        if (numDiarias < diariaMinima) {
            return {
                disponivel: false,
                motivo: 'diaria_minima',
                diaria_minima: diariaMinima,
                diarias_solicitadas: numDiarias
            };
        }

        return { disponivel: true, num_diarias: numDiarias, diaria_minima: diariaMinima };
    }

    /**
     * Obter nome do dia da semana
     */
    static obterNomeDiaSemana(diaSemana) {
        const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
                     'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return dias[diaSemana];
    }

    /**
     * Calcular número de diárias entre duas datas
     */
    static calcularNumDiarias(dataCheckin, dataCheckout) {
        const inicio = new Date(dataCheckin);
        const fim = new Date(dataCheckout);
        return Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
    }
}

module.exports = DisponibilidadeService;

