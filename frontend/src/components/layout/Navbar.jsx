import { useNavigate, useLocation } from 'react-router-dom'
import Logo from '../ui/Logo'
import styles from './Navbar.module.css'

export default function Navbar({ showLinks = false }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const isLogin = location.pathname === '/login'
  const isRegistrar = location.pathname === '/registrar'

  return (
    <nav className={styles.nav}>
      <div className={styles.accentBar} />
      <div className={styles.inner}>
        <div className={styles.logo} onClick={() => navigate(isLogin || isRegistrar ? '/login' : '/home')}>
          <Logo size={28} />
          <span className={styles.logoText}>Cal<span className={styles.logoPEC}>PEC</span></span>
        </div>
        <div className={styles.links}>
          {isRegistrar && (
            <span className={styles.link} onClick={() => navigate('/login')}>← Voltar ao login</span>
          )}
          {showLinks && (
            <>
              <span className={`${styles.link} ${location.pathname === '/apenados' ? styles.active : ''}`} onClick={() => navigate('/apenados')}>Apenados</span>
              <span className={`${styles.link} ${location.pathname === '/execucao' ? styles.active : ''}`} onClick={() => navigate('/execucao')}>Nova Execução</span>
              <span className={styles.linkLogout} onClick={handleLogout}>Sair</span>
            </>
          )}
          {!isLogin && !isRegistrar && !showLinks && (
            <span className={styles.link} onClick={() => navigate('/home')}>← Voltar</span>
          )}
        </div>
      </div>
    </nav>
  )
}
