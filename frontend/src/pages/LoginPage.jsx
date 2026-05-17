import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Logo from '../components/ui/Logo'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: '', password: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(''); setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
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
            <p className={styles.subtitle}>SISTEMA ELETRÔNICO DE EXECUÇÃO CRIMINAL</p>
          </div>
          <div className={styles.divider} />
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>E-mail / CPF</label>
              <input className={styles.input} type="text" name="login" placeholder="seu@email.com ou CPF" value={form.login} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Senha</label>
              <input className={styles.input} type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
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
