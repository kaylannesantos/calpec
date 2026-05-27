import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { API_URL } from '../services/api'
import styles from './PerfilPage.module.css'

function EyeIcon({ open }) {
  return open ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function PerfilPage() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [form, setForm] = useState({ nome: user.nome || '', telefone: user.telefone || '', senha_atual: '', nova_senha: '', confirmar_senha: '' })
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [alterarSenha, setAlterarSenha] = useState(false)
  const [mostrarAtual, setMostrarAtual] = useState(false)
  const [mostrarNova, setMostrarNova] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleLogout = () => { localStorage.clear(); navigate('/login') }

  const handleSubmit = async (e) => {
    e.preventDefault(); setErro(''); setSucesso('')
    if (alterarSenha) {
      if (!form.senha_atual) { setErro('Informe a senha atual.'); return }
      if (form.nova_senha.length < 6) { setErro('A nova senha deve ter pelo menos 6 caracteres.'); return }
      if (form.nova_senha !== form.confirmar_senha) { setErro('As senhas não coincidem.'); return }
    }
    setLoading(true)
    try {
      const payload = { nome: form.nome, telefone: form.telefone, ...(alterarSenha && { senha_atual: form.senha_atual, nova_senha: form.nova_senha }) }
      const res = await fetch(`${API_URL}/api/v1/auth/perfil/${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao atualizar')
      localStorage.setItem('user', JSON.stringify(data))
      setSucesso('Perfil atualizado com sucesso!')
      setForm(f => ({ ...f, senha_atual: '', nova_senha: '', confirmar_senha: '' }))
      setAlterarSenha(false)
    } catch (err) { setErro(err.message) } finally { setLoading(false) }
  }

  return (
    <div className={styles.root}>
      <div className={styles.bgPattern} />
      <Navbar showLinks />
      <div className={styles.body}>
        <div className={styles.container}>
          <div className={styles.pageHeader}><h1 className={styles.title}>Meu Perfil</h1></div>
          <div className={styles.divider} />
          <div className={styles.grid}>
            <div className={styles.infoCard}>
              <div className={styles.avatar}><span className={styles.avatarLetra}>{user.nome?.charAt(0).toUpperCase()}</span></div>
              <p className={styles.infoNome}>{user.nome}</p>
              <p className={styles.infoEmail}>{user.email}</p>
              {user.numero_oab && <div className={styles.infoBadge}>OAB: {user.numero_oab}</div>}
              {user.cpf && <p className={styles.infoDetalhe}>CPF: {user.cpf}</p>}
              <p className={styles.infoDetalhe}>Membro desde {new Date(user.criado_em).toLocaleDateString('pt-BR')}</p>
              <button className={styles.btnSair} onClick={handleLogout}>Sair do sistema</button>
            </div>
            <div className={styles.formCard}>
              <form onSubmit={handleSubmit}>
                <p className={styles.sectionLabel}>Dados pessoais</p>
                <div className={styles.field}><label className={styles.label}>Nome completo</label><input className={styles.input} name="nome" value={form.nome} onChange={handleChange} required /></div>
                <div className={styles.field}><label className={styles.label}>E-mail</label><input className={styles.input} value={user.email} disabled /></div>
                <div className={styles.row}>
                  <div className={styles.field}><label className={styles.label}>Telefone</label><input className={styles.input} name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" /></div>
                  {user.numero_oab && <div className={styles.field}><label className={styles.label}>Nº OAB</label><input className={styles.input} value={user.numero_oab} disabled /></div>}
                </div>
                <div className={styles.dividerLight} />
                <div className={styles.senhaHeader}>
                  <p className={styles.sectionLabel}>Senha</p>
                  <button type="button" className={styles.btnToggleSenha} onClick={() => setAlterarSenha(!alterarSenha)}>{alterarSenha ? 'Cancelar' : 'Alterar senha'}</button>
                </div>
                {alterarSenha && (
                  <>
                    <div className={styles.field}>
                      <label className={styles.label}>Senha atual</label>
                      <div className={styles.inputWrap}>
                        <input className={styles.input} type={mostrarAtual ? 'text' : 'password'} name="senha_atual" value={form.senha_atual} onChange={handleChange} placeholder="••••••••" />
                        <button type="button" className={styles.eyeBtn} onClick={() => setMostrarAtual(!mostrarAtual)}><EyeIcon open={mostrarAtual} /></button>
                      </div>
                    </div>
                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label className={styles.label}>Nova senha</label>
                        <div className={styles.inputWrap}>
                          <input className={styles.input} type={mostrarNova ? 'text' : 'password'} name="nova_senha" value={form.nova_senha} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
                          <button type="button" className={styles.eyeBtn} onClick={() => setMostrarNova(!mostrarNova)}><EyeIcon open={mostrarNova} /></button>
                        </div>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Confirmar senha</label>
                        <div className={styles.inputWrap}>
                          <input className={styles.input} type={mostrarConfirmar ? 'text' : 'password'} name="confirmar_senha" value={form.confirmar_senha} onChange={handleChange} placeholder="Repita a senha" />
                          <button type="button" className={styles.eyeBtn} onClick={() => setMostrarConfirmar(!mostrarConfirmar)}><EyeIcon open={mostrarConfirmar} /></button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {erro && <p className={styles.erro}>{erro}</p>}
                {sucesso && <p className={styles.sucesso}>{sucesso}</p>}
                <button className={styles.btn} type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar alterações'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
