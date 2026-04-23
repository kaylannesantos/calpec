import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ApenadoPage.module.css'

export default function ApenadoPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', numero_execucao: '', data_nascimento: '' })
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(''); setSucesso(''); setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/apenados/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao registrar')
      setSucesso(`Apenado "${data.nome}" registrado com sucesso!`)
      setForm({ nome: '', numero_execucao: '', data_nascimento: '' })
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

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
        <div className={styles.card}>
          <h1 className={styles.title}>Registrar Apenado</h1>
          <div className={styles.divider} />
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Nome completo</label>
              <input className={styles.input} name="nome" value={form.nome} onChange={handleChange} placeholder="Nome do condenado" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Número da execução</label>
              <input className={styles.input} name="numero_execucao" value={form.numero_execucao} onChange={handleChange} placeholder="Ex: 0001234-56.2024.8.18.0001" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Data de nascimento</label>
              <input className={styles.input} type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} required />
            </div>
            {erro && <p className={styles.erro}>{erro}</p>}
            {sucesso && <p className={styles.sucesso}>{sucesso}</p>}
            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
