const express = require('express')
const router = express.Router()
const db = require('../db') // Ajuste conforme seu banco

router.get('/dividas', (req, res) => {
  const sql = `
    SELECT
      c.id,
      c.cpf,
      c.nome,
      c.limite,
      IFNULL(SUM(r.valor - COALESCE(r.valorpago, 0)), 0) AS divida_total
    FROM
      clientes c
    LEFT JOIN
      receber r ON c.id = r.cliente_id AND (r.status = 'ABERTO' OR r.status = 'ABONADO')
    GROUP BY
      c.id, c.nome
    HAVING
      divida_total > 0
  `

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})



module.exports = router
