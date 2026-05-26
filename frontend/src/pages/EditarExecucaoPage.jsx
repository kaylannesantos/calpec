import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import styles from './ExecucaoPage.module.css'
import { API_URL } from '../services/api'

const naturezas = [
  { value: 'comum', label: 'Crime comum (sem violência)' },
  { value: 'violento', label: 'Crime comum (com violência)' },
  { value: 'hediondo', label: 'Crime hediondo' },
  { value: 'hediondo_morte', label: 'Crime hediondo com resultado morte' },
  { value: 'feminicidio', label: 'Feminicídio' },
  { value: 'milicia', label: 'Constituição de milícia privada' },
  { value: 'org_criminosa', label: 'Organização criminosa' },
]

export default function EditarExecucaoPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [apenado, setApenado] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [form, setForm] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    const carregar = async () => {
      try {
        const resExec = await fetch(`${API_URL}/api/v1/execucoes/${id}`)
        if (!resExec.ok) throw new Error('Execução não encontrada')
        const exec = await resExec.json()

        const resApen = await fetch(`${API_URL}/api/v1/apenados/${exec.apenado_id}`)
        const apen = await resApen.json()
        setApenado(apen)

        setForm({
          apenado_id: exec.apenado_id,
          pena_anos: exec.pena_anos,
          pena_meses: exec.pena_meses,
          pena_dias: exec.pena_dias,
          natureza_crime: exec.natureza_crime,
          reincidente: exec.reincidente,
          data_inicio_pena: exec.data_inicio_pena,
          detracao_inicio: exec.detracao_inicio || '',
          detracao_fim: exec.detracao_fim || '',
          unificacao_inicio: exec.unificacao_inicio || '',
          unificacao_fim: exec.unificacao_fim || '',
          dias_trabalhados: exec.dias_trabalhados || 0,
          horas_estudo: exec.horas_estudo || 0,
          obras_lidas: exec.obras_lidas || 0,
        })
      } catch (err) {
        setErro(err.message)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [id])

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
        pena_anos: parseInt(form.pena_anos) || 0,
        pena_meses: parseInt(form.pena_meses) || 0,
        pena_dias: parseInt(form.pena_dias) || 0,
        dias_trabalhados: parseInt(form.dias_trabalhados) || 0,
        horas_estudo: parseInt(form.horas_estudo) || 0,
        obras_lidas: parseInt(form.obras_lidas) || 0,
        detracao_inicio: form.detracao_inicio || null,
        detracao_fim: form.detracao_fim || null,
        unificacao_inicio: form.unificacao_inicio || null,
        unificacao_fim: form.unificacao_fim || null,
      }

      const res = await fetch(`${API_URL}/api/v1/execucoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(JSON.stringify(data.detail) || 'Erro ao atualizar')

      setSucesso('Execução atualizada com sucesso!')
      setTimeout(() => navigate('/execucoes'), 1500)
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-'

  if (carregando) return (
    <div className={styles.root}>
      <div className={styles.bgPattern} />
      <Navbar showLinks />
      <div className={styles.body}><p style={{color: 'rgba(255,255,255,0.4)'}}>Carregando...</p></div>
    </div>
  )

  return (
    <div className={styles.root}>
      <div className={styles.bgPattern} />
      <Navbar showLinks />
      <div className={styles.body}>
        <div className={styles.container}>
          <h1 className={styles.title}>Editar Execução Penal</h1>
          <div className={styles.divider} />

          {/* Info do apenado */}
          {apenado && (
            <div className={styles.buscaCard}>
              <p className={styles.sectionTitle}>Apenado</p>
              <div className={styles.apenadoInfo}>
                <span className={styles.apenadoBadge}>✓ Vinculado</span>
                <span className={styles.apenadoNome}>{apenado.nome}</span>
                <span className={styles.apenadoDetalhe}>Nº {apenado.numero_execucao}</span>
                <span className={styles.apenadoDetalhe}>Nascimento: {formatarData(apenado.data_nascimento)}</span>
              </div>
            </div>
          )}

          {form && (
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

                  <p className={styles.sectionTitle} style={{marginTop: '20px'}}>Unificação de penas</p>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>Início</label>
                      <input className={styles.input} type="date" name="unificacao_inicio" value={form.unificacao_inicio} onChange={handleChange} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Fim</label>
                      <input className={styles.input} type="date" name="unificacao_fim" value={form.unificacao_fim} onChange={handleChange} />
                    </div>
                  </div>

                  <p className={styles.sectionTitle} style={{marginTop: '20px'}}>Remição inicial</p>
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
              {sucesso && <p style={{fontSize:'13px', color:'#7ec88a', marginBottom:'12px'}}>{sucesso}</p>}

              <button className={styles.btn} type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
