import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [form, setForm] = useState({
    apenado_id: '', pena_anos: 0, pena_meses: 0, pena_dias: 0,
    natureza_crime: 'comum', reincidente: false,
    data_inicio_pena: '', detracao_inicio: '', detracao_fim: '',
    dias_trabalhados: 0, horas_estudo: 0, obras_lidas: 0,
  })
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(''); setResultado(null); setLoading(true)
    try {
      const payload = {
        ...form,
        apenado_id: parseInt(form.apenado_id) || 1,
        pena_anos: parseInt(form.pena_anos) || 0,
        pena_meses: parseInt(form.pena_meses) || 0,
        pena_dias: parseInt(form.pena_dias) || 0,
        dias_trabalhados: parseInt(form.dias_trabalhados) || 0,
        horas_estudo: parseInt(form.horas_estudo) || 0,
        obras_lidas: parseInt(form.obras_lidas) || 0,
        detracao_inicio: form.detracao_inicio || null,
        detracao_fim: form.detracao_fim || null,
      }
      const res = await fetch('http://localhost:8000/api/v1/execucoes/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(JSON.stringify(data.detail) || 'Erro no cálculo')
      setResultado(data)
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-'

  return (
    <div className={styles.root}>
      <div className={styles.bgPattern} />
      <div className={styles.accentBar} />
      <nav className={styles.nav}>
        <div className={styles.logo} onClick={() => navigate('/home')}>
          <div className={styles.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L9.5 6H14.5L10.5 9L12 14L8 11L4 14L5.5 9L1.5 6H6.5L8 1Z" fill="#c9a96e"/>
            </svg>
          </div>
          <span className={styles.logoText}>CalPEC</span>
        </div>
        <span className={styles.navLink} onClick={() => navigate('/home')}>← Voltar</span>
      </nav>

      <div className={styles.body}>
        <div className={styles.container}>
          <h1 className={styles.title}>Registrar Execução Penal</h1>
          <div className={styles.divider} />

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.grid}>
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Dados da Pena</p>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Anos</label>
                    <input className={styles.input} type="number" name="pena_anos" min="0" value={form.pena_anos} onChange={handleChange} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Meses</label>
                    <input className={styles.input} type="number" name="pena_meses" min="0" max="11" value={form.pena_meses} onChange={handleChange} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Dias</label>
                    <input className={styles.input} type="number" name="pena_dias" min="0" max="29" value={form.pena_dias} onChange={handleChange} />
                  </div>
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

                <div className={styles.field}>
                  <label className={styles.label}>Início da pena</label>
                  <input className={styles.input} type="date" name="data_inicio_pena" value={form.data_inicio_pena} onChange={handleChange} required />
                </div>
              </div>

              <div className={styles.section}>
                <p className={styles.sectionTitle}>Detração</p>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Início</label>
                    <input className={styles.input} type="date" name="detracao_inicio" value={form.detracao_inicio} onChange={handleChange} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Fim</label>
                    <input className={styles.input} type="date" name="detracao_fim" value={form.detracao_fim} onChange={handleChange} />
                  </div>
                </div>

                <p className={styles.sectionTitle} style={{marginTop: '20px'}}>Remição</p>
                <div className={styles.field}>
                  <label className={styles.label}>Dias trabalhados</label>
                  <input className={styles.input} type="number" name="dias_trabalhados" min="0" value={form.dias_trabalhados} onChange={handleChange} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Horas de estudo</label>
                  <input className={styles.input} type="number" name="horas_estudo" min="0" value={form.horas_estudo} onChange={handleChange} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Obras lidas</label>
                  <input className={styles.input} type="number" name="obras_lidas" min="0" max="12" value={form.obras_lidas} onChange={handleChange} />
                </div>
              </div>
            </div>

            {erro && <p className={styles.erro}>{erro}</p>}

            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Calculando...' : 'Calcular Execução Penal'}
            </button>
          </form>

          {resultado && (
            <div className={styles.resultado}>
              <h2 className={styles.resultadoTitle}>Resultado do Cálculo</h2>
              <div className={styles.resultadoGrid}>
                <div className={styles.resultadoCard}>
                  <span className={styles.resultadoLabel}>Regime inicial</span>
                  <span className={styles.resultadoValor}>{resultado.regime_inicial}</span>
                </div>
                <div className={styles.resultadoCard}>
                  <span className={styles.resultadoLabel}>Dias remidos</span>
                  <span className={styles.resultadoValor}>{resultado.dias_remidos}</span>
                </div>
                <div className={styles.resultadoCard}>
                  <span className={styles.resultadoLabel}>Progressão para</span>
                  <span className={styles.resultadoValor}>{resultado.regime_progressao}</span>
                </div>
                <div className={styles.resultadoCard}>
                  <span className={styles.resultadoLabel}>Data de progressão</span>
                  <span className={styles.resultadoValor}>{formatarData(resultado.data_progressao)}</span>
                </div>
                <div className={styles.resultadoCard}>
                  <span className={styles.resultadoLabel}>Término da pena</span>
                  <span className={styles.resultadoValor}>{formatarData(resultado.data_termino)}</span>
                </div>
                <div className={styles.resultadoCard}>
                  <span className={styles.resultadoLabel}>Pena efetiva</span>
                  <span className={styles.resultadoValor}>
                    {resultado.pena_extenso?.anos}A {resultado.pena_extenso?.meses}M {resultado.pena_extenso?.dias}D
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
