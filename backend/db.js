// db.js
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.resolve(__dirname, 'banco.db')

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err.message)
  } else {
    console.log('Conectado ao banco SQLite')
    db.run('PRAGMA foreign_keys = ON')
  }
})

// Criar tabela básica se não existir
/*db.run(`
  CREATE TABLE IF NOT EXISTS receber (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT
  )
`)*/

module.exports = db
