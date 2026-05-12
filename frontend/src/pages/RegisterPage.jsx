import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './RegisterPage.module.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '', email: '', cpf: '', numero_oab: '', telefone: '', password: '', confirmar_senha: ''
  })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(''); setSucesso('')

    if (form.password !== form.confirmar_senha) {
      setErro('As senhas não coincidem.'); return
    }
    if (form.password.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.'); return
    }

    setLoading(true)
    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        password: form.password,
        cpf: form.cpf || null,
        numero_oab: form.numero_oab || null,
        telefone: form.telefone || null,
      }
      const res = await fetch('http://localhost:8000/api/v1/auth/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao cadastrar')
      setSucesso('Cadastro realizado com sucesso! Redirecionando...')
      setTimeout(() => navigate('/login'), 2000)
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
        <div className={styles.logo} onClick={() => navigate('/login')}>
          <div className={styles.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L9.5 6H14.5L10.5 9L12 14L8 11L4 14L5.5 9L1.5 6H6.5L8 1Z" fill="#c9a96e"/>
            </svg>
          </div>
          <span className={styles.logoText}>CalPEC</span>
        </div>
        <span className={styles.navLink} onClick={() => navigate('/login')}>← Voltar ao login</span>
      </nav>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.seal}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h1 className={styles.title}>Criar Conta</h1>
            <p className={styles.subtitle}>Preencha os dados para acessar o sistema</p>
          </div>

          <div className={styles.divider} />

          <form onSubmit={handleSubmit}>
            <p className={styles.sectionLabel}>Dados pessoais</p>

            <div className={styles.field}>
              <label className={styles.label}>Nome completo *</label>
              <input className={styles.input} name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome completo" required />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>E-mail *</label>
                <input className={styles.input} type="email" name="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>CPF</label>
                <input className={styles.input} name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Nº OAB</label>
                <input className={styles.input} name="numero_oab" value={form.numero_oab} onChange={handleChange} placeholder="Ex: PI12345" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Telefone</label>
                <input className={styles.input} name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className={styles.dividerLight} />
            <p className={styles.sectionLabel}>Acesso ao sistema</p>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Senha *</label>
                <input className={styles.input} type="password" name="password" value={form.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirmar senha *</label>
                <input className={styles.input} type="password" name="confirmar_senha" value={form.confirmar_senha} onChange={handleChange} placeholder="Repita a senha" required />
              </div>
            </div>

            {erro && <p className={styles.erro}>{erro}</p>}
            {sucesso && <p className={styles.sucesso}>{sucesso}</p>}

            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Criar conta'}
            </button>
          </form>

          <p className={styles.login}>
            Já tem conta? <span onClick={() => navigate('/login')}>Faça login</span>
          </p>
        </div>
      </div>

      <footer className={styles.footer}>© 2025 CalPEC · Sistema Eletrônico de Execução Penal</footer>
    </div>
  )
}
