/**
 * Valida se uma data está no formato correto
 * @param {string} dataStr - Data no formato YYYY-MM-DD
 * @returns {boolean}
 */
const validarFormatoData = (dataStr) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dataStr)) return false;
    
    const data = new Date(dataStr);
    return data instanceof Date && !isNaN(data);
};

/**
 * Verifica se a data é no futuro
 * @param {string} dataStr - Data no formato YYYY-MM-DD
 * @returns {boolean}
 */
const dataNoFuturo = (dataStr) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(dataStr);
    return data >= hoje;
};

/**
 * Calcula o número de dias entre duas datas
 * @param {string} dataInicio - Data inicial no formato YYYY-MM-DD
 * @param {string} dataFim - Data final no formato YYYY-MM-DD
 * @returns {number}
 */
const calcularDiferencaDias = (dataInicio, dataFim) => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diferencaMs = fim - inicio;
    return Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
};

/**
 * Formata uma data para o padrão brasileiro
 * @param {string} dataStr - Data no formato YYYY-MM-DD
 * @returns {string} - Data no formato DD/MM/YYYY
 */
const formatarDataBR = (dataStr) => {
    const data = new Date(dataStr);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
};

module.exports = {
    validarFormatoData,
    dataNoFuturo,
    calcularDiferencaDias,
    formatarDataBR
};

