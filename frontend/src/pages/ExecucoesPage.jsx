import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import styles from './ExecucoesPage.module.css'

export default function ExecucoesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const apenadoId = searchParams.get('apenado_id')
  const apenadoNome = searchParams.get('nome')

  const [execucoes, setExecucoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState(apenadoId || '')
  const [apenados, setApenados] = useState([])

  const formatarData = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '-'

  const carregarDados = async () => {
    setCarregando(true)
    try {
      const [resExec, resApen] = await Promise.all([
        fetch('http://localhost:8000/api/v1/execucoes/'),
        fetch('http://localhost:8000/api/v1/apenados/'),
      ])
      const execData = await resExec.json()
      const apenData = await resApen.json()
      setExecucoes(execData)
      setApenados(apenData)
    } catch {
      // silencioso
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregarDados() }, [])

  const execucoesFiltradas = filtro
    ? execucoes.filter(e => String(e.apenado_id) === String(filtro))
    : execucoes

  const getNomeApenado = (id) => {
    const a = apenados.find(a => a.id === id)
    return a ? a.nome : `ID ${id}`
  }

  const getRegimeBadge = (regime) => {
    const cores = { Fechado: styles.badgeFechado, Semiaberto: styles.badgeSemiaberto, Aberto: styles.badgeAberto }
    return cores[regime] || styles.badgeDefault
  }

  return (
    <div className={styles.root}>
      <div className={styles.bgPattern} />
      <Navbar showLinks />
      <div className={styles.body}>
        <div className={styles.container}>

          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>
                {apenadoNome ? `Execuções — ${apenadoNome}` : 'Todas as Execuções'}
              </h1>
              <p className={styles.subtitle}>{execucoesFiltradas.length} registro(s) encontrado(s)</p>
            </div>
            <div className={styles.acoes}>
              {filtro && (
                <button className={styles.btnSecundario} onClick={() => { setFiltro(''); navigate('/execucoes') }}>
                  Ver todas
                </button>
              )}
              <button className={styles.btnPrimario} onClick={() => navigate('/execucao')}>
                + Nova execução
              </button>
            </div>
          </div>

          {apenados.length > 0 && (
            <div className={styles.filtroBar}>
              <label className={styles.filtroLabel}>Filtrar por apenado:</label>
              <select
                className={styles.filtroSelect}
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
              >
                <option value="">Todos os apenados</option>
                {apenados.map(a => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.divider} />

          {carregando ? (
            <p className={styles.vazio}>Carregando...</p>
          ) : execucoesFiltradas.length === 0 ? (
            <div className={styles.vazioBox}>
              <p className={styles.vazio}>Nenhuma execução cadastrada ainda.</p>
              <button className={styles.btnSecundario} onClick={() => navigate('/execucao')}>
                Registrar primeira execução
              </button>
            </div>
          ) : (
            <div className={styles.lista}>
              {execucoesFiltradas.map(e => (
                <div key={e.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <span className={styles.cardNome}>{getNomeApenado(e.apenado_id)}</span>
                      <div className={styles.cardTags}>
                        <span className={`${styles.badge} ${getRegimeBadge(e.regime_progressao)}`}>
                          {e.regime_progressao || 'Calculando...'}
                        </span>
                        {e.reincidente && <span className={`${styles.badge} ${styles.badgeReincidente}`}>Reincidente</span>}
                        <span className={styles.badgeNatureza}>{e.natureza_crime}</span>
                      </div>
                    </div>
                    <span className={styles.cardId}>#{e.id}</span>
                  </div>

                  <div className={styles.cardGrid}>
                    <div className={styles.cardInfo}>
                      <span className={styles.infoLabel}>Pena</span>
                      <span className={styles.infoValor}>{e.pena_anos}A {e.pena_meses}M {e.pena_dias}D</span>
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.infoLabel}>Início</span>
                      <span className={styles.infoValor}>{formatarData(e.data_inicio_pena)}</span>
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.infoLabel}>Progressão em</span>
                      <span className={styles.infoValor}>{formatarData(e.data_progressao)}</span>
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.infoLabel}>Término</span>
                      <span className={styles.infoValor}>{formatarData(e.data_termino)}</span>
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.infoLabel}>Dias remidos</span>
                      <span className={styles.infoValor}>{e.dias_remidos ?? 0}</span>
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.infoLabel}>Registrado em</span>
                      <span className={styles.infoValor}>{formatarData(e.criado_em?.split('T')[0])}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
