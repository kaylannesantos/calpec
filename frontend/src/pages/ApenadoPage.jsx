import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { API_URL } from '../services/api'
import styles from './ApenadoPage.module.css'

export default function ApenadoPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', numero_execucao: '', data_nascimento: '' })
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [apenados, setApenados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [aba, setAba] = useState('lista')
  const [editando, setEditando] = useState(null)
  const [formEdicao, setFormEdicao] = useState({ nome: '', numero_execucao: '', data_nascimento: '' })
  const [erroEdicao, setErroEdicao] = useState('')
  const [sucessoEdicao, setSucessoEdicao] = useState('')
  const [loadingEdicao, setLoadingEdicao] = useState(false)

  const carregarApenados = async () => {
    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/apenados/`)
      setApenados(await res.json())
    } catch {} finally { setCarregando(false) }
  }

  useEffect(() => { carregarApenados() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(''); setSucesso(''); setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/apenados/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao registrar')
      setSucesso(`Apenado "${data.nome}" registrado com sucesso!`)
      setForm({ nome: '', numero_execucao: '', data_nascimento: '' })
      carregarApenados()
      setTimeout(() => { setSucesso(''); setAba('lista') }, 2000)
    } catch (err) { setErro(err.message) } finally { setLoading(false) }
  }

  const abrirEdicao = (a) => {
    setEditando(a.id)
    setFormEdicao({ nome: a.nome, numero_execucao: a.numero_execucao, data_nascimento: a.data_nascimento })
    setErroEdicao(''); setSucessoEdicao('')
  }

  const fecharEdicao = () => {
    setEditando(null)
    setErroEdicao(''); setSucessoEdicao('')
  }

  const handleSalvarEdicao = async (e, id) => {
    e.preventDefault()
    setErroEdicao(''); setSucessoEdicao(''); setLoadingEdicao(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/apenados/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEdicao),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Erro ao atualizar')
      setSucessoEdicao('Apenado atualizado com sucesso!')
      carregarApenados()
      setTimeout(() => { fecharEdicao() }, 1500)
    } catch (err) { setErroEdicao(err.message) } finally { setLoadingEdicao(false) }
  }

  const formatarData = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-'

  return (
    <div className={styles.root}>
      <div className={styles.bgPattern} />
      <Navbar showLinks />
      <div className={styles.body}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Apenados</h1>
            <div className={styles.abas}>
              <button className={`${styles.aba} ${aba === 'lista' ? styles.abaAtiva : ''}`} onClick={() => setAba('lista')}>Lista ({apenados.length})</button>
              <button className={`${styles.aba} ${aba === 'novo' ? styles.abaAtiva : ''}`} onClick={() => { setAba('novo'); setSucesso(''); setErro('') }}>+ Novo apenado</button>
            </div>
          </div>
          <div className={styles.divider} />

          {aba === 'lista' && (
            <div className={styles.lista}>
              {carregando ? <p className={styles.vazio}>Carregando...</p> : apenados.length === 0 ? (
                <div className={styles.vazioBox}>
                  <p className={styles.vazio}>Nenhum apenado cadastrado ainda.</p>
                  <button className={styles.btnSecundario} onClick={() => setAba('novo')}>Cadastrar primeiro apenado</button>
                </div>
              ) : apenados.map(a => (
                <div key={a.id} className={styles.item}>
                  {editando === a.id ? (
                    <form onSubmit={(e) => handleSalvarEdicao(e, a.id)} className={styles.formEdicao}>
                      <p className={styles.edicaoTitulo}>Editar apenado</p>
                      <div className={styles.edicaoGrid}>
                        <div className={styles.field}>
                          <label className={styles.label}>Nome completo</label>
                          <input className={styles.input} value={formEdicao.nome} onChange={e => setFormEdicao({...formEdicao, nome: e.target.value})} required />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Número da execução</label>
                          <input className={styles.input} value={formEdicao.numero_execucao} onChange={e => setFormEdicao({...formEdicao, numero_execucao: e.target.value})} required />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Data de nascimento</label>
                          <input className={styles.input} type="date" value={formEdicao.data_nascimento} onChange={e => setFormEdicao({...formEdicao, data_nascimento: e.target.value})} required />
                        </div>
                      </div>
                      {erroEdicao && <p className={styles.erro}>{erroEdicao}</p>}
                      {sucessoEdicao && <p className={styles.sucesso}>{sucessoEdicao}</p>}
                      <div className={styles.edicaoBotoes}>
                        <button type="button" className={styles.btnCancelar} onClick={fecharEdicao}>Cancelar</button>
                        <button type="submit" className={styles.btn} disabled={loadingEdicao}>
                          {loadingEdicao ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemNome}>{a.nome}</span>
                        <span className={styles.itemDetalhe}>Nº {a.numero_execucao}</span>
                        <span className={styles.itemDetalhe}>Nascimento: {formatarData(a.data_nascimento)}</span>
                      </div>
                      <div className={styles.itemAcoes}>
                        <button className={styles.btnEditar} onClick={() => abrirEdicao(a)}>✎ Editar</button>
                        <button className={styles.btnVer} onClick={() => navigate(`/execucoes?apenado_id=${a.id}&nome=${encodeURIComponent(a.nome)}`)}>Ver execuções →</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {aba === 'novo' && (
            <div className={styles.card}>
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
                <button className={styles.btn} type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrar apenado'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
