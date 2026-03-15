const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../../..', process.env.DB_PATH || './database.sqlite');

console.log(`Conectando ao banco em: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err);
        process.exit(1);
    }
    console.log('✓ Conectado ao banco de dados SQLite');
});

// Ler e executar migrations
const migrationsDir = path.join(__dirname, 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

console.log(`\nEncontradas ${migrationFiles.length} migrations a executar`);

let currentMigration = 0;

const executeMigration = (index) => {
    if (index >= migrationFiles.length) {
        console.log('\n✓ Todas as migrations foram executadas com sucesso!');
        db.close((err) => {
            if (err) console.error(err);
            process.exit(0);
        });
        return;
    }

    const file = migrationFiles[index];
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`\nExecutando: ${file}`);

    db.exec(sql, (err) => {
        if (err) {
            console.error(`✗ Erro ao executar ${file}:`, err);
            process.exit(1);
        } else {
            console.log(`✓ ${file} executado com sucesso`);
            executeMigration(index + 1);
        }
    });
};

executeMigration(0);
