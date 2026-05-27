import { useState } from 'react'
import styles from './Calculadora.module.css'

export default function Calculadora() {
  const [aberta, setAberta] = useState(false)
  const [expr, setExpr] = useState('')
  const [display, setDisplay] = useState('0')
  const [exprLabel, setExprLabel] = useState('')
  const [convValor, setConvValor] = useState('')
  const [convTipo, setConvTipo] = useState('dias') // 'dias' ou 'anos'
  const [convResult, setConvResult] = useState('—')

  const input = (v) => {
    const novaExpr = expr === '0' ? v : expr + v
    setExpr(novaExpr)
    setDisplay(novaExpr)
    setExprLabel('')
  }

  const limpar = () => {
    setExpr('')
    setDisplay('0')
    setExprLabel('')
  }

  const calcular = () => {
    try {
      const r = Function('"use strict"; return (' + expr + ')')()
      const resultado = parseFloat(r.toFixed(4))
      setExprLabel(expr + ' =')
      setDisplay(String(resultado))
      setExpr(String(resultado))
    } catch {
      setDisplay('Erro')
      setExpr('')
    }
  }

  const converter = (valor, tipo) => {
    setConvValor(valor)
    const v = parseFloat(valor) || 0
    if (!v) { setConvResult('—'); return }

    if (tipo === 'dias') {
      // Dias → Anos, Meses, Dias
      const anos = Math.floor(v / 360)
      const resto = v % 360
      const meses = Math.floor(resto / 30)
      const dias = resto % 30
      let txt = ''
      if (anos) txt += `${anos} ano(s) `
      if (meses) txt += `${meses} mês(es) `
      if (dias) txt += `${dias} dia(s)`
      setConvResult(txt || '0 dias')
    } else {
      // Anos + Meses → Dias
      const partes = valor.toString().split('.')
      const anos = parseInt(partes[0]) || 0
      const meses = parseInt(partes[1]) || 0
      const total = (anos * 360) + (meses * 30)
      setConvResult(`${total} dias`)
    }
  }

  const trocarTipo = (tipo) => {
    setConvTipo(tipo)
    setConvValor('')
    setConvResult('—')
  }

  return (
    <>
      <button className={styles.fab} onClick={() => setAberta(!aberta)} title="Calculadora" type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f1923" strokeWidth="2" strokeLinecap="round">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <line x1="8" y1="6" x2="16" y2="6"/>
          <line x1="8" y1="10" x2="10" y2="10"/>
          <line x1="12" y1="10" x2="14" y2="10"/>
          <line x1="16" y1="10" x2="16" y2="10"/>
          <line x1="8" y1="14" x2="10" y2="14"/>
          <line x1="12" y1="14" x2="14" y2="14"/>
          <line x1="8" y1="18" x2="10" y2="18"/>
          <line x1="12" y1="18" x2="14" y2="18"/>
          <line x1="16" y1="16" x2="16" y2="20"/>
        </svg>
      </button>

      {aberta && (
        <div className={styles.popup}>
          <div className={styles.header}>
            <span className={styles.title}>Calculadora</span>
            <button className={styles.close} onClick={() => setAberta(false)} type="button">✕</button>
          </div>

          <div className={styles.display}>
            <div className={styles.exprLabel}>{exprLabel}</div>
            <div className={styles.result}>{display}</div>
          </div>

          <div className={styles.grid}>
            <button className={`${styles.btn} ${styles.clear}`} onClick={limpar} type="button">C</button>
            <button className={`${styles.btn} ${styles.op}`} onClick={() => input('(')} type="button">(</button>
            <button className={`${styles.btn} ${styles.op}`} onClick={() => input(')')} type="button">)</button>
            <button className={`${styles.btn} ${styles.op}`} onClick={() => input('/')} type="button">÷</button>

            <button className={styles.btn} onClick={() => input('7')} type="button">7</button>
            <button className={styles.btn} onClick={() => input('8')} type="button">8</button>
            <button className={styles.btn} onClick={() => input('9')} type="button">9</button>
            <button className={`${styles.btn} ${styles.op}`} onClick={() => input('*')} type="button">×</button>

            <button className={styles.btn} onClick={() => input('4')} type="button">4</button>
            <button className={styles.btn} onClick={() => input('5')} type="button">5</button>
            <button className={styles.btn} onClick={() => input('6')} type="button">6</button>
            <button className={`${styles.btn} ${styles.op}`} onClick={() => input('-')} type="button">−</button>

            <button className={styles.btn} onClick={() => input('1')} type="button">1</button>
            <button className={styles.btn} onClick={() => input('2')} type="button">2</button>
            <button className={styles.btn} onClick={() => input('3')} type="button">3</button>
            <button className={`${styles.btn} ${styles.op}`} onClick={() => input('+')} type="button">+</button>

            <button className={styles.btn} onClick={() => input('0')} style={{gridColumn: 'span 2'}} type="button">0</button>
            <button className={styles.btn} onClick={() => input('.')} type="button">.</button>
            <button className={`${styles.btn} ${styles.eq}`} onClick={calcular} type="button">=</button>
          </div>

          <div className={styles.divider} />

          <p className={styles.convTitle}>Conversão de tempo (LEP)</p>

          <div className={styles.tipoRow}>
            <button
              type="button"
              className={`${styles.tipoBtn} ${convTipo === 'dias' ? styles.tipoBtnAtivo : ''}`}
              onClick={() => trocarTipo('dias')}
            >
              Dias → Anos
            </button>
            <button
              type="button"
              className={`${styles.tipoBtn} ${convTipo === 'anos' ? styles.tipoBtnAtivo : ''}`}
              onClick={() => trocarTipo('anos')}
            >
              Anos → Dias
            </button>
          </div>

          {convTipo === 'dias' ? (
            <>
              <div className={styles.convRow}>
                <input
                  className={styles.convInput}
                  type="number"
                  placeholder="Digite os dias"
                  value={convValor}
                  onChange={e => converter(e.target.value, 'dias')}
                />
                <span className={styles.convLabel}>dias</span>
              </div>
              <div className={styles.convResult}>{convResult}</div>
            </>
          ) : (
            <>
              <div className={styles.convRow}>
                <input
                  className={styles.convInput}
                  type="number"
                  placeholder="Anos"
                  value={convValor.split('.')[0] || ''}
                  onChange={e => {
                    const meses = convValor.split('.')[1] || '0'
                    const novo = `${e.target.value}.${meses}`
                    converter(novo, 'anos')
                    setConvValor(novo)
                  }}
                />
                <span className={styles.convLabel}>anos</span>
              </div>
              <div className={styles.convRow} style={{marginTop: '6px'}}>
                <input
                  className={styles.convInput}
                  type="number"
                  placeholder="Meses"
                  value={convValor.split('.')[1] || ''}
                  onChange={e => {
                    const anos = convValor.split('.')[0] || '0'
                    const novo = `${anos}.${e.target.value}`
                    converter(novo, 'anos')
                    setConvValor(novo)
                  }}
                />
                <span className={styles.convLabel}>meses</span>
              </div>
              <div className={styles.convResult}>{convResult}</div>
            </>
          )}
        </div>
      )}
    </>
  )
}
