export async function imprimirOrcamentoPorId(id) {
  const dados = await buscarOrcamento(id)
  const texto = gerarTextoCupom(dados)
  imprimirTexto(texto)
}

export async function buscarOrcamento(id) {
  const res = await fetch(`http://localhost:3000/orcamentos-detalhe/${id}`)
  if (!res.ok) {
    throw new Error('Erro ao buscar orçamento')
  }
  return await res.json()
}

export function gerarTextoCupom(orc) {
  const numero = orc?.numero ?? '-'
  const cliente = orc?.clientenome ?? '-'
  const clientecpf = orc?.clientecpf ?? '-' 
  const data = formatarData(orc?.datacriacao, true)
  const validade = orc?.validade
  const status = orc?.status ?? '-'
  const itens = Array.isArray(orc?.itens)
    ? orc.itens
        .map((i) => {
          const desc = (i.descricao ?? '').padEnd(15).slice(0, 12)
          const qtd = String(i.quantidade ?? 0).padStart(3)
          const total = Number(i.total ?? 0).toFixed(2)
          return `${desc.padEnd(12)} ${String(qtd).padStart(3)}  R$ ${String(total).padStart(8)}`
        })
        .join('\n')
    : 'Nenhum item'

  const largura = 17
  const subtotal = Number(orc?.valortotalitens ?? 0)
    .toFixed(2)
    .padStart(largura)
  const desconto = Number(orc?.desconto ?? 0)
    .toFixed(2)
    .padStart(largura)
  const acrescimo = Number(orc?.acrescimo ?? 0)
    .toFixed(2)
    .padStart(largura)
  const total = Number(orc?.valortotal ?? 0)
    .toFixed(2)
    .padStart(largura)
  return `
================================
     ORÇAMENTO Nº ${numero}
================================
STATUS: ${status}
________________________________

CLIENTE : ${cliente}
CPF Nº  : ${clientecpf}
CADASTRO: ${data}
VALIDADE: ${validade}
================================
ITEM          QTD        TOTAL
================================
${itens}
________________________________
SUBTOTAL:   R$ ${subtotal}
DESCONTO:   R$ ${desconto}
ACRÉSCIMO:  R$ ${acrescimo}
TOTAL:      R$ ${total}
________________________________

   Obrigado pela preferência!
`
}

export function imprimirTexto(texto) {
  const w = window.open('', '_blank', 'width=700,height=600')
  w.document.write(`<pre style="font-size:14px">${texto}</pre>`)
  w.document.close()
  w.print()
  w.close()
}

function formatarData(valor, comHora = false) {
  if (!valor) return '-'

  let d = new Date(valor)

  // tenta converter DD/MM/YYYY ou DD/MM/YYYY HH:mm
  if (isNaN(d.getTime()) && typeof valor === 'string') {
    const [data, hora] = valor.split(' ')
    const [dia, mes, ano] = data.split('/')
    d = new Date(`${ano}-${mes}-${dia}${hora ? 'T' + hora : ''}`)
  }

  if (isNaN(d.getTime())) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(comHora && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }).format(d)
}
