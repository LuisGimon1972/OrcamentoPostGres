export async function gerarRelatorioPeriodo(inicio, fim) {
  try {
    const regexData = /^\d{4}-\d{2}-\d{2}$/
    if (!regexData.test(inicio) || !regexData.test(fim)) {
      console.warn('Datas inválidas:', inicio, fim)
      return false
    }

    const url = `http://localhost:3000/orcamentos/fecha/periodo?inicio=${inicio}&fim=${fim}`
    const res = await fetch(url)

    if (!res.ok) {
      console.error('Erro na API:', res.status, res.statusText)
      return false
    }

    const dados = await res.json()

    if (!Array.isArray(dados) || dados.length === 0) {
      console.info('Nenhum orçamento encontrado no período.')
      return false
    }

    let conteudo = `
      <html>
      <head>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: Arial; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #777; padding: 8px; font-size: 11px; }
          th { background: #eee; }
        </style>
      </head>
      <body>
        <h1>Relatório de Orçamentos por Período</h1>
        <p><b>Período:</b> ${formatarDataBR(inicio)} até ${formatarDataBR(fim)}</p>
        <table>
          <tr>
            <th>ID</th>
            <th>Número</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Validade</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
    `

    dados.forEach((o) => {
      conteudo += `
        <tr>
          <td>${o.id}</td>
          <td>${o.numero}</td>
          <td>${o.clientenome || '-'}</td>
          <td>${formatarDataHoraBR(o.datacriacao)}</td>
          <td>${o.validade}</td>
          <td style="text-align: right;">R$ ${Number(o.valortotal).toFixed(2)}</td>
          <td>${o.status}</td>
        </tr>
      `
    })

    conteudo += `
        </table>
      </body>
      </html>
    `
    // Criar iframe invisível para impressão
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(conteudo)
    doc.close()

    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => iframe.remove(), 500)
    }, 300)

    return true
  } catch (err) {
    console.error('Erro ao gerar relatório:', err)
    return false
  }
}

export async function gerarRelatorioGeral() {
  try {
    const url = `http://localhost:3000/orcamentos`
    const res = await fetch(url)
    const dados = await res.json()

    if (!dados.length) {
      return false
    }
    let conteudo = `
      <html>
      <head>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: Arial; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #777; padding: 8px; font-size: 11px; }
          th { background: #eee; }
        </style>
      </head>
      <body>

        <h1>Relatório Geral de Orçamentos</h1>

        <table>
          <tr>
            <th>ID</th>
            <th>Número</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Validade</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
    `

    dados.forEach((o) => {
      conteudo += `
        <tr>
          <td>${o.id}</td>
          <td>${o.numero}</td>
          <td>${o.clientenome || '-'}</td>
          <td>${formatarDataHoraBR(o.datacriacao)}</td>
          <td>${o.validade}</td>
          <td style="text-align: right;">R$ ${Number(o.valortotal).toFixed(2)}</td>
          <td>${o.status}</td>
        </tr>
      `
    })

    conteudo += `
        </table>

      </body>
      </html>
    `

    // 👉 Criar iframe invisível
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'

    document.body.appendChild(iframe)

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(conteudo)
    doc.close()
    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => iframe.remove(), 500)
    }, 300)
    return true
  } catch (err) {
    console.error('Erro ao gerar relatório:', err)
    return false
  }
}

export async function gerarRelatorioStatus(status) {
  try {
    const url = `http://localhost:3000/orcamentos/status/${status}`
    const res = await fetch(url)
    const dados = await res.json()
    if (!dados.length) {
      return false
    }
    let conteudo = `
      <html>
      <head>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: Arial; margin: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #777; padding: 8px; font-size: 13px; }
          th { background: #eee; }
          .right { text-align: right; }
        </style>
      </head>
      <body>

        <h1>Relatório de Orçamentos por Status</h1>
        <p><b>Status:</b> ${status}</p>

        <table>
          <tr>
            <th>ID</th>
            <th>Número</th>
            <th>Cliente</th>
            <th>Cadastro</th>
            <th>Validade</th>
            <th>Total</th>
          </tr>
    `

    dados.forEach((o) => {
      conteudo += `
        <tr>
          <td>${o.id}</td>
          <td>${o.numero}</td>
          <td>${o.clientenome || '-'}</td>
          <td>${formatarDataHoraBR(o.datacriacao)}</td>
          <td>${o.validade}</td>
          <td class="right">R$ ${Number(o.valortotal).toFixed(2)}</td>
        </tr>
      `
    })

    conteudo += `
        </table>

      </body>
      </html>
    `
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.style.right = '0'
    iframe.style.bottom = '0'

    document.body.appendChild(iframe)

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(conteudo)
    doc.close()

    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => iframe.remove(), 500)
    }, 300)

    return true
  } catch (err) {
    console.error(err)
    return false
  }
}

function formatarDataHoraBR(valor) {
  if (!valor) return '-'

  const data = new Date(valor)

  if (isNaN(data)) return valor

  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  const hora = String(data.getHours()).padStart(2, '0')
  const min = String(data.getMinutes()).padStart(2, '0')
  return `${dia}/${mes}/${ano} ${hora}:${min}`
}

function formatarDataBR(dataISO) {
  const d = new Date(dataISO)
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const ano = String(d.getFullYear()).slice(0)

  return `${dia}/${mes}/${ano}`
}
