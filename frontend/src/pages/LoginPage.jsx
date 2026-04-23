import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: '', password: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao fazer login')
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
      <div className={styles.accentBar} />

      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L9.5 6H14.5L10.5 9L12 14L8 11L4 14L5.5 9L1.5 6H6.5L8 1Z" fill="#c9a96e"/>
            </svg>
          </div>
          <span className={styles.logoText}>CalPEC</span>
        </div>
        <div className={styles.navLinks}>
          <span className={styles.navLink}>Início</span>
          <span className={styles.navLink} onClick={() => navigate('/apenados')}>Registrar</span>
        </div>
      </nav>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.seal}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 3V19M4 11H18M6 6L16 16M16 6L6 16" stroke="#c9a96e" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className={styles.title}>Acesso ao Sistema</h1>
            <p className={styles.subtitle}>Execução Criminal — LEP</p>
          </div>

          <div className={styles.divider} />

          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>E-mail / CPF</label>
              <input
                className={styles.input}
                type="text"
                name="login"
                placeholder="seu@email.com ou CPF"
                value={form.login}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Senha</label>
              <input
                className={styles.input}
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {erro && <p className={styles.erro}>{erro}</p>}

            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no sistema'}
            </button>
          </form>

          <p className={styles.register}>
            Não tem conta?{' '}
            <span onClick={() => navigate('/registrar')}>Cadastre-se</span>
          </p>
        </div>
      </div>

      <footer className={styles.footer}>© 2025 CalPEC · Sistema Eletrônico de Execução Penal</footer>
    </div>
  )
}
