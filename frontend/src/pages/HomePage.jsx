import { useNavigate } from 'react-router-dom'
import styles from './HomePage.module.css'

export default function HomePage() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
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
          <span className={styles.navLink} onClick={() => navigate('/apenados')}>Apenados</span>
          <span className={styles.navLink} onClick={() => navigate('/execucao')}>Nova Execução</span>
          <span className={styles.navLinkLogout} onClick={handleLogout}>Sair</span>
        </div>
      </nav>

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
