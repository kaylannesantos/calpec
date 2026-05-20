import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { gerarPDFExecucao } from '../utils/gerarPDF'
import styles from './ExecucoesPage.module.css'

const ETAPAS = ['Fechado', 'Semiaberto', 'Aberto', 'Livramento', 'Extinta']

function getEtapaIndex(regime) {
  if (!regime) return 0
  if (regime.includes('Semiaberto')) return 1
  if (regime.includes('Aberto')) return 2
  if (regime.includes('Livramento')) return 3
  if (regime.includes('Extinta')) return 4
  return 0
}

function calcularProgresso(execucao) {
  if (!execucao.data_inicio_pena || !execucao.pena_total_dias) return 0
  const inicio = new Date(execucao.data_inicio_pena + 'T12:00:00')
  const hoje = new Date()
  const diasCumpridos = Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24))
  const diasEfetivos = diasCumpridos + (execucao.dias_remidos || 0)
  return Math.min(100, Math.round((diasEfetivos / execucao.pena_total_dias) * 100))
}

function calcularDiasFaltantes(dataProgressao) {
  if (!dataProgressao) return null
  const hoje = new Date()
  const prog = new Date(dataProgressao + 'T12:00:00')
  return Math.ceil((prog - hoje) / (1000 * 60 * 60 * 24))
}

function CardRemicao({ execucaoId, onRemicaoAdicionada }) {
  const [aberto, setAberto] = useState(false)
  const [historico, setHistorico] = useState([])
  const [form, setForm] = useState({ tipo: 'trabalho', quantidade: '', data_referencia: '', observacao: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const labels = { trabalho: 'Dias trabalhados', estudo: 'Horas de estudo', leitura: 'Obras lidas' }
  const calcPrevia = {
    trabalho: Math.floor((parseInt(form.quantidade) || 0) / 3),
    estudo: Math.floor((parseInt(form.quantidade) || 0) / 12),
    leitura: (parseInt(form.quantidade) || 0) * 4,
  }

  const carregarHistorico = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/remicoes/execucao/${execucaoId}`)
      setHistorico(await res.json())
    } catch {}
  }

  const handleAbrir = () => {
    if (!aberto) carregarHistorico()
    setAberto(!aberto)
    setErro(''); setSucesso('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(''); setSucesso(''); setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/remicoes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, execucao_id: execucaoId, quantidade: parseInt(form.quantidade) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao registrar')
      setSucesso(`${data.dias_remidos} dia(s) remido(s) com sucesso!`)
      setForm({ tipo: 'trabalho', quantidade: '', data_referencia: '', observacao: '' })
      carregarHistorico()
      onRemicaoAdicionada()
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-'

  return (
    <div className={styles.remicaoWrap}>
      <button className={styles.btnRemicao} onClick={handleAbrir} type="button">
        {aberto ? '▲ Fechar' : '+ Registrar Remição'}
      </button>

      {aberto && (
        <div className={styles.remicaoBox}>
          <form onSubmit={handleSubmit} className={styles.remicaoForm}>
            <p className={styles.remicaoTitulo}>Nova remição</p>
            <div className={styles.remicaoGrid}>
              <div className={styles.remicaoField}>
                <label className={styles.remicaoLabel}>Tipo</label>
                <select className={styles.remicaoInput} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                  <option value="trabalho">Trabalho</option>
                  <option value="estudo">Estudo</option>
                  <option value="leitura">Leitura</option>
                </select>
              </div>
              <div className={styles.remicaoField}>
                <label className={styles.remicaoLabel}>{labels[form.tipo]}</label>
                <input className={styles.remicaoInput} type="number" min="1" value={form.quantidade}
                  onChange={e => setForm({ ...form, quantidade: e.target.value })} required />
              </div>
              <div className={styles.remicaoField}>
                <label className={styles.remicaoLabel}>Data de referência</label>
                <input className={styles.remicaoInput} type="date" value={form.data_referencia}
                  onChange={e => setForm({ ...form, data_referencia: e.target.value })} required />
              </div>
            </div>
            <div className={styles.remicaoField}>
              <label className={styles.remicaoLabel}>Observação (opcional)</label>
              <input className={styles.remicaoInput} type="text" placeholder="Ex: Trabalho na oficina"
                value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })} />
            </div>
            {form.quantidade && (
              <div className={styles.previa}>
                Prévia: <strong>{calcPrevia[form.tipo]} dia(s)</strong> serão remidos
              </div>
            )}
            {erro && <p className={styles.remicaoErro}>{erro}</p>}
            {sucesso && <p className={styles.remicaoSucesso}>{sucesso}</p>}
            <button className={styles.btnSalvar} type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar remição'}
            </button>
          </form>

          {historico.length > 0 && (
            <div className={styles.historico}>
              <p className={styles.historicoTitulo}>Histórico de remições</p>
              {historico.map(r => (
                <div key={r.id} className={styles.historicoItem}>
                  <div className={styles.historicoInfo}>
                    <span className={`${styles.historicoBadge} ${styles[`badge_${r.tipo}`]}`}>{r.tipo}</span>
                    <span className={styles.historicoDetalhe}>{r.quantidade} {r.tipo === 'trabalho' ? 'dias' : r.tipo === 'estudo' ? 'horas' : 'obras'}</span>
                    {r.observacao && <span className={styles.historicoObs}>{r.observacao}</span>}
                  </div>
                  <div className={styles.historicoRight}>
                    <span className={styles.historicoDias}>−{r.dias_remidos}d</span>
                    <span className={styles.historicoData}>{formatarData(r.data_referencia)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ExecucoesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const apenadoId = searchParams.get('apenado_id')
  const apenadoNome = searchParams.get('nome')

  const [execucoes, setExecucoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState(apenadoId || '')
  const [apenados, setApenados] = useState([])
  const [gerandoPDF, setGerandoPDF] = useState(null)

  const formatarData = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-'

  const carregar = async () => {
    setCarregando(true)
    try {
      const [resExec, resApen] = await Promise.all([
        fetch('http://localhost:8000/api/v1/execucoes/'),
        fetch('http://localhost:8000/api/v1/apenados/'),
      ])
      setExecucoes(await resExec.json())
      setApenados(await resApen.json())
    } catch {}
    finally { setCarregando(false) }
  }

  useEffect(() => { carregar() }, [])

  const execucoesFiltradas = filtro
    ? execucoes.filter(e => String(e.apenado_id) === String(filtro))
    : execucoes

  const getNomeApenado = (id) => apenados.find(a => a.id === id) || null

  const handleGerarPDF = async (execucao) => {
    setGerandoPDF(execucao.id)
    try {
      const apenado = getNomeApenado(execucao.apenado_id)
      if (!apenado) return

      const resRemicoes = await fetch(`http://localhost:8000/api/v1/remicoes/execucao/${execucao.id}`)
      const remicoes = await resRemicoes.json()

      gerarPDFExecucao({ apenado, execucao, remicoes })
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setGerandoPDF(null)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.bgPattern} />
      <Navbar showLinks />
      <div className={styles.body}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>{apenadoNome ? `Execuções — ${apenadoNome}` : 'Todas as Execuções'}</h1>
              <p className={styles.subtitle}>{execucoesFiltradas.length} registro(s)</p>
            </div>
            <div className={styles.acoes}>
              {filtro && <button className={styles.btnSecundario} onClick={() => { setFiltro(''); navigate('/execucoes') }}>Ver todas</button>}
              <button className={styles.btnPrimario} onClick={() => navigate('/execucao')}>+ Nova execução</button>
            </div>
          </div>

          {apenados.length > 0 && (
            <div className={styles.filtroBar}>
              <label className={styles.filtroLabel}>Filtrar por apenado:</label>
              <select className={styles.filtroSelect} value={filtro} onChange={e => setFiltro(e.target.value)}>
                <option value="">Todos</option>
                {apenados.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
            </div>
          )}

          <div className={styles.divider} />

          {carregando ? <p className={styles.vazio}>Carregando...</p> : execucoesFiltradas.length === 0 ? (
            <div className={styles.vazioBox}>
              <p className={styles.vazio}>Nenhuma execução cadastrada ainda.</p>
              <button className={styles.btnSecundario} onClick={() => navigate('/execucao')}>Registrar primeira execução</button>
            </div>
          ) : (
            <div className={styles.lista}>
              {execucoesFiltradas.map(e => {
                const pct = calcularProgresso(e)
                const diasFaltantes = calcularDiasFaltantes(e.data_progressao)
                const progressaoVencida = diasFaltantes !== null && diasFaltantes < 0
                const etapaAtual = getEtapaIndex(e.regime_progressao)

                return (
                  <div key={e.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div>
                        <span className={styles.cardNome}>{getNomeApenado(e.apenado_id)?.nome || `Apenado #${e.apenado_id}`}</span>
                        <div className={styles.cardTags}>
                          <span className={`${styles.badge} ${progressaoVencida ? styles.badgeAlerta : styles.badgeFechado}`}>
                            {e.regime_progressao || 'Fechado'}
                          </span>
                          {e.reincidente && <span className={`${styles.badge} ${styles.badgeReincidente}`}>Reincidente</span>}
                          <span className={`${styles.badge} ${styles.badgeNatureza}`}>{e.natureza_crime}</span>
                        </div>
                      </div>
                      <div className={styles.cardAcoes}>
                        <button
                          className={styles.btnPDF}
                          onClick={() => handleGerarPDF(e)}
                          disabled={gerandoPDF === e.id}
                        >
                          {gerandoPDF === e.id ? '...' : '↓ PDF'}
                        </button>
                        <span className={styles.cardId}>#{e.id}</span>
                      </div>
                    </div>

                    <div className={styles.etapas}>
                      {ETAPAS.map((etapa, i) => (
                        <div key={etapa} className={styles.etapaGrupo}>
                          <div className={styles.etapaItem}>
                            <div className={`${styles.etapaDot} ${i < etapaAtual ? styles.etapaFeita : ''} ${i === etapaAtual ? styles.etapaAtual : ''}`} />
                            <span className={`${styles.etapaLabel} ${i === etapaAtual ? styles.etapaLabelAtiva : ''}`}>{etapa}</span>
                          </div>
                          {i < ETAPAS.length - 1 && <div className={`${styles.etapaLinha} ${i < etapaAtual ? styles.etapaLinhaFeita : ''}`} />}
                        </div>
                      ))}
                    </div>

                    <div className={styles.progressoWrap}>
                      <div className={styles.progressoHeader}>
                        <span className={styles.progressoLabel}>Pena cumprida</span>
                        <span className={`${styles.progressoPct} ${progressaoVencida ? styles.progressoPctAlerta : ''}`}>{pct}%</span>
                      </div>
                      <div className={styles.progressoBar}>
                        <div className={`${styles.progressoFill} ${progressaoVencida ? styles.progressoFillAlerta : ''}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className={styles.cardGrid}>
                      <div className={styles.cardInfo}><span className={styles.infoLabel}>Pena total</span><span className={styles.infoValor}>{e.pena_anos}A {e.pena_meses}M {e.pena_dias}D</span></div>
                      <div className={styles.cardInfo}><span className={styles.infoLabel}>Início</span><span className={styles.infoValor}>{formatarData(e.data_inicio_pena)}</span></div>
                      <div className={styles.cardInfo}><span className={styles.infoLabel}>Término</span><span className={styles.infoValor}>{formatarData(e.data_termino)}</span></div>
                      <div className={styles.cardInfo}><span className={styles.infoLabel}>Progressão em</span><span className={`${styles.infoValor} ${progressaoVencida ? styles.infoAlerta : ''}`}>{formatarData(e.data_progressao)}</span></div>
                      <div className={styles.cardInfo}><span className={styles.infoLabel}>Dias remidos</span><span className={styles.infoValor}>{e.dias_remidos ?? 0}</span></div>
                      <div className={styles.cardInfo}>
                        <span className={styles.infoLabel}>{progressaoVencida ? 'Vencida há' : 'Falta para progressão'}</span>
                        <span className={`${styles.infoValor} ${progressaoVencida ? styles.infoAlerta : ''}`}>
                          {diasFaltantes === null ? '—' : `${Math.abs(diasFaltantes)} dias`}
                        </span>
                      </div>
                    </div>

                    {progressaoVencida && <div className={styles.alertaBox}>⚠ Data de progressão já passou — verificar situação do apenado</div>}

                    <CardRemicao execucaoId={e.id} onRemicaoAdicionada={carregar} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
