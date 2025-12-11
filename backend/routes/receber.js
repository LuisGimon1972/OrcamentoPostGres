const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res) => {
  const query = `
    SELECT
      r.*,
      c.cpf AS cliente_cpf,
      c.nome AS cliente_nome
    FROM
      receber r
    JOIN
      clientes c ON c.id = r.cliente_id
    ORDER BY
      c.nome
  `

  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})


const { promisify } = require('util')
const dbGet = promisify(db.get).bind(db)
const dbRun = promisify(db.run).bind(db)

router.post('/', async (req, res) => {
  const {
    cliente_id,
    descricao,
    valor,
    valorpago = 0,
    valorpendente,
    datavencimento,
    datapagamento,
    datacadastro,
    formapagamento,
    observacao,
    usuario,
    referencia,
    numero_documento,
    juros = 0,
    desconto = 0,
  } = req.body

  try {
    // Definindo valororiginal sempre igual ao valor informado
    const valororiginal = parseFloat(valor)

    // 1. Buscar limite do cliente
    const cliente = await dbGet('SELECT limite FROM clientes WHERE id = ?', [cliente_id])
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado.' })
    }

    // 2. Calcular dívida atual do cliente
    const resultado = await dbGet(
      `SELECT SUM(valor - COALESCE(valorpago, 0)) AS dividaAtual
       FROM receber
       WHERE cliente_id = ? AND (valorpago IS NULL OR valor > valorpago)`,
      [cliente_id],
    )

    const dividaAtual = resultado?.dividaAtual || 0
    const valorTentado = valororiginal
    const limite = parseFloat(cliente.limite)

    // 3. Validar limite
    if (dividaAtual + valorTentado > limite) {
      return res.status(403).json({
        message: 'Limite excedido.',
        dividaAtual,
        limite,
        valorTentado,
      })
    }

    // 4. Inserir novo registro em receber (status fixo: 'ABERTO')
    const query = `
      INSERT INTO receber (
        cliente_id, descricao, valororiginal, valor, valorpago, valorpendente,
        datavencimento, datapagamento, datacadastro, status,
        formapagamento, observacao, usuario, referencia,
        numero_documento, juros, desconto
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ABERTO', ?, ?, ?, ?, ?, ?, ?)
    `
    await dbRun(query, [
      cliente_id,
      descricao,
      valororiginal,
      valor,
      valorpago,
      valorpendente,
      datavencimento,
      datapagamento,
      datacadastro,
      formapagamento,
      observacao,
      usuario,
      referencia,
      numero_documento,
      juros,
      desconto,
    ])

    res.status(201).json({ message: 'Conta salva com sucesso.' })
  } catch (err) {
    console.error('Erro ao salvar receber:', err)
    res.status(500).json({ message: 'Erro interno do servidor.' })
  }
})



module.exports = router

// Atualizar um registro
router.put('/:id', (req, res) => {
  const id = req.params.id
  const {
    cliente_id,
    descricao,
    valororiginal,
    valor,
    valorpago,
    valorpendente,
    datavencimento,
    datapagamento,
    datacadastro,
    status,
    formapagamento,
    observacao,
    usuario,
    referencia,
    numero_documento,
    juros,
    desconto,
  } = req.body

  const query = `
    UPDATE receber SET
      cliente_id = ?, descricao = ?, , valooriginal = ?, valor = ?, valorpago = ?, valorpendente = ?,
      datavencimento = ?, datapagamento = ?, datacadastro = ?, status = ?,
      formapagamento = ?, observacao = ?, usuario = ?, referencia = ?,
      numero_documento = ?, juros = ?, desconto = ?
    WHERE id = ?
  `

  db.run(
    query,
    [
      cliente_id,
      descricao,
      valororiginal,
      valor,
      valorpago,
      valorpendente,
      datavencimento,
      datapagamento,
      datacadastro,
      status,
      formapagamento,
      observacao,
      usuario,
      referencia,
      numero_documento,
      juros,
      desconto,
      id,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ message: 'Registro atualizado com sucesso' })
    },
  )
})

// Deletar um registro
router.delete('/:id', (req, res) => {
  const id = req.params.id
  db.run('DELETE FROM receber WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Registro excluído com sucesso' })
  })
})

router.put('/:cliente_id/pagar-todas', (req, res) => {
  const clienteId = req.params.cliente_id

  const sql = `
    UPDATE receber
    SET
      valor = 0,                          -- zera a dívida
      valorpendente = 0,                 -- zera o que ainda falta pagar
      datapagamento = DATE('now'),       -- registra a data de pagamento
      status = 'PAGO'                    -- marca como pago
    WHERE cliente_id = ?
      AND status IN ('ABERTO', 'ABONADO')  -- inclui dívidas parcialmente abonadas
      AND valor > 0
  `

  db.run(sql, [clienteId], function (err) {
    if (err) {
      console.error('Erro ao pagar dívidas:', err.message)
      return res.status(500).json({ error: 'Erro ao pagar dívidas do cliente.' })
    }

    res.json({
      message: 'Pagamentos registrados com sucesso.',
      linhasAfetadas: this.changes,
    })
  })
})





router.put('/:cliente_id/abonar', (req, res) => {
  const clienteId = req.params.cliente_id
  const { valorAbono } = req.body

  if (!valorAbono || valorAbono <= 0) {
    return res.status(400).json({ error: 'Valor de abono inválido.' })
  }

  const selectSql = `
    SELECT id, valor
FROM receber
WHERE cliente_id = ?
  AND status IN ('ABERTO', 'ABONADO')
  AND valor > 0
ORDER BY id
  `

  db.all(selectSql, [clienteId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao consultar dívidas.' })

    let restante = valorAbono
    const updates = []

    for (const row of rows) {
      if (restante <= 0) break

      const abater = Math.min(row.valor, restante)
      restante -= abater

      const novoValor = row.valor - abater
      const novoStatus = novoValor === 0 ? 'PAGO' : 'ABONADO'

      updates.push({
        id: row.id,
        novoValor,
        novoStatus
      })
    }

    if (updates.length === 0) {
      return res.json({ message: 'Nada a abonar.' })
    }

    const updateOne = (item, cb) => {
      db.run(
        `
        UPDATE receber
        SET valor = ?, status = ?
        WHERE id = ?
        `,
        [item.novoValor, item.novoStatus, item.id],
        cb
      )
    }

    let feitas = 0
    updates.forEach((item) => {
      updateOne(item, (err) => {
        if (err) {
          console.error('Erro ao atualizar item:', err.message)
          return res.status(500).json({ error: 'Erro ao aplicar abono.' })
        }

        feitas++
        if (feitas === updates.length) {
          res.json({ message: `Abono de R$${valorAbono.toFixed(2)} aplicado com sucesso.` })
        }
      })
    })
  })
})



module.exports = router
