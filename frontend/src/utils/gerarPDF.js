import jsPDF from 'jspdf'

function formatarData(d) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')
}

function formatarDataHoje() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function gerarPDFExecucao({ apenado, execucao, remicoes = [] }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margem = 20
  let y = 0

  // Cores
  const dourado = [201, 169, 110]
  const escuro = [15, 25, 35]
  const cinza = [100, 110, 120]
  const cinzaClaro = [220, 225, 230]
  const branco = [255, 255, 255]

  // ─── CABEÇALHO ───────────────────────────────────────
  doc.setFillColor(...escuro)
  doc.rect(0, 0, W, 40, 'F')

  // Linha dourada topo
  doc.setFillColor(...dourado)
  doc.rect(0, 0, W, 1.5, 'F')

  // Título
  doc.setTextColor(...dourado)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('CalPEC', margem, 16)

  doc.setTextColor(...cinzaClaro)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('SISTEMA ELETRÔNICO PARA CÁLCULO DO PROCESSO DE EXECUÇÃO CRIMINAL', margem, 22)

  doc.setTextColor(...cinzaClaro)
  doc.setFontSize(7)
  doc.text(`Gerado em: ${formatarDataHoje()}`, margem, 28)

  // Linha separadora dourada
  doc.setFillColor(...dourado)
  doc.rect(0, 38, W, 0.5, 'F')

  y = 50

  // ─── DADOS DO APENADO ────────────────────────────────
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(margem, y, W - margem * 2, 28, 3, 3, 'F')

  doc.setTextColor(...dourado)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('DADOS DO APENADO', margem + 5, y + 7)

  doc.setTextColor(...escuro)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(apenado.nome, margem + 5, y + 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...cinza)
  doc.text(`Nº Execução: ${apenado.numero_execucao}`, margem + 5, y + 20)
  doc.text(`Data de Nascimento: ${formatarData(apenado.data_nascimento)}`, margem + 80, y + 20)

  y += 35

  // ─── DADOS DA PENA ───────────────────────────────────
  doc.setTextColor(...dourado)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('DADOS DA PENA', margem, y)
  doc.setFillColor(...dourado)
  doc.rect(margem, y + 2, W - margem * 2, 0.3, 'F')
  y += 8

  const col1 = margem
  const col2 = margem + 60
  const col3 = margem + 120

  const addLinha = (label, valor, cx, cy) => {
    doc.setTextColor(...cinza)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(label, cx, cy)
    doc.setTextColor(...escuro)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(String(valor), cx, cy + 5)
  }

  addLinha('PENA TOTAL', `${execucao.pena_anos}A ${execucao.pena_meses}M ${execucao.pena_dias}D`, col1, y)
  addLinha('NATUREZA DO CRIME', execucao.natureza_crime, col2, y)
  addLinha('CONDIÇÃO', execucao.reincidente ? 'Reincidente' : 'Primário', col3, y)
  y += 14

  addLinha('INÍCIO DA PENA', formatarData(execucao.data_inicio_pena), col1, y)
  addLinha('TÉRMINO DA PENA', formatarData(execucao.data_termino), col2, y)
  addLinha('PENA TOTAL (dias)', `${execucao.pena_total_dias} dias`, col3, y)
  y += 20

  // ─── DETRAÇÃO ────────────────────────────────────────
  if (execucao.detracao_inicio && execucao.detracao_fim) {
    doc.setTextColor(...dourado)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('DETRAÇÃO', margem, y)
    doc.setFillColor(...dourado)
    doc.rect(margem, y + 2, W - margem * 2, 0.3, 'F')
    y += 8

    addLinha('INÍCIO DA DETRAÇÃO', formatarData(execucao.detracao_inicio), col1, y)
    addLinha('FIM DA DETRAÇÃO', formatarData(execucao.detracao_fim), col2, y)
    y += 20
  }

  // ─── PROGRESSÃO DE REGIME ────────────────────────────
  doc.setTextColor(...dourado)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('PROGRESSÃO DE REGIME', margem, y)
  doc.setFillColor(...dourado)
  doc.rect(margem, y + 2, W - margem * 2, 0.3, 'F')
  y += 8

  addLinha('REGIME ATUAL', execucao.regime_progressao || 'Fechado', col1, y)
  addLinha('DATA DE PROGRESSÃO', formatarData(execucao.data_progressao), col2, y)
  addLinha('DIAS REMIDOS', `${execucao.dias_remidos ?? 0} dias`, col3, y)
  y += 20

  // ─── ETAPAS VISUAIS ──────────────────────────────────
  const etapas = ['Fechado', 'Semiaberto', 'Aberto', 'Livramento', 'Extinta']
  const regimeAtual = execucao.regime_progressao || 'Fechado'
  const etapaAtual = etapas.findIndex(e => regimeAtual.includes(e.split(' ')[0]))
  const etapaW = (W - margem * 2) / etapas.length

  etapas.forEach((etapa, i) => {
    const cx = margem + etapaW * i + etapaW / 2
    const feita = i < etapaAtual
    const atual = i === etapaAtual

    if (feita || atual) {
      doc.setFillColor(...dourado)
    } else {
      doc.setFillColor(...cinzaClaro)
    }
    doc.circle(cx, y + 3, 3, 'F')

    if (i < etapas.length - 1) {
      doc.setFillColor(feita ? dourado[0] : cinzaClaro[0], feita ? dourado[1] : cinzaClaro[1], feita ? dourado[2] : cinzaClaro[2])
      doc.rect(cx + 3, y + 2.5, etapaW - 6, 1, 'F')
    }

    doc.setTextColor(atual ? dourado[0] : cinza[0], atual ? dourado[1] : cinza[1], atual ? dourado[2] : cinza[2])
    doc.setFontSize(6.5)
    doc.setFont('helvetica', atual ? 'bold' : 'normal')
    doc.text(etapa, cx, y + 10, { align: 'center' })
  })

  y += 20

  // ─── REMIÇÕES ────────────────────────────────────────
  if (remicoes.length > 0) {
    doc.setTextColor(...dourado)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('HISTÓRICO DE REMIÇÕES', margem, y)
    doc.setFillColor(...dourado)
    doc.rect(margem, y + 2, W - margem * 2, 0.3, 'F')
    y += 8

    // Cabeçalho da tabela
    doc.setFillColor(240, 242, 245)
    doc.rect(margem, y, W - margem * 2, 7, 'F')
    doc.setTextColor(...cinza)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('TIPO', margem + 3, y + 5)
    doc.text('QUANTIDADE', margem + 35, y + 5)
    doc.text('DIAS REMIDOS', margem + 80, y + 5)
    doc.text('DATA', margem + 120, y + 5)
    doc.text('OBSERVAÇÃO', margem + 148, y + 5)
    y += 7

    remicoes.forEach((r, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(250, 251, 252)
        doc.rect(margem, y, W - margem * 2, 6, 'F')
      }
      doc.setTextColor(...escuro)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.text(r.tipo, margem + 3, y + 4.5)
      doc.text(String(r.quantidade), margem + 35, y + 4.5)
      doc.setTextColor(...dourado)
      doc.setFont('helvetica', 'bold')
      doc.text(`-${r.dias_remidos}d`, margem + 80, y + 4.5)
      doc.setTextColor(...escuro)
      doc.setFont('helvetica', 'normal')
      doc.text(formatarData(r.data_referencia), margem + 120, y + 4.5)
      doc.text(r.observacao || '—', margem + 148, y + 4.5)
      y += 6
    })

    // Total
    y += 2
    doc.setFillColor(...escuro)
    doc.rect(margem, y, W - margem * 2, 8, 'F')
    doc.setTextColor(...branco)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL DE DIAS REMIDOS', margem + 3, y + 5.5)
    doc.setTextColor(...dourado)
    doc.text(`${execucao.dias_remidos ?? 0} dias`, margem + 120, y + 5.5)
    y += 14
  }

  // ─── RODAPÉ ──────────────────────────────────────────
  const alturaRodape = 297 - 18
  doc.setFillColor(...escuro)
  doc.rect(0, alturaRodape, W, 18, 'F')
  doc.setFillColor(...dourado)
  doc.rect(0, alturaRodape, W, 0.5, 'F')
  doc.setTextColor(...cinzaClaro)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('CalPEC — Sistema Eletrônico para Cálculo do Processo de Execução Criminal', W / 2, alturaRodape + 7, { align: 'center' })
  doc.text('Conforme Lei de Execução Penal (LEP — Lei nº 7.210/1984) e Pacote Anticrime (Lei nº 13.964/2019)', W / 2, alturaRodape + 12, { align: 'center' })

  // ─── SALVAR ──────────────────────────────────────────
  const nomeArquivo = `CalPEC_${apenado.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nomeArquivo)
}
