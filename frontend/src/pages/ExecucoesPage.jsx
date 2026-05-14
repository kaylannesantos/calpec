import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import styles from './ExecucoesPage.module.css'

const ETAPAS = ['Fechado', 'Semiaberto', 'Aberto', 'Livramento', 'Extinta']

function getEtapaIndex(regime) {
  if (!regime) return 0
  if (regime.includes('Semiaberto')) return 1
  if (regime.includes('Aberto')) return 2
  if (regime.includes('Livramento')) return 3
  if (regime.includes('Extinta')) return 4
  return 0
}

function calcularProgresso(execucao) {
  if (!execucao.data_inicio_pena || !execucao.pena_total_dias) return 0
  const inicio = new Date(execucao.data_inicio_pena + 'T12:00:00')
  const hoje = new Date()
  const diasCumpridos = Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24))
  const pct = Math.min(100, Math.round((diasCumpridos / execucao.pena_total_dias) * 100))
  return pct
}

function calcularDiasFaltantes(dataProgressao) {
  if (!dataProgressao) return null
  const hoje = new Date()
  const prog = new Date(dataProgressao + 'T12:00:00')
  const diff = Math.ceil((prog - hoje) / (1000 * 60 * 60 * 24))
  return diff
}

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

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true)
      try {
        const [resExec, resApen] = await Promise.all([
          fetch('http://localhost:8000/api/v1/execucoes/'),
          fetch('http://localhost:8000/api/v1/apenados/'),
        ])
        setExecucoes(await resExec.json())
        setApenados(await resApen.json())
      } catch {}
      finally { setCarregando(false) }
    }
    carregar()
  }, [])

  const execucoesFiltradas = filtro
    ? execucoes.filter(e => String(e.apenado_id) === String(filtro))
    : execucoes

  const getNomeApenado = (id) => {
    const a = apenados.find(a => a.id === id)
    return a ? a.nome : `Apenado #${id}`
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
              <p className={styles.subtitle}>{execucoesFiltradas.length} registro(s)</p>
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
              <select className={styles.filtroSelect} value={filtro} onChange={e => setFiltro(e.target.value)}>
                <option value="">Todos</option>
                {apenados.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
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
              {execucoesFiltradas.map(e => {
                const pct = calcularProgresso(e)
                const diasFaltantes = calcularDiasFaltantes(e.data_progressao)
                const progressaoVencida = diasFaltantes !== null && diasFaltantes < 0
                const etapaAtual = getEtapaIndex(e.regime_progressao)

                return (
                  <div key={e.id} className={styles.card}>

                    {/* Topo */}
                    <div className={styles.cardTop}>
                      <div>
                        <span className={styles.cardNome}>{getNomeApenado(e.apenado_id)}</span>
                        <div className={styles.cardTags}>
                          <span className={`${styles.badge} ${progressaoVencida ? styles.badgeAlerta : styles.badgeFechado}`}>
                            {e.regime_progressao || 'Fechado'}
                          </span>
                          {e.reincidente && <span className={`${styles.badge} ${styles.badgeReincidente}`}>Reincidente</span>}
                          <span className={`${styles.badge} ${styles.badgeNatureza}`}>{e.natureza_crime}</span>
                        </div>
                      </div>
                      <span className={styles.cardId}>#{e.id}</span>
                    </div>

                    {/* Linha de etapas */}
                    <div className={styles.etapas}>
                      {ETAPAS.map((etapa, i) => (
                        <div key={etapa} className={styles.etapaGrupo}>
                          <div className={styles.etapaItem}>
                            <div className={`${styles.etapaDot} ${i < etapaAtual ? styles.etapaFeita : ''} ${i === etapaAtual ? styles.etapaAtual : ''}`} />
                            <span className={`${styles.etapaLabel} ${i === etapaAtual ? styles.etapaLabelAtiva : ''}`}>{etapa}</span>
                          </div>
                          {i < ETAPAS.length - 1 && (
                            <div className={`${styles.etapaLinha} ${i < etapaAtual ? styles.etapaLinhaFeita : ''}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Barra de progresso */}
                    <div className={styles.progressoWrap}>
                      <div className={styles.progressoHeader}>
                        <span className={styles.progressoLabel}>Pena cumprida</span>
                        <span className={`${styles.progressoPct} ${progressaoVencida ? styles.progressoPctAlerta : ''}`}>{pct}%</span>
                      </div>
                      <div className={styles.progressoBar}>
                        <div
                          className={`${styles.progressoFill} ${progressaoVencida ? styles.progressoFillAlerta : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Infos */}
                    <div className={styles.cardGrid}>
                      <div className={styles.cardInfo}>
                        <span className={styles.infoLabel}>Pena total</span>
                        <span className={styles.infoValor}>{e.pena_anos}A {e.pena_meses}M {e.pena_dias}D</span>
                      </div>
                      <div className={styles.cardInfo}>
                        <span className={styles.infoLabel}>Início</span>
                        <span className={styles.infoValor}>{formatarData(e.data_inicio_pena)}</span>
                      </div>
                      <div className={styles.cardInfo}>
                        <span className={styles.infoLabel}>Término</span>
                        <span className={styles.infoValor}>{formatarData(e.data_termino)}</span>
                      </div>
                      <div className={styles.cardInfo}>
                        <span className={styles.infoLabel}>Progressão em</span>
                        <span className={`${styles.infoValor} ${progressaoVencida ? styles.infoAlerta : ''}`}>
                          {formatarData(e.data_progressao)}
                        </span>
                      </div>
                      <div className={styles.cardInfo}>
                        <span className={styles.infoLabel}>Dias remidos</span>
                        <span className={styles.infoValor}>{e.dias_remidos ?? 0}</span>
                      </div>
                      <div className={styles.cardInfo}>
                        <span className={styles.infoLabel}>
                          {progressaoVencida ? 'Progressão vencida há' : 'Falta para progressão'}
                        </span>
                        <span className={`${styles.infoValor} ${progressaoVencida ? styles.infoAlerta : ''}`}>
                          {diasFaltantes === null ? '—'
                            : progressaoVencida ? `${Math.abs(diasFaltantes)} dias`
                            : `${diasFaltantes} dias`}
                        </span>
                      </div>
                    </div>

                    {progressaoVencida && (
                      <div className={styles.alertaBox}>
                        ⚠ Data de progressão já passou — verificar situação do apenado
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
