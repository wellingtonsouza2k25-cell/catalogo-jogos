const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'jogos.db'));
db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS jogos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        plataforma TEXT NOT NULL,
        genero TEXT,
        anoLancamento INTEGER NOT NULL
    )
`);

module.exports = db;