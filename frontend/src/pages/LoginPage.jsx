import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Logo from '../components/ui/Logo'
import { API_URL } from '../services/api'
import styles from './LoginPage.module.css'

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: '', password: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(''); setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Credenciais inválidas')
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/home')
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.bgPattern} />
      <Navbar />
      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Logo size={52} />
            <h1 className={styles.title}>CalPEC</h1>
            <p className={styles.subtitle}>Sistema Eletrônico de Execução Criminal</p>
          </div>
          <div className={styles.divider} />
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>E-mail / CPF</label>
              <input className={styles.input} type="text" name="login" placeholder="seu@email.com ou CPF" value={form.login} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Senha</label>
              <div className={styles.inputWrap}>
                <input className={styles.input} type={mostrarSenha ? 'text' : 'password'} name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                <button type="button" className={styles.eyeBtn} onClick={() => setMostrarSenha(!mostrarSenha)}>
                  <EyeIcon open={mostrarSenha} />
                </button>
              </div>
            </div>
            {erro && <p className={styles.erro}>{erro}</p>}
            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no sistema'}
            </button>
          </form>
          <p className={styles.register}>
            Não tem conta? <span onClick={() => navigate('/registrar')}>Cadastre-se</span>
          </p>
        </div>
      </div>
      <footer className={styles.footer}>© 2025 CalPEC · Sistema Eletrônico de Execução Penal</footer>
    </div>
  )
}
