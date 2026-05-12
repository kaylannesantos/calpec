import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import styles from './HomePage.module.css'

export default function HomePage() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div className={styles.root}>
      <div className={styles.bgPattern} />
      <Navbar showLinks />
      <div className={styles.body}>
        <div className={styles.welcome}>
          <h1 className={styles.title}>Bem-vindo, {user.nome?.split(' ')[0] || 'Usuário'}</h1>
          <p className={styles.subtitle}>O que deseja fazer hoje?</p>
        </div>
        <div className={styles.cards}>
          <div className={styles.card} onClick={() => navigate('/apenados')}>
            <div className={styles.cardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h2 className={styles.cardTitle}>Registrar Apenado</h2>
            <p className={styles.cardDesc}>Cadastre um novo condenado no sistema</p>
          </div>
          <div className={styles.card} onClick={() => navigate('/execucao')}>
            <div className={styles.cardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
              </svg>
            </div>
            <h2 className={styles.cardTitle}>Nova Execução Penal</h2>
            <p className={styles.cardDesc}>Calcule progressão, remição e detração</p>
          </div>
        </div>
      </div>
    </div>
  )
}
