import { useState, useEffect } from 'react'
import { API_URL } from '../services/api'
import styles from '../pages/ExecucoesPage.module.css'

export default function FormRemicao({ execucaoId, onRemicaoAdicionada }) {
  const [historico, setHistorico] = useState([])
  const [form, setForm] = useState({ tipo: 'trabalho', quantidade: '', data_inicio: '', data_fim: '', observacao: '' })
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
      if (!form.data_inicio) { setErro('Informe a data de início.'); setLoading(false); return }

      const payload = {
        execucao_id: execucaoId,
        tipo: form.tipo,
        quantidade: parseInt(form.quantidade),
        data_inicio: form.data_inicio,
        data_fim: form.data_fim || null,
        data_referencia: form.data_fim || form.data_inicio,
        observacao: form.observacao || null,
      }

      const res = await fetch(`${API_URL}/api/v1/remicoes/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao registrar')
      setSucesso(`${data.dias_remidos} dia(s) remido(s) com sucesso!`)
      setForm({ tipo: 'trabalho', quantidade: '', data_inicio: '', data_fim: '', observacao: '' })
      fetch(`${API_URL}/api/v1/remicoes/execucao/${execucaoId}`).then(r => r.json()).then(setHistorico).catch(() => {})
      onRemicaoAdicionada()
    } catch (err) { setErro(err.message) } finally { setLoading(false) }
  }

  const formatarData = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-'
  const formatarPeriodo = (r) => {
    if (r.data_inicio && r.data_fim) return `${formatarData(r.data_inicio)} a ${formatarData(r.data_fim)}`
    if (r.data_inicio) return `a partir de ${formatarData(r.data_inicio)}`
    return formatarData(r.data_referencia)
  }

  return (
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
        </div>
        <div className={styles.remicaoGrid}>
          <div className={styles.remicaoField}>
            <label className={styles.remicaoLabel}>Data de início *</label>
            <input className={styles.remicaoInput} type="date" value={form.data_inicio}
              onChange={e => setForm({ ...form, data_inicio: e.target.value })} required />
          </div>
          <div className={styles.remicaoField}>
            <label className={styles.remicaoLabel}>Data de fim</label>
            <input className={styles.remicaoInput} type="date" value={form.data_fim}
              onChange={e => setForm({ ...form, data_fim: e.target.value })} />
          </div>
        </div>
        <div className={styles.remicaoField}>
          <label className={styles.remicaoLabel}>Observação (opcional)</label>
          <input className={styles.remicaoInput} type="text" placeholder="Ex: Trabalho na oficina"
            value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })} />
        </div>
        {form.quantidade && <div className={styles.previa}>Prévia: <strong>{calcPrevia[form.tipo]} dia(s)</strong> serão remidos</div>}
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
                <span className={styles.historicoDetalhe}>{formatarPeriodo(r)}</span>
                {r.observacao && <span className={styles.historicoObs}>{r.observacao}</span>}
              </div>
              <div className={styles.historicoRight}>
                <span className={styles.historicoDias}>−{r.dias_remidos}d</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
