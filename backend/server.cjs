// ==========================================
//  SERVER.CJS - API PostgreSQL
// ==========================================

// ==========================================
//  IMPORTS
// ==========================================
const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

// ==========================================
//  CONFIGURAÇÕES DO EXPRESS
// ==========================================
const app = express()
app.use(cors()) // permite requisições de qualquer origem
app.use(express.json()) // permite receber JSON no body

// ==========================================
//  CONEXÃO COM POSTGRES
// ==========================================
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'banco', // banco deve existir!
  password: '8451',
  port: 5432,
})

// ==========================================
//  FUNÇÃO PARA CARREGAR banco.sql
// ==========================================
async function carregarBanco() {
  try {
    const sqlPath = path.join(__dirname, 'banco.sql')
    console.log('📄 Lendo arquivo SQL:', sqlPath)

    if (!fs.existsSync(sqlPath)) {
      console.warn('⚠️ banco.sql não encontrado, pulando execução...')
      return
    }

    const sql = fs.readFileSync(sqlPath, 'utf8')
    console.log('⏳ Executando banco.sql...')
    await pool.query(sql)
    console.log('✔️ banco.sql executado com sucesso!')
  } catch (err) {
    console.error('❌ Erro ao executar banco.sql\n', err)
  }
}

// ==========================================
//  ROTAS
// ==========================================
// ROTA PRINCIPAL
// ==========================
// ROTAS CLIENTES
// ==========================

// Listar clientes
app.get('/clientes', async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clientes ORDER BY id DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Criar cliente
app.post('/clientes', async (req, res) => {
  const { cpf, nome, fantasia, endereco, cep, bairro, email, telefone, celular, limite } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO clientes (cpf, nome, fantasia, endereco, cep, bairro, email, telefone, celular, limite)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [cpf, nome, fantasia, endereco, cep, bairro, email, telefone, celular, limite],
    )
    res.json({ id: result.rows[0].id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Atualizar cliente
app.put('/clientes/:id', async (req, res) => {
  const { id } = req.params
  const { cpf, nome, fantasia, endereco, cep, bairro, email, telefone, celular, limite } = req.body
  try {
    await pool.query(
      `UPDATE clientes
       SET cpf=$1, nome=$2, fantasia=$3, endereco=$4, cep=$5, bairro=$6,
           email=$7, telefone=$8, celular=$9, limite=$10
       WHERE id=$11`,
      [cpf, nome, fantasia, endereco, cep, bairro, email, telefone, celular, limite, id],
    )
    res.sendStatus(200)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Deletar cliente
app.delete('/clientes/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM clientes WHERE id=$1', [id])
    res.sendStatus(200)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ==========================
// ROTAS ITENS
// ==========================

// Listar itens
app.get('/itens', async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM itens ORDER BY controle DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Criar item
app.post('/itens', async (req, res) => {
  const {
    codbarras,
    nome,
    descricao,
    grupo,
    marca,
    quantidade,
    precocusto,
    perlucro,
    precovenda,
    revenda,
  } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO itens
       (codbarras, nome, descricao, grupo, marca, quantidade, precocusto, perlucro, precovenda, revenda)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING controle`,
      [
        codbarras,
        nome,
        descricao,
        grupo,
        marca,
        quantidade,
        precocusto,
        perlucro,
        precovenda,
        revenda,
      ],
    )
    res.json({ controle: result.rows[0].controle })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Atualizar item
app.put('/itens/:controle', async (req, res) => {
  const { controle } = req.params
  const {
    codbarras,
    nome,
    descricao,
    grupo,
    marca,
    quantidade,
    precocusto,
    perlucro,
    precovenda,
    revenda,
  } = req.body
  try {
    await pool.query(
      `UPDATE itens
       SET codbarras=$1, nome=$2, descricao=$3, grupo=$4, marca=$5,
           quantidade=$6, precocusto=$7, perlucro=$8, precovenda=$9, revenda=$10
       WHERE controle=$11`,
      [
        codbarras,
        nome,
        descricao,
        grupo,
        marca,
        quantidade,
        precocusto,
        perlucro,
        precovenda,
        revenda,
        controle,
      ],
    )
    res.sendStatus(200)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Deletar item
app.delete('/itens/:controle', async (req, res) => {
  const { controle } = req.params
  try {
    await pool.query('DELETE FROM itens WHERE controle=$1', [controle])
    res.sendStatus(200)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Buscar item por código
app.get('/itens/buscar-codigo/:codigo', async (req, res) => {
  const { codigo } = req.params
  try {
    const { rows } = await pool.query('SELECT * FROM itens WHERE codbarras=$1', [codigo])
    res.json(rows[0] || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Buscar itens por texto (nome ou código)
app.get('/itens/busca/buscar', async (req, res) => {
  const texto = req.query.texto?.trim() || ''

  if (texto === '') return res.json([])

  const like = `%${texto}%`

  try {
    const query = `
      SELECT
        controle,
        nome,
        codbarras,
        precovenda::numeric AS precovenda,
        quantidade::numeric AS quantidade
      FROM itens
      WHERE nome ILIKE $1
         OR CAST(codbarras AS TEXT) ILIKE $1
         OR CAST(controle AS TEXT) ILIKE $1
      ORDER BY nome ASC
      LIMIT 50
    `

    const { rows } = await pool.query(query, [like])

    // Converte para número antes de enviar
    const resposta = rows.map((r) => ({
      ...r,
      precovenda: Number(r.precovenda),
      quantidade: Number(r.quantidade),
    }))

    res.json(resposta)
  } catch (err) {
    console.error('🔴 ERRO NA ROTA /itens/busca/buscar:', err)
    res.status(500).json({ error: err.message })
  }
})

// ==========================
// ROTAS ORÇAMENTOS
// ==========================

app.post('/orcamentos', async (req, res) => {
  const {
    clienteId,
    itens,
    desconto,
    acrescimo,
    valorTotalItens,
    valorTotal,
    validade,
    observacoes,
    condicao,
    status,
  } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: lastRow } = await client.query(
      `SELECT numero FROM orcamentos ORDER BY id DESC LIMIT 1`,
    )
    let novoNumero = 'ORC0001'
    if (lastRow[0]?.numero) {
      const numAtual = parseInt(lastRow[0].numero.replace('ORC', ''))
      novoNumero = 'ORC' + String(numAtual + 1).padStart(4, '0')
    }

    const orcamentoResult = await client.query(
      `INSERT INTO orcamentos
       (numero, clienteId, validade, observacoes, condicao, desconto, acrescimo, valorTotalItens, valorTotal, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [
        novoNumero,
        clienteId,
        validade || null,
        observacoes || null,
        condicao || null,
        desconto || 0,
        acrescimo || 0,
        valorTotalItens || 0,
        valorTotal || 0,
        status || null,
      ],
    )
    const orcamentoId = orcamentoResult.rows[0].id

    for (const item of itens) {
      const unit = Number(item.precoUnit || item.valorUnit || 0)
      const total = Number(item.total || unit * item.quantidade)
      await client.query(
        `INSERT INTO itensOrcamento (orcamentoId, produtoId, descricao, quantidade, valorUnit, total, tipoItem)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          orcamentoId,
          item.controle || null,
          item.nome || item.descricao || '',
          item.quantidade,
          unit,
          total,
          item.tipoItem || 'PRODUTO',
        ],
      )
    }

    await client.query('COMMIT')
    res.json({
      sucesso: true,
      mensagem: 'Orçamento criado com sucesso',
      orcamentoId,
      numero: novoNumero,
    })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// ==========================
// ITENS DO ORÇAMENTO - PostgreSQL
// ==========================

// Listar itens de um orçamento
app.get('/orcamentos/:id/itens', async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      'SELECT * FROM itensOrcamento WHERE orcamentoId = $1 ORDER BY id ASC',
      [id],
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/orcamentos', async (req, res) => {
  try {
    const sql = `
      SELECT
        o.*,
        c.nome AS clientenome
      FROM orcamentos o
      LEFT JOIN clientes c ON c.id = o.clienteid
      ORDER BY o.id DESC
    `

    const { rows } = await pool.query(sql)
    res.json(rows)
  } catch (err) {
    console.error('ERRO NA ROTA /orcamentos:', err)
    res.status(500).json({
      error: 'Erro ao buscar orçamentos',
      details: err.message,
    })
  }
})

app.get('/orcamentos/:id', async (req, res) => {
  const { id } = req.params

  try {
    // Buscar o orçamento
    const orcamentoQuery = `
      SELECT *
      FROM orcamentos
      WHERE id = $1
    `
    const { rows: orcamentoRows } = await pool.query(orcamentoQuery, [id])

    if (orcamentoRows.length === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado' })
    }

    const orcamento = orcamentoRows[0]

    // Buscar os itens
    const itensQuery = `
      SELECT *
      FROM itensOrcamento
      WHERE orcamentoId = $1
    `
    const { rows: itens } = await pool.query(itensQuery, [id])

    // Retorna orçamento + itens igual ao SQLite
    res.json({
      ...orcamento,
      itens,
    })
  } catch (err) {
    console.error('Erro ao buscar orçamento:', err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/orcamentos-detalhe/:id', async (req, res) => {
  const { id } = req.params

  try {
    // Buscar dados do orçamento + cliente
    const sqlOrcamento = `
      SELECT
        o.*,
        c.nome AS clienteNome,
        c.cpf AS clienteCPF,
        c.endereco AS clienteEndereco,
        c.telefone AS clienteTelefone,
        c.celular AS clienteCelular,
        c.email AS clienteEmail
      FROM orcamentos o
      LEFT JOIN clientes c ON c.id = o.clienteId
      WHERE o.id = $1
    `

    const orcamentoResult = await pool.query(sqlOrcamento, [id])

    if (orcamentoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado' })
    }

    const orcamento = orcamentoResult.rows[0]

    // Buscar itens
    const itensResult = await pool.query(`SELECT * FROM itensorcamento WHERE orcamentoid = $1`, [
      id,
    ])

    res.json({
      ...orcamento,
      itens: itensResult.rows,
    })
  } catch (err) {
    console.error('ERRO GET /orcamentos-detalhe:', err)
    res.status(500).json({ error: err.message })
  }
})
//Cmente fdsflksdlfkdslçfk
// Atualizar item de orçamento
app.put('/itensOrcamento/:itemId', async (req, res) => {
  const { itemId } = req.params
  const { descricao, quantidade, valorunit, tipoItem } = req.body
  const total = quantidade * valorunit

  try {
    const result = await pool.query(
      `UPDATE itensOrcamento
       SET descricao=$1, quantidade=$2, valorUnit=$3, total=$4, tipoItem=$5
       WHERE id=$6`,
      [descricao, quantidade, valorunit, total, tipoItem, itemId],
    )
    res.json({ updated: result.rowCount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/orcamentos/:id', async (req, res) => {
  const client = await pool.connect()
  const orcamentoId = req.params.id

  const { clienteId, itens, desconto, acrescimo, validade, observacoes, condicao, status } =
    req.body

  try {
    // Recalcular totais
    let somaItens = 0

    itens.forEach((item) => {
      const unit = Number(item.precoUnit || item.valorUnit || 0)
      const qt = Number(item.quantidade)
      somaItens += qt * unit
    })

    const valorTotalFinal = somaItens - (Number(desconto) || 0) + (Number(acrescimo) || 0)

    await client.query('BEGIN')

    // Atualizar orçamento
    const sqlUpdate = `
      UPDATE orcamentos
      SET clienteId = $1,
          validade = $2,
          observacoes = $3,
          condicao = $4,
          desconto = $5,
          acrescimo = $6,
          valorTotalItens = $7,
          valorTotal = $8,
          status = $9
      WHERE id = $10
    `

    await client.query(sqlUpdate, [
      clienteId,
      validade || null,
      observacoes || null,
      condicao || null,
      desconto || 0,
      acrescimo || 0,
      somaItens,
      valorTotalFinal,
      status,
      orcamentoId,
    ])

    // Apagar itens antigos
    await client.query(`DELETE FROM itensorcamento WHERE orcamentoid = $1`, [orcamentoId])

    // Inserir novos itens
    const sqlItem = `
      INSERT INTO itensorcamento
      (orcamentoId, produtoId, descricao, quantidade, valorUnit, total, tipoItem)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `

    for (const item of itens) {
      const unit = Number(item.precoUnit || item.valorUnit || 0)
      const qt = Number(item.quantidade)
      const total = qt * unit

      await client.query(sqlItem, [
        orcamentoId,
        item.controle || null,
        item.nome || item.descricao || '',
        qt,
        unit,
        total,
        item.tipoItem || 'PRODUTO',
      ])
    }

    await client.query('COMMIT')

    res.json({
      sucesso: true,
      mensagem: 'Orçamento atualizado com sucesso',
      orcamentoId,
      valorTotalFinal,
      somaItens,
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('ERRO PUT /orcamentos:', err)
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// Deletar item de orçamento
app.delete('/itensOrcamento/:itemId', async (req, res) => {
  const { itemId } = req.params
  try {
    const result = await pool.query('DELETE FROM itensOrcamento WHERE id=$1', [itemId])
    res.json({ deleted: result.rowCount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// As demais rotas de GET, PUT, DELETE de orçamentos e itensOrcamento seguem a mesma lógica usando async/await e pool.query com $1,$2...

//app.listen(3000, () => console.log('Servidor rodando na porta 3000'))

// ==========================================
//  INICIAR SERVIDOR
// ==========================================
const PORT = 3000
app.listen(PORT, async () => {
  console.log(`🚀 Servidor iniciado em http://localhost:${PORT}`)
  await carregarBanco() // roda banco.sql se existir
})
