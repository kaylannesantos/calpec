import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { gerarPDFExecucao } from '../utils/gerarPDF'
import styles from './ExecucoesPage.module.css'
import { API_URL } from '../services/api'

const ETAPAS = ['Fechado', 'Semiaberto', 'Aberto', 'Livramento', 'Extinta']
const naturezas = [
  { value: 'comum', label: 'Crime comum (sem violência)' },
  { value: 'violento', label: 'Crime comum (com violência)' },
  { value: 'hediondo', label: 'Crime hediondo' },
  { value: 'hediondo_morte', label: 'Crime hediondo com resultado morte' },
  { value: 'feminicidio', label: 'Feminicídio' },
  { value: 'milicia', label: 'Constituição de milícia privada' },
  { value: 'org_criminosa', label: 'Organização criminosa' },
]

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

function FormEdicao({ execucao, onAtualizado, onFechar }) {
  const [form, setForm] = useState({
    pena_anos: execucao.pena_anos, pena_meses: execucao.pena_meses, pena_dias: execucao.pena_dias,
    natureza_crime: execucao.natureza_crime, reincidente: execucao.reincidente,
    data_inicio_pena: execucao.data_inicio_pena,
    detracao_inicio: execucao.detracao_inicio || '', detracao_fim: execucao.detracao_fim || '',
    dias_trabalhados: execucao.dias_trabalhados || 0, horas_estudo: execucao.horas_estudo || 0, obras_lidas: execucao.obras_lidas || 0,
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setErro(''); setSucesso(''); setLoading(true)
    try {
      const payload = {
        ...form, apenado_id: execucao.apenado_id,
        pena_anos: parseInt(form.pena_anos) || 0, pena_meses: parseInt(form.pena_meses) || 0,
        pena_dias: parseInt(form.pena_dias) || 0, dias_trabalhados: parseInt(form.dias_trabalhados) || 0,
        horas_estudo: parseInt(form.horas_estudo) || 0, obras_lidas: parseInt(form.obras_lidas) || 0,
        detracao_inicio: form.detracao_inicio || null, detracao_fim: form.detracao_fim || null,
      }
      const res = await fetch(`${API_URL}/api/v1/execucoes/${execucao.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao atualizar')
      setSucesso('Execução atualizada com sucesso!')
      onAtualizado()
      setTimeout(() => { setSucesso(''); onFechar() }, 1500)
    } catch (err) { setErro(err.message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.edicaoForm}>
      <p className={styles.edicaoTitulo}>Editar dados da execução</p>
      <div className={styles.edicaoGrid}>
        <div className={styles.edicaoSection}>
          <p className={styles.edicaoSectionLabel}>Pena</p>
          <div className={styles.edicaoRow}>
            <div className={styles.edicaoField}><label className={styles.remicaoLabel}>Anos</label><input className={styles.remicaoInput} type="number" name="pena_anos" min="0" value={form.pena_anos} onChange={handleChange} /></div>
            <div className={styles.edicaoField}><label className={styles.remicaoLabel}>Meses</label><input className={styles.remicaoInput} type="number" name="pena_meses" min="0" max="11" value={form.pena_meses} onChange={handleChange} /></div>
            <div className={styles.edicaoField}><label className={styles.remicaoLabel}>Dias</label><input className={styles.remicaoInput} type="number" name="pena_dias" min="0" max="29" value={form.pena_dias} onChange={handleChange} /></div>
          </div>
          <div className={styles.edicaoField}><label className={styles.remicaoLabel}>Natureza do crime</label>
            <select className={styles.remicaoInput} name="natureza_crime" value={form.natureza_crime} onChange={handleChange}>
              {naturezas.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
          </div>
          <div className={styles.edicaoCheck}>
            <input type="checkbox" id={`r_${execucao.id}`} name="reincidente" checked={form.reincidente} onChange={handleChange} />
            <label htmlFor={`r_${execucao.id}`} className={styles.remicaoLabel}>Réu reincidente</label>
          </div>
          <div className={styles.edicaoField}><label className={styles.remicaoLabel}>Início da pena</label><input className={styles.remicaoInput} type="date" name="data_inicio_pena" value={form.data_inicio_pena} onChange={handleChange} required /></div>
        </div>
        <div className={styles.edicaoSection}>
          <p className={styles.edicaoSectionLabel}>Detração</p>
          <div className={styles.edicaoRow}>
            <div className={styles.edicaoField}><label className={styles.remicaoLabel}>Início</label><input className={styles.remicaoInput} type="date" name="detracao_inicio" value={form.detracao_inicio} onChange={handleChange} /></div>
            <div className={styles.edicaoField}><label className={styles.remicaoLabel}>Fim</label><input className={styles.remicaoInput} type="date" name="detracao_fim" value={form.detracao_fim} onChange={handleChange} /></div>
          </div>
          <p className={styles.edicaoSectionLabel} style={{marginTop: '12px'}}>Remição inicial</p>
          <div className={styles.edicaoField}><label className={styles.remicaoLabel}>Dias trabalhados</label><input className={styles.remicaoInput} type="number" name="dias_trabalhados" min="0" value={form.dias_trabalhados} onChange={handleChange} /></div>
          <div className={styles.edicaoField}><label className={styles.remicaoLabel}>Horas de estudo</label><input className={styles.remicaoInput} type="number" name="horas_estudo" min="0" value={form.horas_estudo} onChange={handleChange} /></div>
          <div className={styles.edicaoField}><label className={styles.remicaoLabel}>Obras lidas</label><input className={styles.remicaoInput} type="number" name="obras_lidas" min="0" max="12" value={form.obras_lidas} onChange={handleChange} /></div>
        </div>
      </div>
      {erro && <p className={styles.remicaoErro}>{erro}</p>}
      {sucesso && <p className={styles.remicaoSucesso}>{sucesso}</p>}
      <button className={styles.btnSalvarEdicao} type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar alterações'}</button>
    </form>
  )
}

function FormRemicao({ execucaoId, onRemicaoAdicionada, onFechar }) {
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

  useEffect(() => {
    fetch(`${API_URL}/api/v1/remicoes/execucao/${execucaoId}`)
      .then(r => r.json()).then(setHistorico).catch(() => {})
  }, [execucaoId])

  const handleSubmit = async (e) => {
    e.preventDefault(); setErro(''); setSucesso(''); setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/remicoes/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, execucao_id: execucaoId, quantidade: parseInt(form.quantidade) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao registrar')
      setSucesso(`${data.dias_remidos} dia(s) remido(s) com sucesso!`)
      setForm({ tipo: 'trabalho', quantidade: '', data_referencia: '', observacao: '' })
      fetch(`${API_URL}/api/v1/remicoes/execucao/${execucaoId}`).then(r => r.json()).then(setHistorico).catch(() => {})
      onRemicaoAdicionada()
    } catch (err) { setErro(err.message) } finally { setLoading(false) }
  }

  const formatarData = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-'

  return (
    <div className={styles.remicaoBox}>
      <form onSubmit={handleSubmit} className={styles.remicaoForm}>
        <p className={styles.remicaoTitulo}>Nova remição</p>
        <div className={styles.remicaoGrid}>
          <div className={styles.remicaoField}><label className={styles.remicaoLabel}>Tipo</label>
            <select className={styles.remicaoInput} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              <option value="trabalho">Trabalho</option>
              <option value="estudo">Estudo</option>
              <option value="leitura">Leitura</option>
            </select>
          </div>
          <div className={styles.remicaoField}><label className={styles.remicaoLabel}>{labels[form.tipo]}</label>
            <input className={styles.remicaoInput} type="number" min="1" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} required />
          </div>
          <div className={styles.remicaoField}><label className={styles.remicaoLabel}>Data de referência</label>
            <input className={styles.remicaoInput} type="date" value={form.data_referencia} onChange={e => setForm({ ...form, data_referencia: e.target.value })} required />
          </div>
        </div>
        <div className={styles.remicaoField}><label className={styles.remicaoLabel}>Observação (opcional)</label>
          <input className={styles.remicaoInput} type="text" placeholder="Ex: Trabalho na oficina" value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })} />
        </div>
        {form.quantidade && <div className={styles.previa}>Prévia: <strong>{calcPrevia[form.tipo]} dia(s)</strong> serão remidos</div>}
        {erro && <p className={styles.remicaoErro}>{erro}</p>}
        {sucesso && <p className={styles.remicaoSucesso}>{sucesso}</p>}
        <button className={styles.btnSalvar} type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar remição'}</button>
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
  const [edicaoAberta, setEdicaoAberta] = useState(null)
  const [remicaoAberta, setRemicaoAberta] = useState(null)

  const formatarData = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-'

  const carregar = async () => {
    setCarregando(true)
    try {
      const [resExec, resApen] = await Promise.all([
        fetch(`${API_URL}/api/v1/execucoes/`),
        fetch(`${API_URL}/api/v1/apenados/`),
      ])
      setExecucoes(await resExec.json())
      setApenados(await resApen.json())
    } catch {} finally { setCarregando(false) }
  }

  useEffect(() => { carregar() }, [])

  const execucoesFiltradas = filtro
    ? execucoes.filter(e => String(e.apenado_id) === String(filtro))
    : execucoes

  const getNomeApenado = (id) => apenados.find(a => a.id === id) || null

  const handleGerarPDF = async (execucao, visualizar = false) => {
    setGerandoPDF(execucao.id)
    try {
      const apenado = getNomeApenado(execucao.apenado_id)
      if (!apenado) return
      const resRemicoes = await fetch(`${API_URL}/api/v1/remicoes/execucao/${execucao.id}`)
      const remicoes = await resRemicoes.json()
      gerarPDFExecucao({ apenado, execucao, remicoes, visualizar })
    } catch (err) { console.error('Erro ao gerar PDF:', err) }
    finally { setGerandoPDF(null) }
  }

  const toggleEdicao = (id) => {
    setEdicaoAberta(prev => prev === id ? null : id)
    setRemicaoAberta(null)
  }

  const toggleRemicao = (id) => {
    setRemicaoAberta(prev => prev === id ? null : id)
    setEdicaoAberta(null)
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
                const etapaAtual = getEtapaIndex(e.regime_inicial)

                return (
                  <div key={e.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div>
                        <span className={styles.cardNome}>{getNomeApenado(e.apenado_id)?.nome || `Apenado #${e.apenado_id}`}</span>
                        <div className={styles.cardTags}>
                          <span className={`${styles.badge} ${
                            e.regime_inicial === 'Fechado' ? styles.badgeFechado :
                            e.regime_inicial === 'Semiaberto' ? styles.badgeSemiaberto :
                            e.regime_inicial === 'Aberto' ? styles.badgeAberto : styles.badgeFechado
                          }`}>{e.regime_inicial || 'Fechado'}</span>
                          {e.reincidente && <span className={`${styles.badge} ${styles.badgeReincidente}`}>Reincidente</span>}
                          <span className={`${styles.badge} ${styles.badgeNatureza}`}>{e.natureza_crime}</span>
                        </div>
                      </div>
                      <div className={styles.cardAcoes}>
                        <button className={styles.btnPDF} onClick={() => handleGerarPDF(e, true)} disabled={gerandoPDF === e.id}>
                          {gerandoPDF === e.id ? '...' : '👁 Ver'}
                        </button>
                        <button className={styles.btnPDFDownload} onClick={() => handleGerarPDF(e, false)} disabled={gerandoPDF === e.id}>
                          ↓ PDF
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

                    <div className={styles.acoesCard}>
                      <div className={styles.botoesAcoes}>
                        <button
                          className={`${styles.btnEditar} ${edicaoAberta === e.id ? styles.btnAtivoEditar : ''}`}
                          onClick={() => toggleEdicao(e.id)} type="button">
                          {edicaoAberta === e.id ? '▲ Fechar edição' : '✎ Editar execução'}
                        </button>
                        <button
                          className={`${styles.btnRemicao} ${remicaoAberta === e.id ? styles.btnAtivoRemicao : ''}`}
                          onClick={() => toggleRemicao(e.id)} type="button">
                          {remicaoAberta === e.id ? '▲ Fechar' : '+ Registrar Remição'}
                        </button>
                      </div>
                      {edicaoAberta === e.id && (
                        <FormEdicao execucao={e} onAtualizado={carregar} onFechar={() => setEdicaoAberta(null)} />
                      )}
                      {remicaoAberta === e.id && (
                        <FormRemicao execucaoId={e.id} onRemicaoAdicionada={carregar} onFechar={() => setRemicaoAberta(null)} />
                      )}
                    </div>
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
