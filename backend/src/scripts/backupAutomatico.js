/**
 * Script para executar backup automático
 * Deve ser executado via cron job
 * Exemplo: 0 2 * * * node src/scripts/backupAutomatico.js
 */

require('dotenv').config();
const BackupService = require('../services/backupService');

async function executarBackup() {
    try {
        console.log('Iniciando backup automático...');
        const backup = await BackupService.executarBackupAutomatico();
        console.log('Backup concluído:', backup);
        process.exit(0);
    } catch (erro) {
        console.error('Erro ao executar backup automático:', erro);
        process.exit(1);
    }
}

executarBackup();

