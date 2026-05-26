import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { API_URL } from '../services/api'
import styles from './ExecucaoPage.module.css'

const naturezas = [
  { value: 'comum', label: 'Crime comum (sem violência)' },
  { value: 'violento', label: 'Crime comum (com violência)' },
  { value: 'hediondo', label: 'Crime hediondo' },
  { value: 'hediondo_morte', label: 'Crime hediondo com resultado morte' },
  { value: 'feminicidio', label: 'Feminicídio' },
  { value: 'milicia', label: 'Constituição de milícia privada' },
  { value: 'org_criminosa', label: 'Organização criminosa' },
]

export default function ExecucaoPage() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [todos, setTodos] = useState([])
  const [sugestoes, setSugestoes] = useState([])
  const [apenado, setApenado] = useState(null)
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const buscaRef = useRef(null)

  const [form, setForm] = useState({
    pena_anos: 0, pena_meses: 0, pena_dias: 0,
    natureza_crime: 'comum', reincidente: false,
    data_inicio_pena: '', detracao_inicio: '', detracao_fim: '',
    dias_trabalhados: 0, horas_estudo: 0, obras_lidas: 0,
  })
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/v1/apenados/`)
      .then(r => r.json()).then(setTodos).catch(() => {})
  }, [])

  useEffect(() => {
    if (!busca.trim() || apenado) { setSugestoes([]); setDropdownAberto(false); return }
    const termo = busca.toLowerCase()
    const filtrados = todos.filter(a => a.nome.toLowerCase().includes(termo) || a.numero_execucao.toLowerCase().includes(termo))
    setSugestoes(filtrados)
    setDropdownAberto(filtrados.length > 0)
  }, [busca, todos, apenado])

  useEffect(() => {
    const handler = (e) => { if (buscaRef.current && !buscaRef.current.contains(e.target)) setDropdownAberto(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selecionarApenado = (a) => { setApenado(a); setBusca(a.nome); setSugestoes([]); setDropdownAberto(false) }
  const limparSelecao = () => { setApenado(null); setBusca(''); setSugestoes([]) }
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!apenado) { setErro('Selecione um apenado antes de calcular.'); return }
    setErro(''); setResultado(null); setLoading(true)
    try {
      const payload = {
        ...form, apenado_id: apenado.id,
        pena_anos: parseInt(form.pena_anos) || 0, pena_meses: parseInt(form.pena_meses) || 0,
        pena_dias: parseInt(form.pena_dias) || 0, dias_trabalhados: parseInt(form.dias_trabalhados) || 0,
        horas_estudo: parseInt(form.horas_estudo) || 0, obras_lidas: parseInt(form.obras_lidas) || 0,
        detracao_inicio: form.detracao_inicio || null, detracao_fim: form.detracao_fim || null,
      }
      const resSalvar = await fetch(`${API_URL}/api/v1/execucoes/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const dadosSalvos = await resSalvar.json()
      if (!resSalvar.ok) throw new Error(JSON.stringify(dadosSalvos.detail) || 'Erro ao salvar')
      const resCalculo = await fetch(`${API_URL}/api/v1/execucoes/calcular`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const dadosCalculo = await resCalculo.json()
      setResultado(dadosCalculo)
    } catch (err) { setErro(err.message) } finally { setLoading(false) }
  }

  const formatarData = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-'

  return (
    <div className={styles.root}>
      <div className={styles.bgPattern} />
      <Navbar showLinks />
      <div className={styles.body}>
        <div className={styles.container}>
          <h1 className={styles.title}>Registrar Execução Penal</h1>
          <div className={styles.divider} />
          <div className={styles.buscaCard}>
            <p className={styles.sectionTitle}>Apenado</p>
            <div className={styles.buscaWrap} ref={buscaRef}>
              <input className={`${styles.input} ${apenado ? styles.inputSelecionado : ''}`}
                placeholder="Digite o nome ou número de execução..."
                value={busca} onChange={e => { setBusca(e.target.value); setApenado(null) }}
                onFocus={() => sugestoes.length > 0 && setDropdownAberto(true)} autoComplete="off" />
              {apenado && <button className={styles.btnLimpar} onClick={limparSelecao} type="button">✕</button>}
              {dropdownAberto && sugestoes.length > 0 && (
                <div className={styles.dropdown}>
                  {sugestoes.map(a => (
                    <div key={a.id} className={styles.dropdownItem} onMouseDown={() => selecionarApenado(a)}>
                      <span className={styles.dropdownNome}>{a.nome}</span>
                      <span className={styles.dropdownNumero}>Nº {a.numero_execucao}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {apenado && (
              <div className={styles.apenadoInfo}>
                <span className={styles.apenadoBadge}>✓ Selecionado</span>
                <span className={styles.apenadoNome}>{apenado.nome}</span>
                <span className={styles.apenadoDetalhe}>Nº {apenado.numero_execucao}</span>
                <span className={styles.apenadoDetalhe}>Nascimento: {formatarData(apenado.data_nascimento)}</span>
              </div>
            )}
            {!apenado && busca.length > 0 && sugestoes.length === 0 && <p className={styles.semResultado}>Nenhum apenado encontrado.</p>}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.grid}>
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Dados da Pena</p>
                <div className={styles.row}>
                  <div className={styles.field}><label className={styles.label}>Anos</label><input className={styles.input} type="number" name="pena_anos" min="0" value={form.pena_anos} onChange={handleChange} /></div>
                  <div className={styles.field}><label className={styles.label}>Meses</label><input className={styles.input} type="number" name="pena_meses" min="0" max="11" value={form.pena_meses} onChange={handleChange} /></div>
                  <div className={styles.field}><label className={styles.label}>Dias</label><input className={styles.input} type="number" name="pena_dias" min="0" max="29" value={form.pena_dias} onChange={handleChange} /></div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Natureza do crime</label>
                  <select className={styles.input} name="natureza_crime" value={form.natureza_crime} onChange={handleChange}>
                    {naturezas.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>
                </div>
                <div className={styles.checkField}>
                  <input type="checkbox" id="reincidente" name="reincidente" checked={form.reincidente} onChange={handleChange} />
                  <label htmlFor="reincidente" className={styles.checkLabel}>Réu reincidente</label>
                </div>
                <div className={styles.field}><label className={styles.label}>Início da pena</label><input className={styles.input} type="date" name="data_inicio_pena" value={form.data_inicio_pena} onChange={handleChange} required /></div>
              </div>
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Detração</p>
                <div className={styles.row}>
                  <div className={styles.field}><label className={styles.label}>Início</label><input className={styles.input} type="date" name="detracao_inicio" value={form.detracao_inicio} onChange={handleChange} /></div>
                  <div className={styles.field}><label className={styles.label}>Fim</label><input className={styles.input} type="date" name="detracao_fim" value={form.detracao_fim} onChange={handleChange} /></div>
                </div>
                <p className={styles.sectionTitle} style={{marginTop: '20px'}}>Remição inicial</p>
                <div className={styles.field}><label className={styles.label}>Dias trabalhados</label><input className={styles.input} type="number" name="dias_trabalhados" min="0" value={form.dias_trabalhados} onChange={handleChange} /></div>
                <div className={styles.field}><label className={styles.label}>Horas de estudo</label><input className={styles.input} type="number" name="horas_estudo" min="0" value={form.horas_estudo} onChange={handleChange} /></div>
                <div className={styles.field}><label className={styles.label}>Obras lidas</label><input className={styles.input} type="number" name="obras_lidas" min="0" max="12" value={form.obras_lidas} onChange={handleChange} /></div>
              </div>
            </div>
            {erro && <p className={styles.erro}>{erro}</p>}
            <button className={styles.btn} type="submit" disabled={loading || !apenado}>
              {loading ? 'Calculando e salvando...' : 'Calcular e Salvar Execução Penal'}
            </button>
          </form>

          {resultado && (
            <div className={styles.resultado}>
              <h2 className={styles.resultadoTitle}>✓ Execução salva e calculada</h2>
              <div className={styles.resultadoGrid}>
                <div className={styles.resultadoCard}><span className={styles.resultadoLabel}>Regime inicial</span><span className={styles.resultadoValor}>{resultado.regime_inicial}</span></div>
                <div className={styles.resultadoCard}><span className={styles.resultadoLabel}>Dias remidos</span><span className={styles.resultadoValor}>{resultado.dias_remidos}</span></div>
                <div className={styles.resultadoCard}><span className={styles.resultadoLabel}>Progressão para</span><span className={styles.resultadoValor}>{resultado.regime_progressao}</span></div>
                <div className={styles.resultadoCard}><span className={styles.resultadoLabel}>Data de progressão</span><span className={styles.resultadoValor}>{formatarData(resultado.data_progressao)}</span></div>
                <div className={styles.resultadoCard}><span className={styles.resultadoLabel}>Término da pena</span><span className={styles.resultadoValor}>{formatarData(resultado.data_termino)}</span></div>
                <div className={styles.resultadoCard}><span className={styles.resultadoLabel}>Pena efetiva</span><span className={styles.resultadoValor}>{resultado.pena_extenso?.anos}A {resultado.pena_extenso?.meses}M {resultado.pena_extenso?.dias}D</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
